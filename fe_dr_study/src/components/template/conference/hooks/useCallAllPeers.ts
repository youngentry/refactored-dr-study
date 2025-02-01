import { POST } from '@/app/api/routeModule';
import {
    Dispatch,
    RefObject,
    SetStateAction,
    useCallback,
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

export interface SignalMember {
    id: number;
    imageUrl: string | null;
    nickname: string;
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
    const [currentMembers, setCurrentMembers] = useState<any[]>([
        // 참여 중인 멤버 정보
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

    const makeCall = useCallback(
        (remotePeerId: string) => {
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
        },
        [myPeer, localStream],
    );

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

                reconnectPeer(myPeer as Peer); // Peer 끊긴 경우에는 재연결 시도
                roomPeerData.existingPeerIds.forEach((remotePeerId: string) => {
                    makeCall(remotePeerId);
                });

                setCurrentMembers((prevMembers) => [
                    ...prevMembers,
                    ...roomPeerData.existingMembers,
                ]); // 멤버 정보 저장
                setIsJoined(true); // 방 참여 완료
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

const reconnectPeer = (myPeer: Peer) => {
    const RECONNECT_TIME = 3000; // 재연결 시도 간격 (ms)

    let reconnect_count = 5; // 최대 재연결 시도 횟수
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const attemptReconnect = () => {
        if (reconnect_count <= 0) {
            console.warn('Peer 재연결 실패. 페이지를 새로고침해 주세요.');
            return;
        }

        reconnect_count -= 1;
        console.error(`Peer 재연결 시도 중 (남은 횟수: ${reconnect_count})`);
        try {
            myPeer.reconnect();
        } catch (error) {
            console.error('Peer 재연결 실패:', error);
        }
    };

    // 연결 성공 시 setInterval 초기화
    myPeer.on('open', (id) => {
        console.log(`Peer 연결 성공 => ID: ${id}`);
        reconnect_count = 5; // 재연결 횟수 초기화

        // 기존의 재연결 타이머가 있다면 제거
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
    });

    // 연결이 끊어졌을 때 자동 재연결 시도
    myPeer.on('disconnected', () => {
        if (!myPeer.destroyed) {
            console.warn('Peer 연결이 끊어졌습니다. 재연결을 시도합니다.');

            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
            reconnectTimeout = setTimeout(attemptReconnect, RECONNECT_TIME);
        } else {
            console.error('Peer가 완전히 종료되어 재연결할 수 없습니다.');
        }
    });
};

export default useCallAllPeers;
