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
  CompoundButton,
  Spinner,
  OnSelectionChangeData
} from '@fluentui/react-components';
import { DocumentFolder24Regular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import FileExplorerStyles from './FileExplorerStyles';
import { FileList as FileListComp } from '../FileList/FileList';
import NextCloudIcon from './NextCloudIcon.svg?react';
import UploadButton from './UploadButton';
import { useUser } from '../../../context/UserProvider';
import { File as FileType } from '../../../models/File';
import { getFiles, createFiles, deleteFiles } from '../../../api/fileApi';
import { useToast } from '../../../context/ToastProvider';

interface FileExplorerProps {
  onClose?: () => void;
}

export const FileExplorer = ({ onClose }: FileExplorerProps) => {
  const styles = FileExplorerStyles();
  const { t } = useTranslation();
  const { user } = useUser();
  const { showToast } = useToast();
  const [files, setFiles] = useState<FileType[]>([]);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return;

    const getAllDocuments = () => {
      setIsLoading(true);
      getFiles(user.auth0_id)
        .then((response) => {
          setFiles(response);
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.error || t('unexpectedErrorOccurred');
          showToast(`${t('errorfetchingFiles')}: ${errorMessage}`, 'error');
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    getAllDocuments();
  }, [user, showToast, t]);

  const handleFileUpload = (selectedFiles: FileList) => {
    const formData = new FormData();
    const tempFiles: FileType[] = [];

    for (const rawFile of selectedFiles) {
      formData.append('files', rawFile);
      tempFiles.push({
        filename: rawFile.name,
        fileSize: rawFile.size,
        isUploading: true
      });
    }

    setFiles((prevFiles) => [...prevFiles, ...tempFiles]);
    formData.append('user', user!.auth0_id as string);

    createFiles(formData)
      .then((response) => {
        setFiles((prevFiles) =>
          prevFiles.map((file) => {
            const updatedFile = response.find(
              (resFile) => resFile.filename === file.filename
            );
            return updatedFile ? { ...updatedFile, isUploading: false } : file;
          })
        );
        showToast(t('fileUploadSuccess'), 'success');
      })
      .catch((error) => {
        setFiles((prevFiles) => prevFiles.filter((file) => !file.isUploading));
        const errorMessage =
          error.response?.data?.error || t('unexpectedErrorOccurred');
        showToast(`${t('errorUploadingFiles')}: ${errorMessage}`, 'error');
      });
  };

  const handleSelectedFiles = (
    _e: MouseEvent | KeyboardEvent,
    data: OnSelectionChangeData
  ) => {
    const selectedFileIds = [...data.selectedItems];
    setSelectedFiles(new Set(selectedFileIds));
  };

  const deleteSelectedFiles = () => {
    const fileIdsToDelete: string[] = Array.from(selectedFiles).map(
      (id) => id as string
    );

    deleteFiles(fileIdsToDelete)
      .then(() => {
        setFiles((prevFiles) =>
          prevFiles.filter((file) => !selectedFiles.has(file.id))
        );
        setSelectedFiles(new Set());
        showToast(t('filesDeletedSuccess'), 'success');
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.error || t('unexpectedErrorOccurred');
        showToast(`${t('errorDeletingFiles')}: ${errorMessage}`, 'error');
      });
  };

  return (
    <Dialog onOpenChange={(_, data) => !data.open && onClose?.()}>
      <DialogTrigger disableButtonEnhancement>
        <Button
          appearance="primary"
          icon={<DocumentFolder24Regular />}
          iconPosition="after"
          size="large"
          className={styles.triggerButton}
        >
          {t('files')}
        </Button>
      </DialogTrigger>
      <DialogSurface className={styles.surface}>
        <DialogBody>
          <DialogTitle>{t('fileExplorerTitle')}</DialogTitle>
          <DialogContent className={styles.content}>
            <div className={styles.actionButtons}>
              <UploadButton onFilesSelected={handleFileUpload} />
              <CompoundButton
                icon={<NextCloudIcon />}
                appearance="subtle"
                size="small"
                secondaryContent={t('nextCloudButtonSub')}
                disabled
              >
                {t('nextCloudButton')}
              </CompoundButton>
            </div>
            {isLoading ? (
              <Spinner label={t('loading')} />
            ) : (
              <div className={styles.fileList}>
                <Button
                  disabled={selectedFiles.size === 0}
                  onClick={deleteSelectedFiles}
                  className={styles.deleteButton}
                >
                  {t('deleteSelectedFiles')}
                </Button>
                <FileListComp
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
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default FileExplorer;
