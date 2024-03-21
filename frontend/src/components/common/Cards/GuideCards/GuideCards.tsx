import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CustomCard from '../CustomCard';
import GuideCardsStyles from './GuideCardsStyles';

const GuideCards = () => {
  const styles = GuideCardsStyles();
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.guideCardList}>
        <CustomCard step="1." title={t('guideCardStep1Title')}>
          {t('guideCardStep1Content')}
        </CustomCard>
        <CustomCard step="2." title={t('guideCardStep2Title')}>
          {t('guideCardStep2Content')}
        </CustomCard>
        <CustomCard step="3." title={t('guideCardStep3Title')}>
          {t('guideCardStep3Content')}
        </CustomCard>
      </div>
      <div className={styles.demoTextContainer}>
        <Link to="/demo" className={styles.demoLink}>
          {t('guideCardDemoLinkText')}
        </Link>
      </div>
    </div>
  );
};

export default GuideCards;
