import Peer from 'peerjs';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

interface useLocalStreamProps {
    isMyPeerInit: boolean;
    setExistingPeers: Dispatch<SetStateAction<Record<string, MediaStream>>>;
    myPeer: Peer | null;
}

// 스트림 생성 및 설정
const useLocalStream = ({
    isMyPeerInit,
    setExistingPeers,
    myPeer,
}: useLocalStreamProps) => {
    const localStreamRef = useRef<MediaStream | null>(null);

    const [isLocalStreamCreated, setIsLocalStreamCreated] = useState(false);

    useEffect(() => {
        if (!isMyPeerInit || !myPeer) return;

        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                localStreamRef.current = stream;
                setExistingPeers((prevPeers) => ({
                    ...prevPeers,
                    [myPeer.id]: stream,
                }));
                setIsLocalStreamCreated(true);
            })
            .catch((error) =>
                console.error('Error accessing media devices.', error),
            );

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current
                    .getTracks()
                    .forEach((track) => track.stop());
            }
        };
    }, [isMyPeerInit]);

    return {
        isLocalStreamCreated,
        localStreamRef,
    };
};

export default useLocalStream;
