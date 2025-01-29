import React from 'react';
import Video from '@/components/organisms/Video/Video';
import { ClientInterface } from '@/components/template/conference/hooks/useCallAllPeers';

interface VideoGridProps {
    existingPeers: Record<string, MediaStream>;
    client: ClientInterface;
}

const VideoGrid: React.FC<VideoGridProps> = ({ existingPeers, client }) => {
    return (
        <div className="CAM-LIST-PARTICIPANTS relative flex flex-wrap flex-1 h-[100%] p-4">
            {Object.keys(existingPeers).map((peerId) => (
                <React.Fragment key={peerId}>
                    <Video
                        existingPeers={existingPeers}
                        peerId={peerId}
                        client={client}
                    />
                </React.Fragment>
            ))}
        </div>
    );
};

export default VideoGrid;
