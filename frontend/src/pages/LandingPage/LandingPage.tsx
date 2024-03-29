import { useAuth0 } from '@auth0/auth0-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@fluentui/react-components';
import './LandingPage.css';

const LandingPage = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const { t } = useTranslation();
  const logoPath = '/images/android-chrome-192x192.png';

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="landing-page">
      <div className="landing-content">
        <img src={logoPath} alt="Logo" className="app-logo" />
        <h1>{t('headerText')}</h1> {/* Header text */}
        <p>{t('subheaderText')}</p> {/* Subheader text */}
        <Button
          className="login-button"
          appearance="primary"
          size="large"
          onClick={() => loginWithRedirect()}
        >
          {t('login')}
        </Button>
        <div className="links">
          <a href="https://chatgptfirewall.github.io/ChatGPTfirewall/">
            {t('landingPage')}
          </a>
          <a href="https://chatgptfirewall.gitbook.io/chatgptfirewall">
            {t('documentation')}
          </a>
          <a href="https://github.com/ChatGPTfirewall/ChatGPTfirewall">
            {t('githubRepo')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
