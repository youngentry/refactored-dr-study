import { ReactNode, FormEvent } from 'react';

export interface FormWrapperProps extends React.FormEvent<HTMLFormElement> {
    variant?: 'steps';
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    children: ReactNode;
    className?: string;
}
