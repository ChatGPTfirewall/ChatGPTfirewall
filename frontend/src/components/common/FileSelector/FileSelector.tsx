import { KeyboardEvent, MouseEvent, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Spinner,
  OnSelectionChangeData,
  SelectionItemId,
  DialogTriggerChildProps
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import FileSelectorStyles from './FileSelectorStyles';
import { FileList as FileListComp } from '../FileList/FileList';
import { useUser } from '../../../context/UserProvider';
import { File, File as FileType } from '../../../models/File';
import { getFiles } from '../../../api/fileApi';
import { User } from '../../../models/User';
interface FileSelectorProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  triggerButton: (props: DialogTriggerChildProps) => JSX.Element;
  passedUser?: User;
}

export const FileSelector = ({
  onFilesSelected,
  selectedFiles,
  triggerButton,
  passedUser
}: FileSelectorProps) => {
  const styles = FileSelectorStyles();
  const { t } = useTranslation();
  const { user: hookUser } = useUser();
  const [files, setFiles] = useState<FileType[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<SelectionItemId>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogState] = useState<boolean>(false);

  const user = passedUser || hookUser;

  useEffect(() => {
    if (!user || !dialogOpen) return;

    const getAllDocuments = () => {
      setIsLoading(true);
      getFiles(user.auth0_id)
        .then((response) => {
          setFiles(response);
        })
        .catch((error) => {
          console.error('Error fetching documents:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    getAllDocuments();
  }, [user, dialogOpen]);

  useEffect(() => {
    const preSelectedIds = new Set(
      selectedFiles
        .filter((file) => file.id !== undefined)
        .map((file) => file.id!)
    );
    setSelectedFileIds(preSelectedIds);
  }, [selectedFiles]);

  const handleSelectedFiles = (
    _e: MouseEvent | KeyboardEvent,
    data: OnSelectionChangeData
  ) => {
    setSelectedFileIds(new Set(data.selectedItems));
  };

  const selectFiles = () => {
    const selectedFiles = files.filter((file) => selectedFileIds.has(file.id!));
    onFilesSelected(selectedFiles);
    setDialogState(false);
  };

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(_event, data) => setDialogState(data.open)}
    >
      <DialogTrigger disableButtonEnhancement>{triggerButton}</DialogTrigger>
      <DialogSurface className={styles.surface}>
        <DialogBody>
          <DialogTitle>{t('FileSelectorTitle')}</DialogTitle>
          <DialogContent className={styles.content}>
            {isLoading ? (
              <Spinner label={t('loading')} />
            ) : (
              <div className={styles.fileList}>
                <FileListComp
                  selectedFileIds={selectedFileIds}
                  files={files}
                  onSelectionChange={handleSelectedFiles}
                />
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">{t('dialogCloseButton')}</Button>
            </DialogTrigger>
            <Button appearance="primary" onClick={selectFiles}>
              {t('fileSelectorSelectButton')}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default FileSelector;
