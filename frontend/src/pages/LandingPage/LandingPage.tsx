// LandingPage.tsx
import { useAuth0 } from '@auth0/auth0-react';
import './LandingPage.css';
import { useTranslation } from 'react-i18next';
import { Button } from '@fluentui/react-components';

const LandingPage = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const { t } = useTranslation();

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1>{t('chatWithYourData')}</h1>
        <br />
        <Button
          appearance="primary"
          size="large"
          onClick={() => loginWithRedirect()}
        >
          {' '}
          Login{' '}
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
