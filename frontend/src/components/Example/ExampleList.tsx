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
  {
    text: "Welche wichtige historische Veränderung erfolgte 1961 in Berlin?", value: "Welche wichtige historische Veränderung erfolgte 1961 in Berlin?"
  },
  { text: "Welche Veranstaltung aus 1920 wird in Berlin auch heute noch gefeiert?", value: "DemWelche Veranstaltung aus 1920 wird in Berlin auch heute noch gefeiert?" },
  { text: "Welche historische Bedeutung hatte Berlin im Dreißigjährigen Krieg?", value: "Welche historische Bedeutung hatte Berlin im Dreißigjährigen Krieg?" }
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