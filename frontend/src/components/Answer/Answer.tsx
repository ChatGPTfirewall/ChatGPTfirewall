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
    onChange: (searchResults: Fact[], answerIndex?: number) => void;
    editMode: boolean;
}

interface Remapping {
    [key: string]: boolean;
}

const extractHighlights = (text: string, entities: [{ TEXT: string, START_CHAR: number, END_CHAR: number, LABEL: string }]): string[] => {
    if (!entities || !text) return [];

    return entities
        .filter(entity => entity.LABEL === 'LOC' || entity.LABEL === 'PER')
        .map(entity => entity.TEXT);
};

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


    const handleCheckboxChange = (factIndex: number, { pseudo, realName }: { pseudo: string; realName: string }) => {
        setRemapping(prevRemapping => {
            const newRemapping = { ...prevRemapping };
            const isMapped = newRemapping[pseudo];

            // Update the mapping state
            newRemapping[pseudo] = !isMapped;

            // Now we need to update the fact.answer text
            const newSearchResults = [...searchResults as Fact[]];
            let newText = newSearchResults[factIndex].answer;

            // Replace all occurrences of the pseudo or real name
            if (isMapped) {
                // If it was mapped, replace the real name with the pseudo
                newText = newText.split(realName).join(pseudo);
            } else {
                // If it wasn't mapped, replace the pseudo with the real name
                newText = newText.split(pseudo).join(realName);
            }

            newSearchResults[factIndex].answer = newText;

            // Call the onChange provided by parent component to update the state there as well
            onChange(newSearchResults);

            return newRemapping;
        });
    };

    const [remapping, setRemapping] = useState<Remapping>(() => {
        const initialRemapping: Remapping = {};

        if (Array.isArray(searchResults)) {
            searchResults.forEach((fact) => {
                if (fact.original_entities) {
                    Object.values(fact.original_entities).forEach((pseudo) => {
                        initialRemapping[pseudo] = false;
                    });
                }
            });
        }

        return initialRemapping;
    });

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
                                    <div className={styles.textfield}>
                                        <HighlightWithinTextarea
                                            value={fact.answer}
                                            highlight={extractHighlights(fact.answer, fact.entities)}
                                            onChange={event => updateFact(event, index)}
                                        />
                                        {/* Checkboxen für das Remapping rendern */}
                                        <div>
                                            {fact.original_entities && Object.entries(fact.original_entities).map(([realName, pseudo]) => (
                                                <div key={pseudo}>

                                                    <input
                                                        type="checkbox"

                                                        checked={!!remapping[pseudo]}
                                                        onChange={() => handleCheckboxChange(index, { pseudo, realName })}

                                                    /> {remapping[pseudo] ? realName : pseudo}
                                                    <span> = {realName} </span>

                                                </div>
                                            ))}

                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.answerText}>{fact.answer}</div>
                                )}
                            </div>
                        ))}
                        {children}
                    </div>
                ) : (
                    <div className={styles.answerText}>{searchResults}</div>
                )}

            </Stack.Item>


        </Stack>
    );
};
