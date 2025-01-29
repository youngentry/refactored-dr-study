import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionStorageItem } from '@/utils/sessionStorage';

const useCheckLogin = () => {
    const router = useRouter();
    const memberData = getSessionStorageItem('memberData');

    useEffect(() => {
        if (!memberData) {
            router.push('/auth/login');
        }
    }, [memberData, router]);

    return memberData; // 멤버 데이터를 반환
};

export default useCheckLogin;
