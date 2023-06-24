import React from 'react';
import { Text } from "@fluentui/react";
import { ArrowUpload24Regular } from "@fluentui/react-icons";

import styles from "./UploadButton.module.css";

interface Props {
    className?: string;
    onClick: () => void;
    disabled?: boolean;
}

export const UploadButton = ({ className, disabled, onClick }: Props) => {

    const hiddenFileInput = React.useRef(null);

    const handleClick = event => {
        hiddenFileInput.current.click();
    };

    return (
        <div className={`${styles.container} ${className ?? ""} ${disabled && styles.disabled}`} onClick={handleClick}>
            <ArrowUpload24Regular />
            <Text>{"Upload"}</Text>
            <input type="file" style={{ display: 'none' }} ref={hiddenFileInput} onChange={onClick} multiple accept=".doc,.docx,.pdf,.txt" />
        </div>
    );
};
