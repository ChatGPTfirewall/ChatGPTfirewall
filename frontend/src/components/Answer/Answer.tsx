import { Stack, IconButton } from "@fluentui/react";

import styles from "./Answer.module.css";

import { Response } from "../../api";
import { AnswerIcon } from "./AnswerIcon";
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';

interface Props {
    answer: Response;
    isSelected?: boolean;
    onCitationClicked: (filePath: string) => void;
    onThoughtProcessClicked: () => void;
    onSupportingContentClicked: () => void;
    onFollowupQuestionClicked?: (question: string) => void;
    showFollowupQuestions?: boolean;
    children: ReactNode;
}

export const Answer = ({
    answer,
    isSelected,
    onThoughtProcessClicked,
    onSupportingContentClicked,
    children
}: Props) => {
    const { t } = useTranslation();
    return (
        <Stack className={`${styles.answerContainer} ${isSelected && styles.selected}`} verticalAlign="space-between">
            <Stack.Item>
                <Stack horizontal horizontalAlign="space-between">
                    <AnswerIcon />
                    <div>
                        <IconButton
                            style={{ color: "black" }}
                            iconProps={{ iconName: "Lightbulb" }}
                            title="Show thought process"
                            ariaLabel="Show thought process"
                            onClick={() => onThoughtProcessClicked()}
                        />
                        <IconButton
                            style={{ color: "black" }}
                            iconProps={{ iconName: "ClipboardList" }}
                            title="Show supporting content"
                            ariaLabel="Show supporting content"
                            onClick={() => onSupportingContentClicked()}
                        />
                    </div>
                </Stack>
            </Stack.Item>

            <Stack.Item grow>
                {answer.facts ? (
                    <div>
                        <span className={styles.citationLearnMore}>{t('sendingToChatGPT')}</span>
                        <br></br>
                        <span className={styles.citationLearnMore}>{t('checkYourData')}</span>
                        <div className={styles.gap}></div>
                        {answer.facts!.map((fact, index) => (
                            <div>
                                <div> <span className={styles.informationText}>{t('answer')} {index + 1} {t('from')} </span>
                                    <a key={index} href={`/api/documents/download/${encodeURIComponent(fact.file)}`} download className={styles.citation}>{fact.file}</a>
                                    <span className={styles.informationText}> {t('at')} </span>
                                    <span className={styles.informationText}>{(fact.score * 100).toFixed(2)}% {t('accuracy')}</span>
                                </div>
                                <div className={styles.answerText}>{`${fact.context_before} ${fact.answer} ${fact.context_after}`}</div>
                            </div>
                        ))}
                    {children}
                    </div>
                ) : (
                    <div>
                        <div className={styles.answerText}>{answer.llm_answer!.result}</div>
                    </div>
                )}

            </Stack.Item>


        </Stack>
    );
};
