import React, { useState, ReactNode } from 'react';

// Styles for the tooltip container and the tooltip itself
import './Tooltip.css';

interface Props {
    children: ReactNode;
    content: string;
    disabled: boolean;
}

const Tooltip = ({ children, content, disabled }: Props) => {
    const [show, setShow] = useState(false);

    if (!disabled) {
        return <>{children}</>;
    }
    return (
        <span className="tooltip-container" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
            {children}
            {show && <span className="tooltip-content">{content}</span>}
        </span>
    );
};

export default Tooltip;
