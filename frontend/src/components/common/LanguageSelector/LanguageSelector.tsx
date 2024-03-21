import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dropdown,
  Option,
  OptionOnSelectData,
  SelectionEvents
} from '@fluentui/react-components';
import LanguageSelectorStyles from './LanguageSelectorStyles';
import { useUser } from '../../../context/UserProvider';
import { updateUser } from '../../../api/usersApi';
import { useToast } from '../../../context/ToastProvider';

const LanguageSelector = () => {
  const styles = LanguageSelectorStyles();
  const { t, i18n } = useTranslation();
  const { user, setUser } = useUser();
  const { showToast } = useToast();

  const options = [
    { value: 'en', text: 'EN' },
    { value: 'de', text: 'DE' }
  ];

  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return user?.lang || localStorage.getItem('cgfwLanguage') || i18n.language;
  });

  const defaultOption = options.find(
    (option) => option.value === selectedLanguage,
    { value: 'en', text: 'EN' }
  );

  useEffect(() => {
    const storedLanguage = localStorage.getItem('cgfwLanguage');
    if (storedLanguage && storedLanguage !== i18n.language) {
      i18n.changeLanguage(storedLanguage);
    }
  }, [i18n]);

  const handleChangeLanguage = (
    _: SelectionEvents,
    data: OptionOnSelectData
  ) => {
    const newLanguage = data.optionValue;
    if (newLanguage && newLanguage !== selectedLanguage) {
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

  return (
    <Dropdown
      defaultValue={defaultOption?.text}
      onOptionSelect={handleChangeLanguage}
      className={styles.dropdown}
    >
      {options.map((option) => (
        <Option
          key={option.value}
          value={option.value}
          className={styles.option}
        >
          {option.text}
        </Option>
      ))}
    </Dropdown>
  );
};

export default LanguageSelector;
