import { Text } from "@fluentui/react";
import { Settings24Regular } from "@fluentui/react-icons";

import styles from "./SettingsButton.module.css";
import { useTranslation } from 'react-i18next';

interface Props {
    className?: string;
    onClick: () => void;
}

export const SettingsButton = ({ className, onClick }: Props) => {
    const { t, i18n } = useTranslation();
    return (
        <div className={`${styles.container} ${className ?? ""}`} onClick={onClick}>
            <Settings24Regular />
            <Text>{t('devSettings')}</Text>
        </div>
    );
};
