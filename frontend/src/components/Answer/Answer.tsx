import { Stack, IconButton } from "@fluentui/react";

import styles from "./Answer.module.css";

import { Fact } from "../../api";
import { AnswerIcon } from "./AnswerIcon";
import { useTranslation } from 'react-i18next';
import { ReactNode, useState } from 'react';
import { HighlightWithinTextarea } from 'react-highlight-within-textarea';

interface Props {
    answer_index: number;
    searchResults: Fact[] | string;
    isSelected?: boolean;
    onCitationClicked: (filePath: string) => void;
    onThoughtProcessClicked: () => void;
    onSupportingContentClicked: () => void;
    onFollowupQuestionClicked?: (question: string) => void;
    showFollowupQuestions?: boolean;
    children: ReactNode;
    onChange: any;
    editMode: boolean;
}

export const Answer = ({
    answer_index,
    searchResults,
    isSelected,
    onThoughtProcessClicked,
    onSupportingContentClicked,
    children,
    onChange,
    editMode
}: Props) => {
    const { t } = useTranslation();
    const updateFact = (event: any, index: number) => {
        if (typeof searchResults !== 'string') {
            const tempSearchResults = [...searchResults]
            tempSearchResults[index].answer = event;
            onChange(tempSearchResults, answer_index);
        }
    };
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
                {Array.isArray(searchResults) ? (
                    <div>
                        <span className={styles.citationLearnMore}>{t('sendingToChatGPT')}</span>
                        <br></br>
                        <span className={styles.citationLearnMore}>{t('checkYourData')}</span>
                        <div className={styles.gap}></div>
                        {searchResults.map((fact, index) => (
                            <div key={index} className={styles.gap}>
                                <div> <span className={styles.informationText}>{t('answer')} {index + 1} {t('from')} </span>
                                    <a href={`/api/documents/download/${encodeURIComponent(fact.file)}`} download className={styles.citation}>{fact.file}</a>
                                    <span className={styles.informationText}> {t('at')} </span>
                                    <span className={styles.informationText}>{(fact.score * 100).toFixed(2)}% {t('accuracy')}</span>
                                </div>
                                {editMode ? (
                                    <div className={styles.textfield} >
                                        <HighlightWithinTextarea
                                            value={fact.answer}
                                            onChange={event => updateFact(event, index)}
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.answerText}>{fact.answer}</div>
                                )}
                            </div>
                        ))}
                        {children}
                    </div>
                ) : (
                    <div>
                        <div className={styles.answerText}>{searchResults}</div>
                    </div>
                )}

            </Stack.Item>


        </Stack>
    );
};
