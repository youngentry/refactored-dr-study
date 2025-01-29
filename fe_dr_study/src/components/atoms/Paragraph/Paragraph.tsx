import React from 'react';

import { ParagraphProps } from './Paragraph.types';

export const Paragraph: React.FC<ParagraphProps> = ({
    className,
    children,
}) => {
    return (
        <p className={className} style={{ color: 'white' }}>
            {children}
        </p>
    );
};
