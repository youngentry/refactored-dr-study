import { POST } from '@/app/api/routeModule';
import {
    Dispatch,
    RefObject,
    SetStateAction,
    useEffect,
    useRef,
    useState,
} from 'react';
import { conferenceAPI as API } from '@/app/api/axiosInstanceManager';
import { ConferenceData } from '@/interfaces/conference';
import Peer from 'peerjs';
import { useRouter } from 'next/router';
import { IMemberData } from '@/interfaces/members';

export interface ClientInterface {
    memberId: number;
    peerId: string;
    streamId: string;
}

const useCallAllPeers = (
    isLocalStreamCreated: boolean,
    memberData: IMemberData,
    myPeer: Peer | null,
    conferenceInfo: ConferenceData | null,
    setExistingPeers: Dispatch<SetStateAction<Record<string, MediaStream>>>,
    localStream: RefObject<MediaStream | null>,
) => {
    const router = useRouter();

    const [isJoined, setIsJoined] = useState<boolean>(false); // 방에 조인되었는지 여부

    const [existingPeerIds, setExistingPeerIds] = useState<string[]>([]); // 현재 방에 있는 피어들의 ID

    // 현재 멤버
    const [currentMembers, setCurrentMembers] = useState<any[]>([
        {
            id: memberData?.id,
            nickname: memberData.nickname,
            imageUrl: memberData.imageUrl,
        },
    ]);

    const client = useRef<ClientInterface>({
        memberId: memberData.id, // 멤버 ID
        peerId: myPeer?.id || '', // 피어 ID
        streamId: localStream.current?.id as string, // 스트림 ID
    });

    const makeCall = (remotePeerId: string) => {
        if (!myPeer || !localStream.current) return;

        const call = myPeer.call(remotePeerId, localStream.current); // 피어에게 전화 걸기

        // 전화 수락 후 스트림 수신 처리
        call.answer(localStream.current);
        call.on('stream', (remoteStream: MediaStream) => {
            setExistingPeers((prevPeers) => ({
                ...prevPeers,
                [remotePeerId]: remoteStream, // 새로 수신된 스트림을 기존 peers에 추가
            }));
        });
    };

    useEffect(() => {
        try {
            const getRoomPeerData = async (
                conferenceId: number | undefined,
            ) => {
                const response = await POST({
                    API: API,
                    endPoint: `${conferenceId}/join`,
                    body: { myPeer: myPeer?.id },
                    isAuth: true,
                });
                return response.data;
            };

            (async () => {
                const roomPeerData = await getRoomPeerData(conferenceInfo?.id);

                setCurrentMembers((prevMembers) => [
                    ...prevMembers,
                    ...roomPeerData.existingMembers,
                ]);

                roomPeerData.existingPeerIds.forEach((remotePeerId: string) =>
                    makeCall(remotePeerId),
                );

                setIsJoined(true);
                setExistingPeerIds([
                    ...existingPeerIds,
                    ...roomPeerData.existingPeerIds,
                ]); // 방에 존재하는 peerIds 저장
            })();
        } catch (error) {
            console.error('Error joining conference:', error);
            if (!conferenceInfo?.openTime) {
                // 컨퍼런스가 개최되지 않았을 때
                router.push(
                    `/conference/${conferenceInfo?.id}/waiting-room?error=not_open`,
                );
            } else {
                // 회의 참여 실패 시
                router.push(
                    `/conference/${conferenceInfo?.id}/waiting-room?error=join_failed`,
                );
            }
        }
        // 방 나갈때 연결 종료하기
        return () => {
            // 로컬 스트림 연결 종료
            if (localStream.current) {
                localStream.current
                    .getTracks()
                    .forEach((track) => track.stop());
            }

            // 피어 연결 종료
            if (myPeer) {
                myPeer.destroy();
            }
        };
    }, [isLocalStreamCreated]);

    return {
        isJoined,
        client,
        currentMembers,
        setCurrentMembers,
    };
};

export default useCallAllPeers;
