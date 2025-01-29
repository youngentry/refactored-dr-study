import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { logoStyles } from './Logo.styles';

export const Logo = () => {
    return (
        <Link href="" className={logoStyles({})}>
            <Image
                width={40}
                height={40}
                src="/peeper.png"
                alt="Company Logo"
            />
        </Link>
    );
};
