import { Divider } from '@fluentui/react-components';
import CustomCardStyles from './CustomCardStyles';

interface CustomCardProps {
  title?: string;
  step?: string;
  value?: string;
  onClick?: (value?: string) => void;
  children?: React.ReactNode;
}

const CustomCard = ({
  step,
  title,
  value,
  onClick,
  children
}: CustomCardProps) => {
  const styles = CustomCardStyles();
  return (
    <div className={styles.guideCard} onClick={() => onClick?.(value)}>
      <div>
        <div className={styles.header}>
          <div className={styles.step}>{step}</div>
          <div className={styles.title}>{title}</div>
        </div>
        <Divider />
        <div className={styles.content}> {children}</div>
      </div>
    </div>
  );
};

export default CustomCard;
