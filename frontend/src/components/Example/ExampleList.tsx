import { Example } from "./Example";

import styles from "./Example.module.css";
import { Link } from 'react-router-dom';

export type ExampleModel = {
    text: string;
};

const EXAMPLES: ExampleModel[] = [
    {
        text: "Upload your data or select it via your Cloud",

    },
    { text: "Ask questions that your data can answer" },
    { text: "You can try out the demo" }
];

export type DemoModel = {
    text: string;
    value: string;
};

const DEMOPAGE: DemoModel[] = [
    {
        text: "Demo", value:"Demo"
    },
    { text: "Demo", value:"Demo" },
    { text: "Demo", value:"Demo"}
];

interface Props {
    onExampleClicked: (value: string) => void;
}

export const ExampleList = ({ onExampleClicked }: Props) => {
    return (
      <ul className={styles.examplesNavList}>
        {EXAMPLES.map((x, i) => (
          <li key={i}>
            {x.text === "You can try out the demo" ? (
                 <Link to="/demo">
            <Example text={x.text} value={""} onClick={onExampleClicked} />
             </Link>
            ) : (
              <Example text={x.text} value={""} onClick={onExampleClicked} />
            )}
          </li>
        ))}
      </ul>
    );
  };

  export const DemoList = ({ onExampleClicked }: Props) => {
    return (
      <ul className={styles.examplesNavList}>
        {DEMOPAGE.map((x, i) => (
          <li key={i}>
              <Example text={x.text} value={x.value} onClick={onExampleClicked} />
          </li>
        ))}
      </ul>
    );
  };