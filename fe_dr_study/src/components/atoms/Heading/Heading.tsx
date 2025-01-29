import React from 'react';

import { HeadingProps } from './Heading.types';
import { headingStyles } from './Heading.styles';

export const Heading = ({
    className,
    variant,
    color = 'black',
    children,
}: HeadingProps) => {
    const Tag = `${variant}` as any; // h1, ~ h6 태그 생성
    return (
        <Tag className={`${headingStyles({ variant, color })} ${className}`}>
            {children}
        </Tag>
    );
};
