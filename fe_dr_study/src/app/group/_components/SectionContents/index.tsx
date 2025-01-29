'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/atoms';
import ListConferenceToday from '../ListConferenceTodays';
import ArticleListContent from './ArticleListContent';
import { GET } from '@/app/api/routeModule';
import { useRouter } from 'next/navigation';
import ListConferenceHistoryContent from './ListConfereceHistoryContent';

interface SectionContentsProps {
    groupId: string;
    isLeader: boolean;
    isMember: boolean;
}

export const fetchConferenceList = async ({
    memberId,
    studyGroupId,
    isOpened,
    isClosed,
    isStart,
    isFinish,
    // lowerBoundDate,
    // upperBoundDate,
}: {
    memberId?: number;
    studyGroupId?: string;
    isOpened?: boolean;
    isClosed?: boolean;
    isStart?: boolean;
    isFinish?: boolean;
}) => {
    let url = `v1/conferences?`;

    if (memberId) {
        url += `memberId=${memberId}&`;
    }
    if (studyGroupId) {
        url += `studyGroupId=${studyGroupId}&`;
    }
    if (isOpened !== null && isOpened !== undefined) {
        url += `isOpened=${isOpened}&`;
    }
    if (isClosed !== null && isClosed !== undefined) {
        url += `isClosed=${isClosed}&`;
    }
    if (isStart !== null && isStart !== undefined) {
        url += `isStart=${isStart}&`;
    }
    if (isFinish !== null && isFinish !== undefined) {
        url += `isFinish=${isFinish}&`;
    }

    try {
        const response = await GET(url, {
            isAuth: true,
            revalidateTime: 0,
        });
        console.log('GET 컨퍼런스 리스트 : ', response.data);
        return await response.data;
    } catch (error) {
        console.error('Error fetching conferences:', error);
        throw error;
    }
};

export const SectionContents: React.FC<SectionContentsProps> = ({
    groupId,
    isLeader,
    isMember,
}) => {
    const [activeTab, setActiveTab] = useState<'게시판' | '스터디 이력'>(
        '게시판',
    );
    const [conferencesWithMembers, setConferencesWithMembers] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchConferences = async () => {
            try {
                const response = await fetchConferenceList({
                    studyGroupId: groupId,
                });
                setConferencesWithMembers(response);
            } catch (error) {
                console.error('Failed to fetch conferences:', error);
            }
        };

        fetchConferences();
    }, [groupId]);

    const handleClickOpenConference = () => {
        router.push(`/group/${groupId}/newconf`);
        // dispatch(setIsModalOpen());
        // dispatch(setModalContent('CreateConferenceForm'));
    };

    const renderContent = (activeTab: string, groupId: string) => {
        switch (activeTab) {
            case '게시판':
                return <ArticleListContent groupId={groupId} />;
            case '스터디 이력':
                return (
                    <ListConferenceHistoryContent
                        conferences={conferencesWithMembers}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="SECTION-CONTENTS w-full h-max flex flex-row px-6 mt-8 mb-12">
            <div className="LEFT-CONTENTS flex flex-col w-2/5 h-full p-4">
                <div className="SUBTITLE flex flex-row gap-4 items-end text-dr-white mb-4">
                    <div className="text-dr-header-2 font-medium text-dr-white pl-2">
                        Today
                    </div>
                    <div className="text-dr-body-3">
                        오늘의 스터디 일정을 확인하세요.
                    </div>
                </div>
                <ListConferenceToday
                    conferences={conferencesWithMembers}
                    isMember={isMember}
                />
                <div
                    className={`mt-6 text-center ${isMember ? 'block' : 'hidden'}`}
                >
                    <Button
                        onClick={handleClickOpenConference}
                        outlined
                        rounded
                        fullWidth
                        classNameStyles="text-dr-white"
                    >
                        새 컨퍼런스 개설
                    </Button>
                </div>
            </div>
            <div className="DIVIDER-VERTICAL mx-8 w-[1.5px] h-auto my-32 bg-dr-dark-200 "></div>
            <div className="RIGHT-CONTENTS flex flex-col justify-start gap-2 w-3/5 h-auto">
                <div className="RIGHT-TOP-SWITCH-BAR">
                    <div className="SWITCH-TITLE-BOX flex flex-row gap-4 items-end text-dr-white mb-4">
                        <div className="SWITCH-TITLE text-dr-header-3 text-dr-white font-bold !line-height-[2.5rem]">
                            {activeTab}
                        </div>
                        <div className="SWITCH-DESCRIPTION text-dr-body-3 pb-1">
                            {'스터디그룹 이름'} 그룹의 게시글을 확인해보세요.
                        </div>
                    </div>
                    <div className="SWITCH-BUTTON-GROUP flex flex-row gap-2">
                        <Button
                            color="white"
                            classNameStyles={`${
                                activeTab === '게시판'
                                    ? '!text-dr-black font-bold border border-2 border-transparent'
                                    : 'bg-transparent font-bold border border-2 border-white hover:bg-white hover:text-black'
                            }`}
                            onClick={() => setActiveTab('게시판')}
                        >
                            게시판
                        </Button>

                        <Button
                            color="white"
                            classNameStyles={`${
                                activeTab === '스터디 이력'
                                    ? '!text-dr-black font-bold border border-2 border-transparent'
                                    : 'bg-transparent font-bold border border-2 border-white hover:bg-white hover:text-black'
                            }`}
                            onClick={() => setActiveTab('스터디 이력')}
                        >
                            스터디 이력
                        </Button>
                    </div>
                </div>
                <div className="DIVIDER-HORIZONTAL w-full h-[2px] bg-dr-dark-200 my-4"></div>
                <div className="RIGHT-BOTTOM-SWITCHED-CONTENT w-full h-max mb-4">
                    {renderContent(activeTab, groupId)}
                </div>
            </div>
        </div>
    );
};
