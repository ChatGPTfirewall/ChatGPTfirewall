import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LanguageButton.module.css';
import { setLanguage } from '../../api';

export const LanguageButton = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleClickLanguage = (newLanguage : string) => {
    // Hier kannst du den ausgewählten `newLanguage` verwenden, um die Sprache im Backend zu aktualisieren
    setLanguage({ language: newLanguage }) // Hier wird das ausgewählte newLanguage an setLanguage übergeben

    // Optional: Hier kannst du zusätzliche Aktionen ausführen, wenn die Sprache geändert wird
    changeLanguage(newLanguage);
  };

  return (
    <div className={styles['language-dropdown']}>
      <select onChange={(e) => handleClickLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="de">Deutsch</option>
      </select>
    </div>
  );
};
