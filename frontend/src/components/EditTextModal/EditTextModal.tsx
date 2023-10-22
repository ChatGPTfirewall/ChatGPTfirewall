import { useBoolean } from '@fluentui/react-hooks';
import styles from "./EditTextModal.module.css";
import {
  getTheme,
  mergeStyleSets,
  FontWeights,
  Text,
  Modal,
  IIconProps,
  IStackProps
} from '@fluentui/react';
import { IconButton, IButtonStyles, DefaultButton } from '@fluentui/react/lib/Button';
import { useState } from 'react';
import { HighlightWithinTextarea } from 'react-highlight-within-textarea'
import { Fact } from '../../api';
import { useTranslation } from 'react-i18next';

interface Props {
  buttonClassName?: string;
  facts: Fact[];
  highlights: string[];
  question: string;
  promptTemplate: string;
  onChange: any;
}
export const EditTextModal = ({ buttonClassName, facts, highlights, question, promptTemplate, onChange }: Props) => {
  const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
  const [answers, setAnswers] = useState(facts.map((fact) => fact.answer));
  const { t } = useTranslation();

  const template = promptTemplate
    .replace("{context}", "/br")
    .replace("{question}", "/br")
    .trim()
    .split("/br")

  const prompt_start = template[0]
  const prompt_question = template[1]
  const prompt_answer = template[2]

  const updatePrompt = (event: any, index: number) => {
    const updatedAnswers = [...answers]
    updatedAnswers[index] = event
    setAnswers(updatedAnswers)
   
    onChange(promptTemplate, updatedAnswers.join("\n\n"), question)
  };


  return (
    <div>
      <DefaultButton className={`${styles.container} ${buttonClassName ?? ""}`} onClick={showModal}>
        <Text>{t('editSearchResults')}</Text>
      </DefaultButton>

      <Modal
        isOpen={isModalOpen}
        onDismiss={hideModal}
        isBlocking={false}
        containerClassName={contentStyles.container}
      >
        <div className={contentStyles.header}>
          <h2 className={contentStyles.heading}>
            Edit Text
          </h2>
          <IconButton
            styles={iconButtonStyles}
            iconProps={cancelIcon}
            ariaLabel="Close popup modal"
            onClick={hideModal}
          />
        </div>
        <div className={styles.modal_container}>
          <span>{prompt_start}</span>
          {answers.map((answer, index) => (
            <div>
              <span>Fact {index + 1}</span>
              <div key={index} className={contentStyles.textfield} >
                <HighlightWithinTextarea
                  value={answer}
                  highlight={highlights}
                  onChange={event => updatePrompt(event, index)}
                />
              </div>
            </div>
          ))}
          <span>{prompt_question} {question}</span>
          <span>{prompt_answer}</span>
        </div>
      </Modal >
    </div >
  );
};

const cancelIcon: IIconProps = { iconName: 'Cancel' };

const theme = getTheme();
const contentStyles = mergeStyleSets({
  container: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch'
  },
  header: [
    // eslint-disable-next-line deprecation/deprecation
    theme.fonts.xLargePlus,
    {
      flex: '1 1 auto',
      borderTop: `4px solid ${theme.palette.themePrimary}`,
      color: theme.palette.neutralPrimary,
      display: 'flex',
      alignItems: 'center',
      fontWeight: FontWeights.semibold,
      padding: '12px 12px 14px 24px',
    },
  ],
  heading: {
    color: theme.palette.neutralPrimary,
    fontWeight: FontWeights.semibold,
    fontSize: 'inherit',
    margin: '0',
  },
  body: {
    grid: '4 4 auto',
    padding: '0 24px 24px 24px',
    overflowY: 'hidden',
    selectors: {
      p: { margin: '14px 0' },
      'p:first-child': { marginTop: 0 },
      'p:last-child': { marginBottom: 0 },
    },
  },
  textfield: {
    border: `1px solid`,
    padding: '4px'
  }
});
const stackProps: Partial<IStackProps> = {
  horizontal: true,
  tokens: { childrenGap: 40 },
  styles: { root: { marginBottom: 20 } },
};
const iconButtonStyles: Partial<IButtonStyles> = {
  root: {
    color: theme.palette.neutralPrimary,
    marginLeft: 'auto',
    marginTop: '4px',
    marginRight: '2px',
  },
  rootHovered: {
    color: theme.palette.neutralDark,
  },
};

