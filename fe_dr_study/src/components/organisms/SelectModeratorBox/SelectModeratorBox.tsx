import SearchModerator from '@/app/group/list/_components/SearchModerator';
import {
    ModeratorDetail,
    ModeratorList,
} from '@/components/template/moderator/ModeratorTemplate';
import { Moderator } from '@/interfaces/moderator';
import React, { useState } from 'react';

interface SelectModeratorBoxProps {
    selectedModerator: Moderator | null;
    setSelectedModerator: React.Dispatch<
        React.SetStateAction<Moderator | null>
    >;
}

const SelectModeratorBox = ({
    selectedModerator,
    setSelectedModerator,
}: SelectModeratorBoxProps) => {
    const [moderatorSearchResult, setModeratorSearchResult] = useState<any[]>(
        [],
    );

    return (
        <div>
            <p className="block text-dr-body-4 ${className} text-left !text-dr-coral-50 pb-[1rem]">
                AI 사회자 선택하기
            </p>

            <div className="pb-[0.5rem]">
                <SearchModerator
                    setModeratorSearchResult={setModeratorSearchResult}
                />
            </div>
            <div className="flex flex-col w-[100%]">
                <ModeratorList
                    moderators={moderatorSearchResult.slice(0, 4)}
                    setSelectedModerator={setSelectedModerator}
                    isDisableCreateNewModerator
                />
                <ModeratorDetail moderator={selectedModerator} />
            </div>
        </div>
    );
};

export default SelectModeratorBox;
