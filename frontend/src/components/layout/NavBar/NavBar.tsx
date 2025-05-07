import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from '../../common/LoginButton/LoginButton';
import LanguageSelector from '../../common/LanguageSelector/LanguageSelector';
import NavBarStyles from './NavBarStyles';
import InfoHover from '../../common/Dialogs/InfoHover';
import { useTranslation } from 'react-i18next';
import { Divider } from '@fluentui/react-components';

const NavBar = () => {
  const styles = NavBarStyles();
  const location = useLocation();
  const { isAuthenticated } = useAuth0();
  const logoPath = '/images/android-chrome-512x512.png';

  const isChatActive = location.pathname.startsWith('/chat');
  const isFilesActive = location.pathname.startsWith('/files');
  const isDemoActive = location.pathname.startsWith('/demo');
  const { t } = useTranslation();

  return (
    <header className={styles.header} role={'banner'}>
      <div className={styles.headerContainer}>
        <Link to="/" className={styles.headerTitleContainer}>
          <img src={logoPath} alt="Logo" className={styles.appLogo} />
          <h3 className={styles.headerTitle}>ChatGPTfirewall</h3>
          {isAuthenticated && (<div className={styles.headerTitle}>{t('DemoHeading')}</div>)}
          {isAuthenticated && (
            <InfoHover>
              <div style={{ width: '15rem', padding: '.5rem' }}>
                <strong>{t('DemoHeading')}:</strong>
                <p>{t('DemoExplanation')}</p>
              </div>
            </InfoHover>
          )}
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
                <div  className={styles.headerNavLeftMargin}>
                  <NavLink
                      to="/files"
                      className={({ isActive }) =>
                        isActive || isFilesActive
                          ? styles.headerNavPageLinkActive
                          : styles.headerNavPageLink
                      }
                    >
                      {t('files')}
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
