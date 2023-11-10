import { Example } from "./Example";
import { ExampleNoRequest } from "./ExampleNoRequest";

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

const DEMOPAGE_DE: DemoModel[] = [
  { text: "Was ist auf der Weinversteigerung in Trier passiert?", value: "Was ist auf der Weinversteigerung in Trier passiert?" },
  { text: "Worüber ist der Edelmann E erbost?", value: "Worüber ist der Edelmann E erbost??" },
  { text: "Warum wurde B die Einreise in die USA verweigert?", value: "Warum wurde B die Einreise in die USA verweigert?" }
];

const DEMOPAGE_EN: DemoModel[] = [
  { text: "Question 1", value: "Question 1" },
  { text: "Question 2", value: "Question 2" },
  { text: "Question 3", value: "Question 3" }
];

interface Props {
  onExampleClicked: (value: string) => void;
  lang?: string;
}

export const ExampleList = ({ onExampleClicked }: Props) => {
  const { t } = useTranslation();
  return (
    <ul className={styles.examplesNavList}>
      <li>
        <ExampleNoRequest text={t('card1Upload')} />
      </li>
      <li>
        <ExampleNoRequest text={t('card2Ask')} />
      </li>
      <li className={styles.centeredLi}>
        <span>{t('orText')}</span>
      </li>
      <li>
        <Link to="/demo">
          <ExampleNoRequest text={t('card3Demo')} />
        </Link>

      </li>
    </ul>
  );
};

export const DemoList = ({ onExampleClicked, lang }: Props) => {
  const demoPage = lang === "de" ? DEMOPAGE_DE : DEMOPAGE_EN;
  return (
    <ul className={styles.examplesNavList}>
      {demoPage.map((x, i) => (
        <li key={i}>
          <Example text={x.text} value={x.value} onClick={onExampleClicked} />
        </li>
      ))}
    </ul>
  );
};