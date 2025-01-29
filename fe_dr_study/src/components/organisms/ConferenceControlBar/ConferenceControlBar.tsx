'use client';

import Icon from '@/components/atoms/Icon/Icon';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';
import { useSelector } from 'react-redux';
import { Timer } from '../ConferenceProgress/ConferenceProgress';
import { ClientInterface } from '@/components/template/conference/hooks/useCallAllPeers';

interface ConferenceControlBarProps {
    client: ClientInterface;
    stompClient: any;
    localStream: MediaStream | null;
    existingPeers: Record<string, MediaStream>;
    setExistingPeers: Dispatch<SetStateAction<Record<string, MediaStream>>>;
    conferenceId: number;
}

const ConferenceControlBar = ({
    stompClient,
    localStream,
}: ConferenceControlBarProps) => {
    const router = useRouter();

    const isMutedBySystem = useSelector(
        (state: RootState) => state.isMutedBySystem.isMutedBySystem,
    );

    const [videoEnabled, setVideoEnabled] = useState(true); // 비디오 상태
    const [audioEnabled, setAudioEnabled] = useState(true); // 오디오 상태

    // 비디오 토글 핸들러
    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setVideoEnabled((prev) => !prev);
        }
    };

    // 오디오 토글 핸들러
    const toggleAudio = () => {
        if (!isMutedBySystem && localStream) {
            localStream.getAudioTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setAudioEnabled((prev) => !prev);
        }
    };

    // 통화 종료 기능
    const handleDisconnectAll = async () => {
        try {
            // 연결 종료
            stompClient.disconnect(() => {
                console.log('연결 종료');
            });
        } catch (error) {
            console.error('컨퍼런스 나가기 실패:', error);
        } finally {
            router.push(`/`);
        }
    };

    return (
        <div className="relative z-50 flex justify-center bg-[#191B28]  gap-dr-10 h-full border-t-[1px] border-dr-indigo-0">
            <Timer />
            <button className="cursor-auto" onClick={toggleVideo}>
                {videoEnabled ? (
                    <Icon
                        cursor="pointer"
                        size="md"
                        hover="blue"
                        bg="blue"
                        text="white"
                        icon="videoOn"
                    />
                ) : (
                    <Icon
                        cursor="pointer"
                        size="md"
                        hover="blue"
                        bg="blue"
                        text="white"
                        icon="videoOff"
                    />
                )}
            </button>
            <button onClick={toggleAudio} className="relative group">
                {audioEnabled ? (
                    <>
                        {isMutedBySystem && (
                            <span className="tooltip-text absolute hidden group-hover:block bg-black text-white text-xs rounded py-1 px-3 -mt-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                시스템에 의해 제어할 수 없는 상태입니다.
                            </span>
                        )}
                        <Icon
                            cursor="pointer"
                            disabled={isMutedBySystem}
                            size="md"
                            hover="blue"
                            bg="blue"
                            text="white"
                            icon={isMutedBySystem ? 'micOff' : 'micOn'}
                        />
                    </>
                ) : (
                    <Icon
                        cursor="pointer"
                        size="md"
                        hover="blue"
                        bg="blue"
                        text="white"
                        icon="micOff"
                    />
                )}
            </button>

            <button className="cursor-auto" onClick={handleDisconnectAll}>
                <Icon
                    cursor="pointer"
                    icon="phoneCall"
                    text="white"
                    bg="red"
                    size="md"
                />
            </button>
        </div>
    );
};

export default ConferenceControlBar;
