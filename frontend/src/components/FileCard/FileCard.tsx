import styles from "./FileCard.module.css";
import { ReactNode } from 'react';
import { Question24Regular } from '@fluentui/react-icons';


interface Props {
    disabled?: boolean;
    title: string;
    subtitle?: string;
    Icon?: any;
    onClick?: () => void;
    children?: ReactNode;
}
export const FileCard = ({ disabled, title, subtitle, Icon, onClick, children }: Props) => {

  return (
    <button className={styles.box} disabled={disabled} onClick={onClick}>
      <div className={styles.icon}>
      {Icon ? (Icon) : (<Question24Regular/>)}
      </div> 
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <span className={styles.subtitle}>{subtitle}</span>
      </div>
      {children}
    </button>
  );
};