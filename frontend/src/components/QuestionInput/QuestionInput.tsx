import { useState } from "react";
import { Stack, TextField } from "@fluentui/react";
import { Button } from "@fluentui/react-components";
import { Send28Filled } from "@fluentui/react-icons";
import { useTranslation } from 'react-i18next';
import Tooltip from './Tooltip';

import styles from "./QuestionInput.module.css";

interface Props {
    onSend: (question: string) => void;
    disabled: boolean;
    placeholder?: string;
    clearOnSend?: boolean;
}

export const QuestionInput = ({ onSend, disabled, placeholder, clearOnSend }: Props) => {
    const [question, setQuestion] = useState<string>("");
    const { t } = useTranslation();

    const sendQuestion = () => {
        if (disabled || !question.trim()) {
            return;
        }

        onSend(question);

        if (clearOnSend) {
            setQuestion("");
        }
    };

    const onEnterPress = (ev: React.KeyboardEvent<Element>) => {
        if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault();
            sendQuestion();
        }
    };

    const onQuestionChange = (_ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        if (!newValue) {
            setQuestion("");
        } else if (newValue.length <= 1000) {
            setQuestion(newValue);
        }
    };

    return (
        <Stack horizontal className={`${styles.questionInputContainer} ${disabled ? styles.questionInputContainerDisabled : ''}`}>
            <Tooltip content={t('uploadYourFile')} disabled={disabled}>
                <TextField
                    className={styles.questionInputTextArea}
                    placeholder={placeholder}
                    multiline
                    resizable={false}
                    borderless
                    value={question}
                    onChange={onQuestionChange}
                    onKeyDown={onEnterPress}
                    disabled={disabled}
                />
            </Tooltip>
            <div className={styles.questionInputButtonsContainer}>
                <Button size="large" icon={<Send28Filled primaryFill="rgba(115, 118, 225, 1)" />} disabled={disabled} onClick={sendQuestion} />
            </div>
        </Stack>
    );
};
