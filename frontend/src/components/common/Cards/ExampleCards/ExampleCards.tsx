import { useTranslation } from 'react-i18next';
import CustomCard from '../CustomCard';
import ExampleCardsStyles from './ExampleCardsStyles';

export type Example = {
  text: string;
  value: string;
};

const EXAMPLES_DE: Example[] = [
  {
    text: 'Was ist auf der Weinversteigerung in Trier passiert?',
    value: 'Was ist auf der Weinversteigerung in Trier passiert?'
  },
  {
    text: 'Worüber ist der Edelmann E erbost?',
    value: 'Worüber ist der Edelmann E erbost??'
  },
  {
    text: 'Warum wurde B die Einreise in die USA verweigert?',
    value: 'Warum wurde B die Einreise in die USA verweigert?'
  }
];

const EXAMPLES_EN: Example[] = [
  {
    text: 'What did Detective Miller discover?',
    value: 'What did Detective Miller discover?'
  },
  {
    text: 'What stories does Willow have?',
    value: 'What stories does Willow have?'
  },
  {
    text: "How many people were in Max's group? ",
    value: "How many people were in Max's group?"
  }
];

interface ExampleCardsProps {
  onExampleClicked: (value?: string) => void;
}

export const ExampleCards = ({ onExampleClicked }: ExampleCardsProps) => {
  const styles = ExampleCardsStyles();
  const { i18n } = useTranslation();
  const examples = i18n.language === 'de' ? EXAMPLES_DE : EXAMPLES_EN;
  return (
    <div className={styles.examplesCardList}>
      {examples.map((example, i) => (
        <CustomCard
          key={i}
          step={`${i + 1}.`}
          value={example.value}
          onClick={onExampleClicked}
        >
          {example.text}
        </CustomCard>
      ))}
    </div>
  );
};

export default ExampleCards;
