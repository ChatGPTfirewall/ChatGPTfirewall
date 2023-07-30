import { useBoolean } from '@fluentui/react-hooks';
import { Add24Regular, Edit20Regular, Edit24Regular } from "@fluentui/react-icons";
import styles from "./EditTextModal.module.css";
import {
  getTheme,
  mergeStyleSets,
  FontWeights,
  Text,
  Modal,
  IIconProps,
  IStackProps,
  TextField,
} from '@fluentui/react';
import { IconButton, IButtonStyles, DefaultButton } from '@fluentui/react/lib/Button';
import React from 'react';



interface Props {
  buttonClassName?: string;
  text: string;
}
export const EditTextModal = ({ buttonClassName, text }: Props) => {
  const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);

  return (
    <div>
      <DefaultButton className={`${styles.container} ${buttonClassName ?? ""}`} onClick={showModal}>
        <Text>{"Edit Text"}</Text>
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
        <TextField multiline autoAdjustHeight value={text}/>
        </div>
      </Modal>
    </div>
  );
};

const cancelIcon: IIconProps = { iconName: 'Cancel' };

const theme = getTheme();
const contentStyles = mergeStyleSets({
  container: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
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

