import { RefObject, useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

const usePeerSetup = () => {
    const myPeer = useRef<Peer | null>(null);
    const [isMyPeerInit, setIsMyPeerInit] = useState<boolean>(false);

    useEffect(() => {
        myPeer.current = new Peer();
        setIsMyPeerInit(true);

        return () => {
            if (myPeer.current) {
                myPeer.current.destroy();
            }
        };
    }, []);

    return { isMyPeerInit, myPeer: myPeer.current };
};

export default usePeerSetup;
