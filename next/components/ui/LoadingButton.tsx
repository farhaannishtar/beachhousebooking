interface LoadingButtonProps {
    preIcon?: string,
    postIcon?: string,
    loading?: boolean,
    disabled?: boolean,
    label?: string;
    type?: "button" | "submit" | "reset";
    className?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    children: React.ReactNode;
}
const LoadingButton: React.FC<LoadingButtonProps> = ({ className = '', label, type = 'button', preIcon, postIcon, loading, disabled, children, onClick }) => {
    return (
        <button
            className={className + ' flex items-center justify-center gap-4'}
            onClick={onClick}
            type={type}
            disabled={loading || disabled}
        >
            {!loading ? children : <span className="loader-spinner"></span>}
        </button>
    )
}

export default LoadingButton;
