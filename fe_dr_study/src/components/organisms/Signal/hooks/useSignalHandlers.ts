import {
    ClientInterface,
    SignalMember,
} from '@/components/template/conference/hooks/useCallAllPeers';
import { setAvatarDialogue } from '@/store/slices/avatarDialogueSlice';
import { setFocusingId } from '@/store/slices/conferenceFocusingPeerIdSlice';
import {
    setFullPhase,
    setNextStep,
} from '@/store/slices/conferenceProgressSlice';
import { setGptSummaryBySystem } from '@/store/slices/gptSummaryBySystemSlice';
import { setIsAvatarSpeaking } from '@/store/slices/isAvatarSpeakingSlice';
import { setIsMutedBySystem } from '@/store/slices/isMutedBySystemSlice';
import { pushSummaryMessages } from '@/store/slices/summaryMessagesSlice';
import { setTimeForAudioRecord } from '@/store/slices/timeForAudioRecord';
import { setTimeForAvatarSpeaking } from '@/store/slices/timeForAvatarSpeakingSlice';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Client } from 'stompjs';

export interface Message {
    id: number;
    nickname: string;
    messageForm: string;
    imageUrl: string;
    time: string;
}

interface SignalInterface {
    id?: number;
    time?: number; // 발화 시간 또는 아바타 움직임 시간
    content?: string; // GPT 요약
    peerId?: string; // 방송 종료 시 peerId
    next?: number; // 다음 발화자
    programme?: any;
    imageUrl?: string;
    nickname?: string;
    phase?: number;
}

const CHANNEL = 'topic'; // 채널 이름
const SIGNAL_TYPES = {
    JOINING: 'joining',
    MUTE: 'mute',
    UNMUTE: 'unmute',
    PARTICIPANT_SPEAK: 'participant-speak',
    AVATAR_SPEAK: 'avatar-speak',
    NEXT_STEP: 'next-step',
    HEARTSTOP: 'heartstop',
    PROGRAMME: 'programme',
    AVATAR_DIALOGUE: 'avatar-dialogue',
    GPT_SUMMARY: 'gpt-summary',
    QUIT: 'quit',
};

const useSignalHandlers = (
    stompClient: Client,
    conferenceId: number,
    setCurrentMembers: Dispatch<SetStateAction<SignalMember[]>>,
    setExistingPeers: Dispatch<SetStateAction<Record<string, MediaStream>>>,
    client: ClientInterface,
    isJoined: boolean,
    memberData?: SignalMember,
) => {
    const dispatch = useDispatch();
    const router = useRouter();

    const [messageForm, setMessageForm] = useState<string>(''); // 사용자가 입력한 메시지를 저장하는 상태
    const [chatList, setMessages] = useState<Message[]>([]); // 수신된 메시지 목록을 저장하는 상태
    const [isStartRecordingAudio, setIsStartRecordingAudio] =
        useState<number>(0); // 오디오 스트림 시작 신호

    const messagesEndRef = useRef<HTMLDivElement>(null); // 메시지 목록 끝에 대한 참조

    // 채팅 메시지 수신을 위한 구독 설정
    const generateUrl = (type: string) => `/${CHANNEL}/${type}/${conferenceId}`;
    const subscribeToMessages = () => {
        stompClient.subscribe(generateUrl('chat'), (messageForm: any) => {
            const newMessage: Message = JSON.parse(messageForm.body); // 수신된 메시지 파싱
            setMessages((prevMessages) => [...prevMessages, newMessage]); // 수신된 메시지를 메시지 목록에 추가

            if (messagesEndRef.current) {
                messagesEndRef.current.scrollTop =
                    messagesEndRef.current.scrollHeight;
            }
        });
    };

    // 신호 수신을 위한 구독 설정
    const subscribeToSignals = () => {
        signalHandlers.forEach(({ type, handler }) => {
            subscribeToSignal(type, handler);
        });
    };

    // 신호 수신을 위한 구독 함수
    const subscribeToSignal = (
        signalType: string,
        handler: (signal: any) => void,
    ) => {
        stompClient.subscribe(
            generateUrl(`signal/${signalType}`),
            (signal: any) => {
                const newSignal: SignalInterface = JSON.parse(signal.body); // 수신된 신호 파싱
                handler(newSignal); // 각 신호에 맞는 핸들러 호출
            },
        );
    };

    // handleQuit 신호 처리
    const handleQuitSignal = () => {
        console.log('handleQuitSignal 호출');
        router.push(
            `/conference/${conferenceId}/waiting-room?error=finished_conference`,
        );
    };

    // Mute 신호 처리
    const handleMuteSignal = (newSignal: SignalInterface) => {
        if (newSignal.id === memberData?.id) {
            dispatch(setIsMutedBySystem(true));
        }
    };

    // Unmute 신호 처리
    const handleUnmuteSignal = (newSignal: SignalInterface) => {
        if (newSignal.id === memberData?.id) {
            dispatch(setIsMutedBySystem(false));
        }
    };

    // 발화 신호 처리
    const handleParticipantSpeakSignal = (newSignal: SignalInterface) => {
        // newSignal.id 라는 멤버 아이디를 가진 사람의 피어 아이디를 focusingPeerId
        console.log('newSignal.time => ', newSignal.time, 'ms');
        if (client.memberId.toString() === newSignal.id?.toString()) {
            dispatch(setTimeForAudioRecord(newSignal.time as number));
            dispatch(setFocusingId(newSignal.peerId as string));
            setIsStartRecordingAudio((prev) => prev + 1); // 오디오 녹음 시작
        }
    };

    // 아바타 발화 신호 처리
    const handleAvatarSpeakSignal = (newSignal: SignalInterface) => {
        dispatch(setIsAvatarSpeaking(true));
        dispatch(setTimeForAvatarSpeaking(newSignal.time));

        setTimeout(() => {
            dispatch(setIsAvatarSpeaking(false));
            dispatch(setTimeForAvatarSpeaking(0));
        }, newSignal.time as number);
    };

    // 아바타 현재 발화 신호 처리
    const handleAvatarDialogueSignal = (newSignal: SignalInterface) => {
        dispatch(setAvatarDialogue(newSignal.content as string));
    };

    // 다음 발화자 신호 처리
    const handleNextStepSignal = (newSignal: SignalInterface) => {
        if (newSignal) dispatch(setNextStep());
    };

    // 신호 단계 신호 처리
    const handleProgramme = (newSignal: SignalInterface) => {
        dispatch(setFullPhase({ programme: newSignal.programme }));
    };

    // joining 단계 신호 처리
    const handleJoining = (newSignal: SignalInterface) => {
        setCurrentMembers((prevMembers): SignalMember[] => [
            ...prevMembers,
            {
                id: newSignal.id as number, // 이제 id는 number임이 보장됨
                imageUrl: newSignal.imageUrl || null, // imageUrl이 undefined일 경우 null로 설정
                nickname: newSignal.nickname || '', // nickname이 undefined일 경우 빈 문자열로 설정
            },
        ]);
    };

    // 스트림 연결 종료 신호 처리
    const handleHeartstop = (newSignal: SignalInterface) => {
        setExistingPeers((existingPeers) => {
            const newPeers = { ...existingPeers };
            delete newPeers[newSignal.peerId as string];
            return newPeers;
        });

        setCurrentMembers((currentMembers) =>
            currentMembers.filter((member) => member.id !== newSignal.id),
        );
    };

    // 메시지 전송 함수
    const sendMessage = () => {
        // 메시지가 없을 경우 아무 동작도 하지 않음
        if (!messageForm.trim() || messageForm.length < 1) return;

        const messageData = {
            id: memberData?.id, // 송신자 ID
            messageForm: messageForm.trim(), // 송신할 메시지
            nickname: memberData?.nickname, // 송신자 닉네임
            imageUrl: memberData?.imageUrl, // 송신자 이미지 URL
            time: new Date(), // 송신 시간
        };

        stompClient.send(
            `/pub/chat/${conferenceId}`,
            {}, // 헤더
            JSON.stringify(messageData), // 바디
        );
        setMessageForm(''); // 메시지 입력 필드 초기화
    };

    // GPT 요약 신호 처리
    const handleGPTSummarySignal = (newSignal: SignalInterface) => {
        dispatch(setGptSummaryBySystem(newSignal.content as string));
        dispatch(
            pushSummaryMessages({
                messageForm: newSignal.content || '[올바르지 않은 문자열]',
                time: new Date().toLocaleTimeString(),
            }),
        );
    };

    const signalHandlers = [
        { type: SIGNAL_TYPES.JOINING, handler: handleJoining },
        { type: SIGNAL_TYPES.MUTE, handler: handleMuteSignal },
        { type: SIGNAL_TYPES.UNMUTE, handler: handleUnmuteSignal },
        {
            type: SIGNAL_TYPES.PARTICIPANT_SPEAK,
            handler: handleParticipantSpeakSignal,
        },
        { type: SIGNAL_TYPES.AVATAR_SPEAK, handler: handleAvatarSpeakSignal },
        { type: SIGNAL_TYPES.NEXT_STEP, handler: handleNextStepSignal },
        { type: SIGNAL_TYPES.HEARTSTOP, handler: handleHeartstop },
        { type: SIGNAL_TYPES.PROGRAMME, handler: handleProgramme },
        {
            type: SIGNAL_TYPES.AVATAR_DIALOGUE,
            handler: handleAvatarDialogueSignal,
        },
        { type: SIGNAL_TYPES.GPT_SUMMARY, handler: handleGPTSummarySignal },
        { type: SIGNAL_TYPES.QUIT, handler: handleQuitSignal },
    ];

    useEffect(() => {
        // 소켓 연결
        const connectSocket = () => {
            stompClient.connect(
                { memberId: memberData?.id, roomId: conferenceId },
                () => {
                    if (stompClient.connected) {
                        subscribeToMessages();
                        subscribeToSignals();
                    }
                },
            );
        };
        if (isJoined) {
            connectSocket();
        }
    }, [isJoined]);

    return {
        sendMessage,
        messageForm,
        setMessageForm,
        messagesEndRef,
        chatList,
        isStartRecordingAudio,
        setIsStartRecordingAudio,
    };
};

export default useSignalHandlers;
