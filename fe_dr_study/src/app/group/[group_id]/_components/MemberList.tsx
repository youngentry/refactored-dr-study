import React from 'react';
import { FaUsers, FaCrown } from 'react-icons/fa';
import { GroupMember } from '../_api/ssr';
import MemberAvatar from '@/components/molecules/MemberAvatar';

interface MemberListProps {
    members: GroupMember[];
    memberCapacity: number;
}

const MemberList: React.FC<MemberListProps> = ({ members, memberCapacity }) => {
    return (
        <div className="BL-INFO-MEMBER-LIST flex flex-col gap-1">
            <div className="flex flex-row gap-2">
                <label className="font-semibold !text-dr-body-3 !text-dr-gray-100">
                    스터디원 목록
                </label>
                <div className="flex flex-row gap-1">
                    <FaUsers className="text-dr-gray-400 text-dr-body-3 self-center pb-0" />
                    <div className="text-dr-body-4 text-dr-gray-300 flex flex-row gap-1 items-center">
                        {members.length} / {memberCapacity}
                    </div>
                </div>
            </div>
            <ul className="LIST-MEMBER-IMAGES flex flex-row gap-2">
                {members.slice(0, 3).map((member, i) => (
                    <li key={i} className="relative">
                        {member.role === 'CAPTAIN' && (
                            <FaCrown className="absolute top-[-0.5rem] right-0.5rem text-yellow-400 text-lg z-20" />
                        )}
                        <MemberAvatar
                            member={{
                                id: member.memberInfo.id,
                                nickname: member.memberInfo.nickname,
                                imageUrl: member.memberInfo.imageUrl,
                            }}
                        />
                    </li>
                ))}
                {members.length > 3 && (
                    <li key="extra">
                        <button className="relative overflow-hidden w-10 h-10 rounded-xl border-[1px] border-dr-coral-100 bg-dr-coral-200 hover:bg-dr-coral-100 transition-colors duration-200 flex items-center justify-center">
                            <span className="text-white font-semibold text-dr-body-3">
                                +{members.length - 3}
                            </span>
                        </button>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default MemberList;
