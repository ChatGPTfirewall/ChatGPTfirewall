import { useAuth0 } from '@auth0/auth0-react';
import { useTranslation } from 'react-i18next';
import { Button, Link } from '@fluentui/react-components';
import LandingPageStyles from './LandingPageStyles';

const LandingPage = () => {
  const styles = LandingPageStyles();
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const { t } = useTranslation();
  const logoPath = '/images/android-chrome-512x512.png';

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.landingPage}>
      <div className={styles.landingContent}>
        <img src={logoPath} alt="Logo" className={styles.appLogo} />
        <h1 className={styles.header}>{t('headerText')}</h1>
        <p className={styles.subHeader}>{t('subheaderText')}</p>
        <Button
          appearance="primary"
          size="large"
          onClick={() => loginWithRedirect()}
        >
          {t('login')}
        </Button>

        <div className={styles.links}>
          <Link
            href="https://chatgptfirewall.github.io/ChatGPTfirewall/"
            appearance="subtle"
          >
            {t('landingPage')}
          </Link>
          <Link
            href="https://chatgptfirewall.gitbook.io/chatgptfirewall/"
            appearance="subtle"
          >
            {t('documentation')}
          </Link>
          <Link
            href="https://github.com/ChatGPTfirewall/ChatGPTfirewall"
            appearance="subtle"
          >
            {t('githubRepo')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
