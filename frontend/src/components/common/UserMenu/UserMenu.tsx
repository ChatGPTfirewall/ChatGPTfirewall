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
  Dropdown,
  Option,
  OptionOnSelectData,
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
import { useAIModel } from '../../../context/AIModelProvider';
import { OpenAIModel } from '../../../models/Message';
import UserMenuStyles from './UserMenuStyles';

const UserMenu = () => {
  const styles = UserMenuStyles();
  const { logout, user: auth0User } = useAuth0();
  const { t, i18n } = useTranslation();
  const { user, setUser } = useUser();
  const { showToast } = useToast();
  const { selectedModel, setSelectedModel } = useAIModel();
  const [remainingTokens, setRemainingTokens] = useState<number | null>(null);
  const [loadingTokens, setLoadingTokens] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return user?.lang || localStorage.getItem('cgfwLanguage') || i18n.language;
  });

  
  const userAvatarUrl = useMemo(() => {
    if (!auth0User?.sub) return '';
    
    
    const userId = auth0User.sub.replace(/[^a-zA-Z0-9]/g, ''); 
    
    
    const avatarStyle = 'avataaars';
    
    return `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${userId}&size=64`;
  }, [auth0User?.sub]);

  
  const fetchUserTokens = async () => {
    if (auth0User?.sub) {
      setLoadingTokens(true);
      try {
        const fetchedUser = await getUser(auth0User.sub);
        setRemainingTokens(fetchedUser.max_api_calls);
        
        setUser(fetchedUser);
      } catch (error) {
        console.error("Failed to fetch user tokens:", error);
        setRemainingTokens(null);
      } finally {
        setLoadingTokens(false);
      }
    }
  };

  
  useEffect(() => {
    if (auth0User?.sub) {
      fetchUserTokens();
    }
  }, [auth0User?.sub]);

  
  useEffect(() => {
    if (user?.max_api_calls !== undefined) {
      setRemainingTokens(user.max_api_calls);
    }
  }, [user?.max_api_calls]);

  
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
    
    console.log('Profile clicked');
  };

  const handleBilling = () => {
    
    console.log('Billing clicked');
  };

  const availableModels = [
    { key: 'gpt-4o', label: 'GPT-4o', description: t('gpt4o_description') },
    { key: 'gpt-4o-mini', label: 'GPT-4o Mini', description: t('gpt4o_mini_description') },
    { key: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: t('gpt35turbo_description') }
  ];

  const handleModelChange = (_event: React.SyntheticEvent, data: OptionOnSelectData) => {
    if (data.optionValue) {
      setSelectedModel(data.optionValue as OpenAIModel);
    }
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
          {}
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

          {}
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

          {/* AI Model Selection */}
          <div className={styles.aiModelSection}>
            <span className={styles.aiModelLabel}>{t('aiModelLabel')}:</span>
            <Dropdown 
              value={selectedModel} 
              onOptionSelect={handleModelChange} 
              aria-label="Select AI Model"
              style={{ width: '100%' }}
            >
              {availableModels.map((model) => (
                <Option key={model.key} value={model.key} text={model.label}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <strong>{model.label}</strong>
                    <span style={{ opacity: 0.7, fontSize: tokens.fontSizeBase100 }}>
                      {model.description}
                    </span>
                  </div>
                </Option>
              ))}
            </Dropdown>
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