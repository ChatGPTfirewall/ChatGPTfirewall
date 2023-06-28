import React from 'react';
import { Text } from "@fluentui/react";
import { ArrowUpload24Regular } from "@fluentui/react-icons";

import styles from "./UploadButton.module.css";

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
        formData.append("files", files[0]);
  
        fetch("http://127.0.0.1:5000/upload", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => console.log(data))
          .catch((error) => console.log(error));
      }
    };
  
    return (
      <div className={`${styles.container} ${className ?? ""} ${disabled && styles.disabled}`} onClick={handleClick}>
        <ArrowUpload24Regular />
        <Text>{"Upload"}</Text>
        <input type="file" name="files" style={{ display: 'none' }} ref={hiddenFileInput} onChange={handleFileChange} accept=".pdf,.docx" />
      </div>
    );
  };
  
