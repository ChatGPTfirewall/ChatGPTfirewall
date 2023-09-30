import { useTranslation } from 'react-i18next'; import styles from './LanguageButton.module.css';
import { setLanguage, getLanguage } from '../../api';
import { User, useAuth0 } from "@auth0/auth0-react";
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { useState, useEffect } from 'react';


const dropdownStyles = { dropdown: { width: 100 } };

export const LanguageButton = () => {
  const { i18n } = useTranslation();
  const { user, isAuthenticated } = useAuth0();
  const [lang, setLang] = useState('en');

  useEffect(() => {
    if (isAuthenticated) {
      getLang(user!);
    }
  }, [user, isAuthenticated]);

  const getLang = (user: User) => {
    getLanguage(user.sub!).then((lang: string) => {
      changeLanguage(lang)
      setLang(lang)
    })
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleClickLanguage = (newLanguage?: IDropdownOption) => {
    // Hier kannst du den ausgewählten `newLanguage` verwenden, um die Sprache im Backend zu aktualisieren
    setLanguage({ language: newLanguage, auth0_id: user!.sub }) // Hier wird das ausgewählte newLanguage an setLanguage übergeben
    setLang(newLanguage!.key as string)

    // Optional: Hier kannst du zusätzliche Aktionen ausführen, wenn die Sprache geändert wird
    changeLanguage(newLanguage!.key as string);
  };

  return (
    <div className={styles['language-dropdown']}>
      <Dropdown
        placeholder="Select an option"
        defaultSelectedKey={lang}
        onChange={(_e, option, _i) => handleClickLanguage(option)}
        options={[
          { key: 'en', text: 'English' },
          { key: 'de', text: 'Deutsch' },
        ]}
        styles={dropdownStyles}
      />
    </div>
  );
};
