import { useState, useEffect, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
  Avatar,
  tokens
} from '@fluentui/react-components';
import {
  ChevronDown20Regular,
  PersonRegular,
  PaymentRegular,
  SignOut20Regular
} from '@fluentui/react-icons';
import { useUser } from '../../../context/UserProvider';
import { updateUser, getUser } from '../../../api/usersApi';
import { useToast } from '../../../context/ToastProvider';
import UserMenuStyles from './UserMenuStyles';

const UserMenu = () => {
  const styles = UserMenuStyles();
  const { logout, user: auth0User } = useAuth0();
  const { t, i18n } = useTranslation();
  const { user, setUser } = useUser();
  const { showToast } = useToast();
  const [remainingTokens, setRemainingTokens] = useState<number | null>(null);
  const [loadingTokens, setLoadingTokens] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return user?.lang || localStorage.getItem('cgfwLanguage') || i18n.language;
  });

  // 生成基于用户ID的一致随机avatar
  const userAvatarUrl = useMemo(() => {
    if (!auth0User?.sub) return '';
    
    // 使用用户的auth0_id作为种子，确保每个用户总是得到相同的avatar
    const userId = auth0User.sub.replace(/[^a-zA-Z0-9]/g, ''); // 清理特殊字符
    
    // 固定使用avataaars风格，确保始终是人物卡通头像
    const avatarStyle = 'avataaars';
    
    return `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${userId}&size=64`;
  }, [auth0User?.sub]);

  // 获取用户Token信息
  const fetchUserTokens = async () => {
    if (auth0User?.sub) {
      setLoadingTokens(true);
      try {
        const fetchedUser = await getUser(auth0User.sub);
        setRemainingTokens(fetchedUser.max_api_calls);
        // 同时更新UserProvider中的用户信息
        setUser(fetchedUser);
      } catch (error) {
        console.error("Failed to fetch user tokens:", error);
        setRemainingTokens(null);
      } finally {
        setLoadingTokens(false);
      }
    }
  };

  // 组件挂载时获取Token信息
  useEffect(() => {
    if (auth0User?.sub) {
      fetchUserTokens();
    }
  }, [auth0User?.sub]);

  // 从UserProvider中获取初始Token值
  useEffect(() => {
    if (user?.max_api_calls !== undefined) {
      setRemainingTokens(user.max_api_calls);
    }
  }, [user?.max_api_calls]);

  // 处理语言按钮点击
  const handleLanguageButtonClick = (newLanguage: string) => {
    if (newLanguage !== selectedLanguage) {
      setSelectedLanguage(newLanguage);
      localStorage.setItem('cgfwLanguage', newLanguage);
      i18n.changeLanguage(newLanguage);

      if (user) {
        const updatedUser = { ...user, lang: newLanguage };
        updateUser(updatedUser)
          .then((userResponse) => {
            setUser(userResponse);
          })
          .catch((error) => {
            const errorMessage =
              error.response?.data?.error || t('unexpectedErrorOccurred');
            showToast(`${t('errorSavingLanguage')}: ${errorMessage}`, 'error');
          });
      }
    }
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const handleProfile = () => {
    // TODO: 实现Profile功能
    console.log('Profile clicked');
  };

  const handleBilling = () => {
    // TODO: 实现Billing功能
    console.log('Billing clicked');
  };

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          className={styles.menuTrigger}
          icon={<ChevronDown20Regular />}
          iconPosition="after"
        >
          <Avatar
            image={{ src: userAvatarUrl }}
            name={auth0User?.name}
            size={24}
            className={styles.avatar}
          />
        </Button>
      </MenuTrigger>

      <MenuPopover>
        <MenuList className={styles.menuList}>
          {/* 用户信息区域 */}
          <div className={styles.userInfo}>
            <div className={styles.userInfoContent}>
              <Avatar
                image={{ src: userAvatarUrl }}
                name={auth0User?.name}
                size={40}
                className={styles.userAvatar}
              />
              <div className={styles.userDetails}>
                <div className={styles.userEmail}>{auth0User?.email}</div>
                <div className={styles.tokenInfo}>
                  Tokens: {loadingTokens ? t('loading') : remainingTokens !== null ? remainingTokens : '--'}
                </div>
              </div>
            </div>
          </div>
          
          <MenuDivider />

          {/* 语言切换 */}
          <div className={styles.languageSection}>
            <span className={styles.languageLabel}>{t('language')}:</span>
            <div className={styles.languageButtons}>
              <button
                className={styles.languageButton}
                style={{
                  color: selectedLanguage === 'en' ? tokens.colorBrandForeground1 : tokens.colorNeutralForeground2,
                  fontWeight: selectedLanguage === 'en' ? tokens.fontWeightSemibold : tokens.fontWeightRegular,
                  borderBottom: selectedLanguage === 'en' ? `2px solid ${tokens.colorBrandForeground1}` : '2px solid transparent',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={() => handleLanguageButtonClick('en')}
              >
                EN
              </button>
              <button
                className={styles.languageButton}
                style={{
                  color: selectedLanguage === 'de' ? tokens.colorBrandForeground1 : tokens.colorNeutralForeground2,
                  fontWeight: selectedLanguage === 'de' ? tokens.fontWeightSemibold : tokens.fontWeightRegular,
                  borderBottom: selectedLanguage === 'de' ? `2px solid ${tokens.colorBrandForeground1}` : '2px solid transparent',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={() => handleLanguageButtonClick('de')}
              >
                DE
              </button>
            </div>
          </div>

          <MenuDivider />

          {/* Profile */}
          <MenuItem
            icon={<PersonRegular />}
            onClick={handleProfile}
            className={styles.menuItem}
          >
            {t('profile')}
          </MenuItem>

          {/* Billing */}
          <MenuItem
            icon={<PaymentRegular />}
            onClick={handleBilling}
            className={styles.menuItem}
          >
            {t('billing')}
          </MenuItem>

          <MenuDivider />

          {/* Logout */}
          <MenuItem
            icon={<SignOut20Regular />}
            onClick={handleLogout}
            className={styles.logoutItem}
          >
            {t('logout')}
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

export default UserMenu; 