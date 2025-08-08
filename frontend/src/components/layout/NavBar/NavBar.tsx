import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from '../../common/LoginButton/LoginButton';
import UserMenu from '../../common/UserMenu/UserMenu';
import NavBarStyles from './NavBarStyles';
import { useTranslation } from 'react-i18next';
import { Divider } from '@fluentui/react-components';

const NavBar = () => {
  const styles = NavBarStyles();
  const { isAuthenticated } = useAuth0();

  const { t } = useTranslation();

  return (
    <header className={styles.header} role={'banner'}>
      <div className={styles.headerContainer}>
        <Link to="/" className={styles.headerTitleContainer}>
          <h3 className={styles.headerTitle}>ChatGPTfirewall</h3>
        </Link>
        <nav>
          <div className={styles.headerNavList}>
            {isAuthenticated && (
              <>
                <Divider vertical={true} className={styles.headerNavLeftMargin} />
                <div className={styles.headerNavLeftMargin}>
                  <UserMenu />
                </div>
              </>
            )}
            {!isAuthenticated && (
              <div className={styles.headerNavLeftMargin}>
                <LoginButton />
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
