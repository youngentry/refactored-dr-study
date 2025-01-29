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
    const localStream = useRef<MediaStream | null>(null);

    const [isLocalStreamCreated, setIsLocalStreamCreated] = useState(false);

    useEffect(() => {
        if (!isMyPeerInit || !myPeer) return;

        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                localStream.current = stream;
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
            if (localStream.current) {
                localStream.current
                    .getTracks()
                    .forEach((track) => track.stop());
            }
        };
    }, [isMyPeerInit]);

    return {
        isLocalStreamCreated,
        localStream,
    };
};

export default useLocalStream;
