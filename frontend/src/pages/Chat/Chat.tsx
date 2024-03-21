import TutorialCards from '../../components/common/Cards/GuideCards/GuideCards';
import { useTranslation } from 'react-i18next';
import ChatStyles from './ChatStyles';

const Chat = () => {
  const styles = ChatStyles();
  const { t } = useTranslation();

  return (
    <div className={styles.chatRoot}>
      <div className={styles.chatContainer}>
        <div className={styles.chatEmptyState}>
          <h1 className={styles.chatEmptyStateTitle}>ChatGPTfirewall</h1>
          <h2 className={styles.chatEmptyStateSubtitle}>
            {t('tutorialCardsSubtitle')}
          </h2>
          <TutorialCards />
        </div>
      </div>
    </div>
  );
};

export default Chat;
