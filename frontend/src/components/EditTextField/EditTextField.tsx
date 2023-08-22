import styles from "./EditTextField.module.css";

interface Props {
    message: string;
}

export const EditTextField = ({ message }: Props) => {
    return (
        <div className={styles.container}>
            <div className={styles.message}>{message}</div>
        </div>
    );
};

import { TextField } from "@fluentui/react";
import { useState } from "react";

function CheckDefaultIcon() {
  return (
    <span style={{ marginLeft: "5px", color: "green", cursor: "pointer" }}>
      &#10004;
    </span>
  );
}

function CloseDefaultIcon() {
  return (
    <span style={{ marginLeft: "5px", color: "red", cursor: "pointer" }}>
      &#10008;
    </span>
  );
}

export default function (props:any) {
  const {
    defaultValue,
    saveText,
    cancelEdit,
    className,
    checkIcon = <CheckDefaultIcon />,
    closeIcon = <CloseDefaultIcon />,

    ...others
  } = props;
  const [value, setValue] = useState(defaultValue);

  const updateText = () => {
    saveText(value);
  };

  return (
    <TextField label="With auto adjusting height" borderless multiline autoAdjustHeight/>
  );
}
