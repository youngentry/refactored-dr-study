import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import Recorder from './Recorder';
import { Button } from '@/components/atoms';
import Icon from '@/components/atoms/Icon/Icon';
import { Client } from 'stompjs';
import { ConferenceData } from '@/interfaces/conference';
import Chats from './Chats';
import ConferenceParticipants from './ConferenceParticipants';
import { Member } from '@/app/group/[group_id]/_types';
import ConferenceStartAndCloseButtons from '../ConferenceStartAndCloseButtons/ConferenceStartAndCloseButtons';
import FinishMyTurnButton from './FinishMyTurnButton';
import {
    ClientInterface,
    SignalMember,
} from '@/components/template/conference/hooks/useCallAllPeers';
import useSignalHandlers from './hooks/useSignalHandlers';

export interface JoiningMember {
    id: number;
    nickname: string;
    imageUrl: string | null;
}

interface SignalProps {
    currentMembers: Member[];
    setCurrentMembers: Dispatch<SetStateAction<SignalMember[]>>;
    conferenceInfo: ConferenceData | null;
    client: ClientInterface;
    isJoined: boolean;
    existingPeers: Record<string, MediaStream>;
    setExistingPeers: Dispatch<SetStateAction<Record<string, MediaStream>>>;
    stompClient: Client | null;
    memberData?: any;
    conferenceId: number;
}

const Signal = ({
    currentMembers,
    setCurrentMembers,
    conferenceInfo,
    client,
    setExistingPeers,
    stompClient,
    conferenceId,
    memberData,
}: SignalProps) => {
    const [isFinishMyTurn, setIsFinishMyTurn] = useState<boolean>(false); // 내 발화 차례 종료 신호

    const {
        sendMessage,
        messageForm, // 입력한 메시지 input
        setMessageForm,
        chatList, // 채팅창
        messagesEndRef, // 채팅창 스크롤 위치
        isStartRecordingAudio, // 오디오 녹음 시작 신호
        setIsStartRecordingAudio,
    } = useSignalHandlers(
        stompClient,
        conferenceId,
        setCurrentMembers,
        setExistingPeers,
        client,
        memberData,
    );

    return (
        <div className="flex flex-col w-1/5 h-full bg-[#1C1F2E] border-t-[1px] border-dr-indigo-0">
            <div className="relative w-full h-[90%] text-dr-white ">
                <div className="pb-[0.1rem] shadow-xl">
                    <ConferenceParticipants currentMembers={currentMembers} />
                </div>
                <div className="h-[20%] "></div>
                <div
                    ref={messagesEndRef}
                    className="flex flex-col h-[80%] w-full overflow-y-scroll"
                >
                    <Chats chatList={chatList} />
                </div>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                }}
                className="relative flex h-[11%] gap-dr-10  p-[0.5rem]"
            >
                <textarea
                    value={messageForm}
                    onChange={(e) => setMessageForm(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            if (e.shiftKey) {
                                return;
                            } else {
                                e.preventDefault(); // 기본 줄바꿈 방지
                                sendMessage(); // 메시지 제출
                            }
                        }
                    }}
                    placeholder="메시지를 입력해주세요."
                    className="pr-[15%] bg-[#2c3047] border w-full border-slate-500 rounded-md p-2 text-slate-300 text-dr-body-4 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all duration-300"
                />
                <Button
                    classNameStyles="absolute right-0 bottom-0 bg-transparent "
                    onClick={sendMessage}
                    size="sm"
                >
                    <Icon
                        icon="send"
                        size="sm"
                        shape="contained"
                        className="hover:bg-transparent transition-colors duration-300"
                    />
                </Button>
            </form>

            <div className="fixed left-[3rem] bottom-[5rem] p-3 text-slate-300 rounded-xl bg-dr-black bg-opacity-40">
                <Recorder
                    conferenceId={conferenceId}
                    memberId={memberData?.id}
                    stompClient={stompClient}
                    isStartRecordingAudio={isStartRecordingAudio}
                    isFinishMyTurn={isFinishMyTurn}
                    setIsStartRecordingAudio={setIsStartRecordingAudio}
                />
            </div>

            <div className="fixed flex bottom-[3px] right-[3px] p-3 rounded-xl  bg-opacity-40">
                <ConferenceStartAndCloseButtons
                    conferenceInfo={conferenceInfo}
                />
            </div>
            <div className="absolute right-[21%] bottom-[11%] ">
                <FinishMyTurnButton setIsFinishMyTurn={setIsFinishMyTurn} />
            </div>
        </div>
    );
};

export default Signal;
