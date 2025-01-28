import React, { useState } from "react";
import { makeStyles, tokens } from "@fluentui/react-components";
import { Info24Regular } from "@fluentui/react-icons";

const useInfoHoverStyles = makeStyles({
  container: {
    position: "relative",
    display: "inline-block",
  },
  icon: {
    fontSize: tokens.fontSizeBase300,
    color: "light grey",
    cursor: "pointer",
  },
  bubble: {
    position: "absolute",
    top: "110%", // Slightly below the icon
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    boxShadow: tokens.shadow8,
    zIndex: 51,
    whiteSpace: "wrap",
    textAlign: "center",
    display: "none", // Hidden by default
  },
  bubbleVisible: {
    display: "block", // Shown on hover
  },
  bubbleArrow: {
    position: "absolute",
    top: "-5px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "10px",
    height: "10px",
    backgroundColor: tokens.colorNeutralBackground1,
    clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
    zIndex: 11,
  },
});

interface InfoHoverProps {
  children: React.ReactNode; // Contents of the message bubble
}

const InfoHover: React.FC<InfoHoverProps> = ({ children }) => {
  const styles = useInfoHoverStyles();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={styles.container}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Info Icon */}
      <Info24Regular className={styles.icon} />

      {/* Message Bubble */}
      <div
        className={`${styles.bubble} ${
          isHovered ? styles.bubbleVisible : ""
        }`}
      >
        <div className={styles.bubbleArrow} />
        {children}
      </div>
    </div>
  );
};

export default InfoHover;
