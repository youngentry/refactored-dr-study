export interface SpanProps {
    variant?: 's1' | 'b1' | 'b2' | 'b3' | 'b4';
    color?: 'primary' | 'secondary' | 'success' | 'danger' | 'black' | 'white';
    children: React.ReactNode;
    className?: string;
}
