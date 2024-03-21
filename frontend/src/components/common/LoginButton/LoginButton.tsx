import { useAuth0 } from '@auth0/auth0-react';
import { useTranslation } from 'react-i18next';
import LoginButtonStyles from './LoginButtonStyles';
import { Button } from '@fluentui/react-components';
import { SignOut24Regular } from '@fluentui/react-icons';

const LoginButton = () => {
  const styles = LoginButtonStyles();
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const { t } = useTranslation();

  if (isAuthenticated) {
    return (
      <div className={styles.loginButtonContainer}>
        <div className={styles.userText}>{user?.email}</div>
        <Button
          appearance="primary"
          icon={<SignOut24Regular />}
          size="large"
          onClick={() => logout()}
        />
      </div>
    );
  } else {
    return (
      <Button appearance="primary" onClick={() => loginWithRedirect()}>
        {t('login')}
      </Button>
    );
  }
};

export default LoginButton;
