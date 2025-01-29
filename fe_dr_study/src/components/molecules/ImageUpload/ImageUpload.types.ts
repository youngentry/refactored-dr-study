import { ReactNode, FormEvent } from 'react';

export interface FormWrapperProps {
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    children: ReactNode;
}
