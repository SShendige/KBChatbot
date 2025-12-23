import React from 'react';
import './Checkbox.css';

const Checkbox = ({
    label,
    checked,
    onChange,
    disabled = false,
    className = '',
    ...props
}) => {
    return (
        <label className={`checkbox-wrapper ${disabled ? 'checkbox-disabled' : ''} ${className}`}>
            <input
                type="checkbox"
                className="checkbox-input"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                {...props}
            />
            <span className="checkbox-custom"></span>
            {label && <span className="checkbox-label">{label}</span>}
        </label>
    );
};

export default Checkbox;
