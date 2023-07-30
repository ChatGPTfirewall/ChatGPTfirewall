import { useMemo, useState } from "react";
import { Stack, IconButton, TextField } from "@fluentui/react";
import DOMPurify from "dompurify";

import styles from "./Answer.module.css";

import { Response, getCitationFilePath } from "../../api";
import { parseAnswerToHtml } from "./AnswerParser";
import { AnswerIcon } from "./AnswerIcon";

interface Props {
    answer: Response;
    isSelected?: boolean;
    onCitationClicked: (filePath: string) => void;
    onThoughtProcessClicked: () => void;
    onSupportingContentClicked: () => void;
    onFollowupQuestionClicked?: (question: string) => void;
    showFollowupQuestions?: boolean;
}

export const Answer = ({
    answer,
    isSelected,
    onCitationClicked,
    onThoughtProcessClicked,
    onSupportingContentClicked,
    onFollowupQuestionClicked,
    showFollowupQuestions
}: Props) => {

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
                {answer.facts.map((fact, index) => (
                    <div>
                        <span className={styles.citationLearnMore}>Fact {index + 1}:</span>
                        <div className={styles.answerText}>{fact.answer}</div>
                        <TextField label="With auto adjusting height" borderless multiline autoAdjustHeight value={fact.answer} />
                        <span className={styles.citationLearnMore}>Citation:</span>
                        <a key={index} className={styles.citation} title={fact.file} onClick={() => onCitationClicked(getCitationFilePath(fact.file))}>
                            {fact.file}
                        </a>
                        <br></br>
                        <span className={styles.citationLearnMore}>Score:</span>
                        <div className={styles.gap}>{fact.score}</div>
                    </div>
                ))}

            </Stack.Item>


        </Stack>
    );
};
