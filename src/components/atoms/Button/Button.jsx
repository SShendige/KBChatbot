import React from 'react';
import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    onClick,
    type = 'button',
    className = '',
    ...props
}) => {
    const buttonClass = `btn btn-${variant} btn-${size} ${disabled || loading ? 'btn-disabled' : ''} ${className}`;

    return (
        <button
            type={type}
            className={buttonClass}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="btn-loading">
                    <span className="spinner-small"></span>
                    Loading...
                </span>
            ) : children}
        </button>
    );
};

export default Button;
