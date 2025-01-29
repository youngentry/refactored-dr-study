import { RefObject, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

interface useConnectStompProps {
    isLocalStreamCreated: boolean;
}

const useConnectStomp = ({ isLocalStreamCreated }: useConnectStompProps) => {
    const stompClientRef = useRef<any>(null);

    // 서버와 연결 설정
    useEffect(() => {
        if (!isLocalStreamCreated) return;

        const socket = new SockJS(`${process.env.NEXT_PUBLIC_HOST}/room`);
        const stompClient = Stomp.over(socket);

        stompClientRef.current = stompClient;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.disconnect(() => {
                    console.log('Disconnected from conference');
                });
            }
        };
    }, [isLocalStreamCreated]);

    return { stompClientRef };
};

export default useConnectStomp;
