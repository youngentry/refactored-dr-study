import { Stomp } from '@stomp/stompjs';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Frame } from 'stompjs';
import Recorder from './Recorder';
import { Button } from '@/components/atoms';

interface Message {
    id: number;
    message: string;
}

interface Signal {
    id?: number;
    time?: number; // 발화 시간 또는 아바타 움직임 시간
    content?: string; // GPT 요약
}

interface SignalProps {
    conferenceId: number;
    memberId: number;
    setIsMutedBySystem: Dispatch<SetStateAction<boolean>>;
}

const openConsoleLogs = false;

const Signal = ({
    conferenceId = 1,
    memberId = 1,
    setIsMutedBySystem,
}: SignalProps) => {
    const CHANNEL = 'topic'; // 채널 이름

    const [message, setMessage] = useState<string>(''); // 사용자가 입력한 메시지를 저장하는 상태
    const [messages, setMessages] = useState<Message[]>([]); // 수신된 메시지 목록을 저장하는 상태
    const [sendingSignal, setSendingSignal] = useState<Signal>({}); // 송신할 신호를 저장하는 상태
    const [signals, setSignals] = useState<Signal[]>([]); // 수신된 신호 목록을 저장하는 상태

    const [stompClient, setStompClient] = useState<any>(null); // Stomp 클라이언트 상태

    // 소켓 생성 및 Stomp 클라이언트 생성
    useEffect(() => {
        const socket = new SockJS('http://192.168.100.77:8080/room'); // SockJS 소켓 생성

        const clientStomp = Stomp.over(socket); // Stomp 클라이언트 생성

        setStompClient(clientStomp); // 생성한 Stomp 클라이언트 상태에 저장
    }, []);

    // 소켓 연결 및 메시지 수신
    useEffect(() => {
        stompClient?.connect({}, (frame: Frame) => {
            openConsoleLogs &&
                console.log('Connected: ' + `/${CHANNEL}/chat/${conferenceId}`); // 연결 확인 로그

            // 채팅 메시지를 수신하여 채팅방에 띄우기
            stompClient?.subscribe(
                `/${CHANNEL}/chat/${conferenceId}`,
                (message: any) => {
                    const newMessage: Message = JSON.parse(message.body); // 수신된 메시지 파싱
                    openConsoleLogs && console.log('message received:');
                    Object.entries(newMessage).forEach(([key, value]) => {
                        openConsoleLogs && console.log(`${key}: ${value}`); // 수신된 메시지 로그
                    });
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        newMessage,
                    ]); // 수신된 메시지를 메시지 목록에 추가
                },
            );

            // Mute 신호를 수신하여 대상 id를 찾아 mute
            stompClient?.subscribe(
                `/${CHANNEL}/signal/${conferenceId}/mute`,
                (signal: any) => {
                    const newSignal: Signal = JSON.parse(signal.body); // 수신된 신호 파싱
                    openConsoleLogs && console.log('mute signal received:');
                    Object.entries(newSignal).forEach(([key, value]) => {
                        openConsoleLogs && console.log(`${key}: ${value}`); // 수신된 신호 로그
                    });
                    setSignals((prevSignals) => [...prevSignals, newSignal]); // 수신된 신호를 신호 목록에 추가
                    openConsoleLogs && console.log(...messages, newSignal); // 현재 메시지 목록과 새 신호 로그

                    newSignal.id === memberId && setIsMutedBySystem(true); // mute 상태로 변경
                },
            );

            // Unmute 신호 수신하여 대상 id를 찾아 unmute
            stompClient?.subscribe(
                `/${CHANNEL}/signal/${conferenceId}/unmute`,
                (signal: any) => {
                    const newSignal: Signal = JSON.parse(signal.body); // 수신된 신호 파싱
                    openConsoleLogs && console.log('unmute signal received:');
                    Object.entries(newSignal).forEach(([key, value]) => {
                        openConsoleLogs && console.log(`${key}: ${value}`); // 수신된 신호 로그
                    });
                    setSignals((prevSignals) => [...prevSignals, newSignal]); // 수신된 신호를 신호 목록에 추가
                    openConsoleLogs && console.log(...messages, newSignal); // 현재 메시지 목록과 새 신호 로그

                    newSignal.id === memberId && setIsMutedBySystem(false); // unmute 상태로 변경
                },
            );

            // 발화 신호 수신
            stompClient?.subscribe(
                `/${CHANNEL}/signal/${conferenceId}/participant-speak`,
                (signal: any) => {
                    const newSignal: Signal = JSON.parse(signal.body); // 수신된 신호 파싱
                    openConsoleLogs &&
                        console.log('participant-speak signal received:');
                    Object.entries(newSignal).forEach(([key, value]) => {
                        openConsoleLogs && console.log(`${key}: ${value}`); // 수신된 신호 로그
                    });
                    setSignals((prevSignals) => [...prevSignals, newSignal]); // 수신된 신호를 신호 목록에 추가
                    openConsoleLogs && console.log(...messages, newSignal); // 현재 메시지 목록과 새 신호 로그
                },
            );
            // avatar-speak 오디오 재생
            stompClient?.subscribe(
                `/${CHANNEL}/signal/${conferenceId}/avatar-speak`,
                (signal: any) => {
                    const newSignal: Signal = JSON.parse(signal.body); // 수신된 신호 파싱
                    openConsoleLogs &&
                        console.log('avatar-speak signal received:'); // 신호 수신 로그
                    Object.entries(newSignal).forEach(([key, value]) => {
                        openConsoleLogs && console.log(`${key}: ${value}`); // 신호 내용 로그
                    });
                    setSignals((prevSignals) => [...prevSignals, newSignal]); // 신호 목록에 추가
                    openConsoleLogs && console.log(...messages, newSignal); // 현재 메시지 목록과 새 신호 로그
                },
            );

            // gpt-summary 신호 수신하여 요약 보여주기
            stompClient?.subscribe(
                `/${CHANNEL}/signal/${conferenceId}/gpt-summary`,
                (signal: any) => {
                    const newSignal: Signal = JSON.parse(signal.body); // 수신된 신호 파싱
                    openConsoleLogs &&
                        console.log('gpt-summary signal received:'); // 신호 수신 로그
                    Object.entries(newSignal).forEach(([key, value]) => {
                        openConsoleLogs && console.log(`${key}: ${value}`); // 신호 내용 로그
                    });
                    setSignals((prevSignals) => [...prevSignals, newSignal]); // 신호 목록에 추가
                    openConsoleLogs && console.log(...messages, newSignal); // 현재 메시지 목록과 새 신호 로그
                },
            );

            // next-step 신호 수신하여 다음 발화자로 넘기기
            stompClient?.subscribe(
                `/${CHANNEL}/signal/${conferenceId}/next-step`,
                (signal: any) => {
                    const newSignal: Signal = JSON.parse(signal.body); // 수신된 신호 파싱
                    openConsoleLogs &&
                        console.log('next-step signal received:'); // 신호 수신 로그
                    Object.entries(newSignal).forEach(([key, value]) => {
                        openConsoleLogs && console.log(`${key}: ${value}`); // 신호 내용 로그
                    });
                    setSignals((prevSignals) => [...prevSignals, newSignal]); // 신호 목록에 추가
                    openConsoleLogs && console.log(...messages, newSignal); // 현재 메시지 목록과 새 신호 로그
                },
            );

            // death-signal 신호 수신하여 해당 id 찾아 방송 종료
            stompClient?.subscribe(
                `/${CHANNEL}/signal/${conferenceId}/death-signal`,
                (signal: any) => {
                    const newSignal: Signal = JSON.parse(signal.body); // 수신된 신호 파싱
                    openConsoleLogs &&
                        console.log('death-signal signal received:'); // 신호 수신 로그
                    Object.entries(newSignal).forEach(([key, value]) => {
                        openConsoleLogs && console.log(`${key}: ${value}`); // 신호 내용 로그
                    });
                    setSignals((prevSignals) => [...prevSignals, newSignal]); // 신호 목록에 추가
                    openConsoleLogs && console.log(...messages, newSignal); // 현재 메시지 목록과 새 신호 로그
                },
            );
        });
    }, [stompClient]);

    // 메시지 전송 함수
    const sendMessage = () => {
        if (stompClient) {
            // Stomp 클라이언트가 존재할 때
            stompClient?.send(
                `/pub/chat/${conferenceId}`, // 메시지를 보낼 경로
                {},
                JSON.stringify({
                    id: memberId, // 송신자 ID
                    message, // 송신할 메시지
                }),
            );
            setMessage(''); // 메시지 입력 필드 초기화
        }
    };

    // 10초마다 생존 신고
    const sendHeartbeat = (memberId: number) => {
        if (stompClient) {
            // Stomp 클라이언트가 존재할 때
            stompClient?.send(
                `/pub/signal/${conferenceId}/heartbeat`, // 메시지를 보낼 경로
                {},
                JSON.stringify({
                    id: memberId, // 송신자 ID
                }),
            );
            setMessage(''); // 메시지 입력 필드 초기화
        }
    };

    return (
        <div className="flex flex-col h-[100%] bg-dr-gray-100">
            <div className="flex h-full w-full">
                <div className="h-full w-full bg-dr-coral-50">
                    {messages.map((msg, index) => (
                        <div key={index}>
                            ({msg.id}) : {msg.message}
                        </div>
                    ))}
                </div>
                <div className="h-full w-full bg-dr-coral-300">
                    {signals.map((msg, index) => (
                        <div key={index}>
                            <div>Id : {msg.id || 'no id'}</div>
                            <div>Time : {msg.time || 'no time'}</div>
                            <div>Content : {msg.content || 'no content'}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex">
                <div className="p-4">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter message"
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            </div>

            <div className="fixed left-32 bottom-32 bg-dr-gray-200">
                <Recorder
                    conferenceId={conferenceId}
                    memberId={memberId}
                    stompClient={stompClient}
                />
            </div>
        </div>
    );
};

export default Signal;
