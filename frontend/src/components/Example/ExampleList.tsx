import { Example } from "./Example";

import styles from "./Example.module.css";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export type ExampleModel = {
  text: string;
};

export type DemoModel = {
  text: string;
  value: string;
};

const DEMOPAGE: DemoModel[] = [
  { text: "Was ist auf der Weinversteigerung in Trier passiert?", value: "Was ist auf der Weinversteigerung in Trier passiert?"},
  { text: "Worüber ist der Edelmann E erbost?", value: "Worüber ist der Edelmann E erbost??" },
  { text: "Warum wurde B die Einreise in die USA verweigert?", value: "Warum wurde B die Einreise in die USA verweigert?" }
];

interface Props {
  onExampleClicked: (value: string) => void;
}

export const ExampleList = ({ onExampleClicked }: Props) => {
  const { t } = useTranslation();
  return (
    <ul className={styles.examplesNavList}>
      <li>
        <Example text={t('card1Upload')} value={""} onClick={onExampleClicked} />
      </li>
      <li>
        <Example text={t('card2Ask')} value={""} onClick={onExampleClicked} />
      </li>
      <li>
        <Link to="/demo">
          <Example text={t('card3Demo')} value={""} onClick={onExampleClicked} />
        </Link>

      </li>
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