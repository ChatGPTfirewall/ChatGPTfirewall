import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from '../../common/LoginButton/LoginButton';
import LanguageSelector from '../../common/LanguageSelector/LanguageSelector';
import NavBarStyles from './NavBarStyles';
import { Divider } from '@fluentui/react-components';

const NavBar = () => {
  const styles = NavBarStyles();
  const location = useLocation();
  const { isAuthenticated } = useAuth0();

  const isChatActive = location.pathname.startsWith('/chat');
  const isDemoActive = location.pathname.startsWith('/demo');

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
                <div>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      isActive || isChatActive
                        ? styles.headerNavPageLinkActive
                        : styles.headerNavPageLink
                    }
                  >
                    Chat
                  </NavLink>
                </div>
                <div className={styles.headerNavLeftMargin}>
                  <NavLink
                    to="/demo"
                    className={({ isActive }) =>
                      isActive || isDemoActive
                        ? styles.headerNavPageLinkActive
                        : styles.headerNavPageLink
                    }
                  >
                    Demo
                  </NavLink>
                </div>
              </>
            )}
            <Divider vertical={true} className={styles.headerNavLeftMargin} />
            <div className={styles.headerNavLeftMargin}>
              <LoginButton />
            </div>
            <div className={styles.headerNavLeftMargin}>
              <LanguageSelector />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
