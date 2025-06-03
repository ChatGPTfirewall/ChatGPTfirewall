import { CompoundButton, Tooltip } from '@fluentui/react-components';
import { ArrowUpload24Regular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { useRef, ChangeEvent } from 'react';

interface UploadButtonProps {
  onFilesSelected: (selectedFiles: FileList) => void;
}

export const UploadButton = ({ onFilesSelected }: UploadButtonProps) => {
  const { t } = useTranslation();
  const hiddenFileInput = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFilesSelected(event.target.files);
    }
  };

  return (
    <Tooltip content={t('uploadButtonTooltip')} relationship="label">
      <CompoundButton
        icon={<ArrowUpload24Regular />}
        appearance="subtle"
        size="small"
        onClick={handleClick}
      >
        {t('uploadButton')}
        <input
          type="file"
          style={{ display: 'none' }}
          ref={hiddenFileInput}
          onChange={handleFileChange}
          multiple
          accept=".pdf,.docx,.doc,.txt,.rtf,.html,.xml,.csv,.md"
        />
      </CompoundButton>
    </Tooltip>
  );
};

export default UploadButton;
