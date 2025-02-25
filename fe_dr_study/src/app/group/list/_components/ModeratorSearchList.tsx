import Link from 'next/link';
import { useEffect } from 'react';

const ModeratorSearchList = ({
    moderatorSearchResult,
}: {
    moderatorSearchResult: any[];
}) => {
    useEffect(() => {
        console.log('검색 결과 moderatorSearchResult:', moderatorSearchResult);
    }, [moderatorSearchResult]);

    return (
        <div className="text-dr-white bg-zinc-900 rounded-md">
            <ul className="p-[1rem] rounded-lg text-dr-body-3">
                {moderatorSearchResult?.length ? (
                    moderatorSearchResult.map((moderator, idx) => (
                        <li key={idx}>
                            <Link href={`/moderator/${moderator.id}`}>
                                {moderator.name}
                            </Link>
                        </li>
                    ))
                ) : (
                    <li>검색 결과가 없습니다.</li>
                )}
            </ul>
        </div>
    );
};

export default ModeratorSearchList;
