import { Stack } from "@fluentui/react";
import { animated, useSpring } from "@react-spring/web";

import styles from "./UserChatMessage.module.css";
import { useTranslation } from 'react-i18next';


export const UserLoading = () => {
    const animatedStyles = useSpring({
        from: { opacity: 0 },
        to: { opacity: 1 }
    });

    const { t } = useTranslation();

    return (
        <animated.div style={{ ...animatedStyles }}>
            <div className={styles.container}>
                <div className={styles.message}>
                <div className={styles.answerText}>
                    {t('asking')}
                    <span className={styles.loadingdots} />
                </div>
                </div>
            </div>
        </animated.div>
    );
};
