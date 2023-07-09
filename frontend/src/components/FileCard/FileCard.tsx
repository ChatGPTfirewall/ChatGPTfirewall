import styles from "./FileCard.module.css";
import { Question24Regular } from '@fluentui/react-icons';


interface Props {
    disabled?: boolean;
    title: string;
    subtitle?: string;
    Icon?: any;
}
export const FileCard = ({ disabled, title, subtitle, Icon }: Props) => {

  return (
    <button className={styles.box} disabled={disabled}>
      <div className={styles.icon}>
      {Icon ? (Icon) : (<Question24Regular/>)}
      </div> 
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <span className={styles.subtitle}>{subtitle}</span>
      </div>
    </button>
  );
};