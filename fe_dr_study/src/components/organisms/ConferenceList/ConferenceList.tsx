import { IConference } from '@/app/group/[group_id]/dummy';
import ListConferenceHistoryContent from '@/app/group/_components/SectionContents/ListConfereceHistoryContent';
import React from 'react';

interface ConferenceListProps {
    conferences: IConference[] | null;
}

const ConferenceList = ({ conferences }: ConferenceListProps) => {
    console.log('conferences => ', conferences);

    if (!conferences) {
        return <div>데이터가 없습니다.</div>;
    }

    const formatDateTime = (dateString: any) => {
        const options: {
            year: 'numeric' | '2-digit';
            month: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
            day: 'numeric' | '2-digit';
            hour: 'numeric' | '2-digit';
            minute: 'numeric' | '2-digit';
            hour12: boolean;
        } = {
            year: 'numeric', // '2-digit' 또는 'numeric' 중 하나로 설정
            month: '2-digit', // '2-digit', 'numeric', 'long', 'short', 'narrow' 중 하나로 설정
            day: '2-digit', // '2-digit' 또는 'numeric' 중 하나로 설정
            hour: '2-digit', // '2-digit' 또는 'numeric' 중 하나로 설정
            minute: '2-digit', // '2-digit' 또는 'numeric' 중 하나로 설정
            hour12: false, // true 또는 false
        };

        return new Date(dateString).toLocaleString('ko-KR', options);
    };

    return (
        <div className="flex flex-col w-full p-[1.2rem] text-dr-white rounded-lg">
            <div className="text-left text-dr-header-1 text-dr-coral-50 pt-[1rem] pb-[1rem] font-bold w-full">
                참여한 라이브 스터디
            </div>
            <div className="flex pb-[1.5rem] gap-dr-30 overflow-auto">
                <ListConferenceHistoryContent conferences={conferences} />
            </div>
        </div>
    );
};

export default ConferenceList;
