import { Button } from './Button';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
}

export function LoadingButton({ 
  loading = false, 
  children, 
  disabled,
  variant = 'primary',
  ...props 
}: LoadingButtonProps) {
  return (
    <Button
      variant={variant}
      isLoading={loading}
      disabled={disabled || loading}
      {...props}
    >
      {children}
    </Button>
  );
}
