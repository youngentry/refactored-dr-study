'use client';

import ConferenceControlBar from '@/components/organisms/ConferenceControlBar/ConferenceControlBar';
import ConferenceProgress from '@/components/organisms/ConferenceProgress/ConferenceProgress';
import ModeratorAvatar from '@/components/organisms/ModeratorAvatar/Mod';
import Signal from '@/components/organisms/Signal/Signal';
import React, { useState } from 'react';
import TotalSummary from '@/components/organisms/ModeratorAvatar/TotalSummary';
import { ConferenceData } from '@/interfaces/conference';
import useCheckLogin from './hooks/useCheckLogin';
import usePeerSetup from './hooks/usePeerSetup';
import useLocalStream from './hooks/useLocalStream';
import useCallAllPeers from './hooks/useCallAllPeers';
import useConnectStomp from './hooks/useConnectStomp';
import VideoGrid from '@/components/organisms/Video/VideoGrid';
import useInitConference from './hooks/useInitConference';

interface ConferenceTemplateProps {
    conferenceInfo: ConferenceData | null;
}

const ConferenceTemplate = ({ conferenceInfo }: ConferenceTemplateProps) => {
    // 로그인 체크
    const memberData = useCheckLogin();

    // 현재 회의에 참여중인 멤버 정보
    const [existingPeers, setExistingPeers] = useState<
        Record<string, MediaStream>
    >({});

    // 1. 회의실 상태 초기화
    useInitConference();
    // 2. 피어 설정
    const { isMyPeerInit, myPeer } = usePeerSetup();
    // 3. 로컬 스트림 설정
    const { isLocalStreamCreated, localStream } = useLocalStream({
        isMyPeerInit,
        setExistingPeers,
        myPeer,
    });
    // 4. Stomp 연결
    const { stompClientRef } = useConnectStomp({ isLocalStreamCreated });
    // 5. 방에 존재하는 모든 피어와 연결 후, 참여자 정보 반환
    const { isJoined, client, currentMembers, setCurrentMembers } =
        useCallAllPeers(
            isLocalStreamCreated,
            memberData,
            myPeer,
            conferenceInfo,
            setExistingPeers,
            localStream,
        );

    return (
        <div className="flex h-[100%] w-[100%] bg-[#191B28] border-b-[1px] border-dr-indigo-0">
            <div className="flex flex-col w-full h-full">
                <div className="fixed w-4/5 h-[11%] bg-[#191B28] border-b-[1px] border-dr-indigo-0">
                    <ConferenceProgress />
                </div>
                <div className="h-[11%]"></div>
                <div className="flex w-full h-[80%] bg-[#242736] border-b-[1px] border-dr-indigo-0">
                    <VideoGrid
                        existingPeers={existingPeers}
                        client={client.current}
                    />
                    <Signal
                        currentMembers={currentMembers}
                        setCurrentMembers={setCurrentMembers}
                        conferenceInfo={conferenceInfo}
                        client={client.current}
                        isJoined={isJoined}
                        existingPeers={existingPeers}
                        setExistingPeers={setExistingPeers}
                        stompClient={stompClientRef.current}
                        memberData={memberData}
                        conferenceId={conferenceInfo?.id || 0}
                    />
                </div>
                <div className="fixed left-0 bottom-0 w-4/5 h-[9%] z-30 bg-[#191B28] border-t-[1px] border-dr-indigo-0">
                    <ConferenceControlBar
                        client={client.current}
                        stompClient={stompClientRef.current}
                        conferenceId={conferenceInfo?.id || 0}
                        localStream={localStream.current}
                        existingPeers={existingPeers}
                        setExistingPeers={setExistingPeers}
                    />
                    <div className="fixed bottom-[9%] left-[40%] w-[10%] z-40 ">
                        <ModeratorAvatar conferenceInfo={conferenceInfo} />
                    </div>
                </div>
            </div>
            <TotalSummary />
        </div>
    );
};

export default ConferenceTemplate;
