import { DividerShort20Filled } from "@fluentui/react-icons";
import { Fact } from "../../api";
import styles from "./UserChatMessage.module.css";
import { useTranslation } from 'react-i18next';

interface Props {
    question?: string;
    answer: string | Fact[];
}

export const UserChatMessage = ({ question, answer }: Props) => {
    const { t } = useTranslation();
    return (
        <div className={styles.container}>
            {Array.isArray(answer) ? (
                <div className={styles.message}>
                    <div className={`${styles.answerText} ${styles.bold}`}>{t('question')}: </div>
                    <div className={styles.answerText}>{question}</div>
                    <div className={styles.smallGap}> </div>
                    <div className={`${styles.answerText} ${styles.bold}`}>{t('context')}: </div>
                    {(answer as Fact[]).map((fact, index) => (
                        <div key={index} className={styles.smallGap}>
                            <div className={styles.answerText}>{fact.answer}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.message}>{answer}</div>
            )}
        </div>
    );
};
