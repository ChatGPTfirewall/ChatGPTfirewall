import { useId, useBoolean } from '@fluentui/react-hooks';
import { Add24Regular, ArrowUpload24Regular, Box24Regular } from "@fluentui/react-icons";
import styles from "./KnowledgeBaseModal.module.css";
import {
  getTheme,
  mergeStyleSets,
  FontWeights,
  Text,
  Modal,
  IIconProps,
  IStackProps,
} from '@fluentui/react';
import { IconButton, IButtonStyles } from '@fluentui/react/lib/Button';
import { FileCard } from '../FileCard';
import React from 'react';
import { uploadFiles } from '../../api';


interface Props {
  buttonClassName?: string;
}
export const KnowledgeBaseModal = ({ buttonClassName }: Props) => {
  const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
  const hiddenFileInput = React.useRef(null);

  const handleClick = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };

  const handleFileChange = (event: any) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      uploadFiles(formData)
    }
  };

  // Use useId() to ensure that the IDs are unique on the page.
  // (It's also okay to use plain strings and manually ensure uniqueness.)
  const titleId = useId('title');

  const redirectToS3 = () => {
    // Perform the redirection to Amazon S3 here
    window.location.href = "https://aws.amazon.com/s3"; // Replace this with the actual Amazon S3 URL
  };

  return (
    <div>
      <div className={`${styles.container} ${buttonClassName ?? ""}`} onClick={showModal}>
        <Add24Regular />
        <Text>{"Add Files"}</Text>
      </div>
      <Modal
        titleAriaId={titleId}
        isOpen={isModalOpen}
        onDismiss={hideModal}
        isBlocking={false}
        containerClassName={contentStyles.container}
      >
        <div className={contentStyles.header}>
          <h2 className={contentStyles.heading} id={titleId}>
            Select method
          </h2>
          <IconButton
            styles={iconButtonStyles}
            iconProps={cancelIcon}
            ariaLabel="Close popup modal"
            onClick={hideModal}
          />
        </div>
        <div className={styles.modal_container}>
          <FileCard Icon={<Box24Regular />} title="S3 Storage" subtitle="Scalable storage in the cloud." onClick={redirectToS3} />
          <FileCard Icon={<Box24Regular />} title="Nextcloud" />
          <FileCard onClick={handleClick} Icon={<ArrowUpload24Regular />} title="Upload" subtitle="Select a folder or a file to upload." >
            <input type="file" name="files" style={{ display: 'none' }} ref={hiddenFileInput} onChange={handleFileChange} multiple accept=".pdf,.docx,.doc,.txt,.rtf,.html,.xml,.csv,.md" />
          </FileCard>
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
