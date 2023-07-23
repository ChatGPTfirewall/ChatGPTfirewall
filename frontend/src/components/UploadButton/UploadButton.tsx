import React from 'react';
import { Text } from "@fluentui/react";
import { ArrowUpload24Regular } from "@fluentui/react-icons";

import styles from "./UploadButton.module.css";
import { uploadFiles } from '../../api';

interface Props {
    className?: string;
    onClick: () => void;
    disabled?: boolean;
}
export const UploadButton = ({ className, disabled }: Props) => {
    const hiddenFileInput = React.useRef(null);
  
    const handleClick = () => {
      hiddenFileInput.current.click();
    };
  
    const handleFileChange = (event) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        const formData = new FormData();
        files.array.forEach(file => {
          formData.append("files", file)
        });
  
        uploadFiles(formData)
      }
    };
  
    return (
      <div className={`${styles.container} ${className ?? ""} ${disabled && styles.disabled}`} onClick={handleClick}>
        <ArrowUpload24Regular />
        <Text>{"Upload"}</Text>
        <input type="file" name="files" style={{ display: 'none' }} ref={hiddenFileInput} onChange={handleFileChange} multiple accept=".pdf,.docx,.doc,.txt,.rft,.html,.xml,.csv,.md" />
      </div>
    );
  };
  
