import { Example } from "./Example";

import styles from "./Example.module.css";

export type ExampleModel = {
    text: string;
    value: string;
};

const EXAMPLES: ExampleModel[] = [
    {
        text: "When was the Unix operating system conceived and implemented?",
        value: "When was the Unix operating system conceived and implemented?"
    },
    { text: "Who began selling microcomputer-based Unix workstations?", value: "Who began selling microcomputer-based Unix workstations?" },
    { text: "Who is the author of the linux kernel?", value: "Who is the author of the linux kernel?" }
];

interface Props {
    onExampleClicked: (value: string) => void;
}

export const ExampleList = ({ onExampleClicked }: Props) => {
    return (
        <ul className={styles.examplesNavList}>
            {EXAMPLES.map((x, i) => (
                <li key={i}>
                    <Example text={x.text} value={x.value} onClick={onExampleClicked} />
                </li>
            ))}
        </ul>
    );
};
