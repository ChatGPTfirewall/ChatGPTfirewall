import { useState, useEffect } from 'react';
import TextDetailDrawerStyles from './TextDetailDrawerStyles';
import {
  Button,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  OverlayDrawer,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { Room } from '../../../models/Room';
import { categorizeText } from '../../../api/categorizeApi';
import { summarizeText, SummarizeTextResponse } from '../../../api/summarizeApi';
import { updateFileHeadings } from '../../../api/fileApi';
import { File } from '../../../models/File';

interface TextDetailDrawerProps {
  open: boolean;
  closeDrawer: () => void;
  room: Room;
}

interface Chapter {
  line: number;
  heading: string;
  summary?: string;
}

const TextDetailDrawer = ({ open, closeDrawer, room }: TextDetailDrawerProps) => {
  const styles = TextDetailDrawerStyles();
  const { t } = useTranslation();

  const [fileChapters, setFileChapters] = useState<Record<string, Chapter[]>>({});
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);
  const [summarizingIndex, setSummarizingIndex] = useState<{ fileId: string; index: number } | null>(null);
  const [confirmReCategorizeFile, setConfirmReCategorizeFile] = useState<File | null>(null);

  const files = room.files ?? [];

  useEffect(() => {
    if (open) {
      const initialChapters = files.reduce((acc, file) => {
        acc[file.id ?? ''] = file.headings ?? [];
        return acc;
      }, {} as Record<string, Chapter[]>);
      setFileChapters(initialChapters);
    }
  }, [open, files]);

  const handleCategorize = async (file: File) => {
    if (!file.text) {
      console.warn('No valid file with text to categorize');
      return;
    }

    setLoadingFileId(file.id ?? null);

    try {
      const response = await categorizeText(file.text);
      if (response?.headings) {
        const newChapters = response.headings.map((heading: { line: number; heading: string }) => ({
          line: heading.line,
          heading: heading.heading,
          summary: undefined,
        }));

        setFileChapters((prev) => ({ ...prev, [file.id ?? '']: newChapters }));

        if (file.id) {
          await updateFileHeadings(file.id, newChapters);
        }
      } else {
        console.error('Unexpected response format:', response);
      }
    } catch (error) {
      console.error('Error categorizing text:', error);
    } finally {
      setLoadingFileId(null);
    }
  };

  const handleSummarize = async (file: File, chapterIndex: number) => {
    if (!file.text) return;

    const chapters = fileChapters[file.id ?? ''] || [];
    const chapter = chapters[chapterIndex];
    const lines = file.text.split('\n');

    const startLine = chapter.line - 1;
    const endLine = chapterIndex + 1 < chapters.length ? chapters[chapterIndex + 1].line - 1 : lines.length;
    const textToSummarize = lines.slice(startLine, endLine).join('\n');

    setSummarizingIndex({ fileId: file.id ?? '', index: chapterIndex });

    try {
      const response: SummarizeTextResponse = await summarizeText(textToSummarize);
      const updatedChapters = [...chapters];
      updatedChapters[chapterIndex].summary = response.summary;
      setFileChapters((prev) => ({ ...prev, [file.id ?? '']: updatedChapters }));

      if (file.id) {
        await updateFileHeadings(file.id, updatedChapters);
      }
    } catch (error) {
      console.error('Error summarizing text:', error);
    } finally {
      setSummarizingIndex(null);
    }
  };

  const confirmReCategorize = (file: File) => {
    setConfirmReCategorizeFile(file);
  };

  const handleConfirmReCategorize = async () => {
    if (confirmReCategorizeFile) {
      setFileChapters((prev) => ({
        ...prev,
        [confirmReCategorizeFile.id ?? '']: [],
      }));
      await handleCategorize(confirmReCategorizeFile);
      setConfirmReCategorizeFile(null);
    }
  };

  return (
    <div>
      <OverlayDrawer modalType="non-modal" open={open} position="end" size="large">
        <DrawerHeader>
          <DrawerHeaderTitle
            action={<Button appearance="subtle" icon={<Dismiss24Regular />} onClick={closeDrawer} />}
          >
            {t('textDetailDrawerTitle')}
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          {files.map((file) => (
            <div key={file.id} className={styles.fileContainer}>
              <h3 className={styles.fileTitle}>{file.filename}</h3>

              <div className={styles.fileTextWithLineNumbers}>
                {file.text?.split('\n').map((line, lineIndex) => (
                  <div key={lineIndex} className={styles.line}>
                    <span className={styles.lineNumber}>{lineIndex + 1}</span>
                    <span className={styles.lineText}>{line.trim() === '' ? '\u00A0' : line}</span>
                  </div>
                ))}
              </div>

              <div className={styles.actionContainer}>
                <Button
                  appearance="primary"
                  onClick={() =>
                    fileChapters[file.id ?? '']?.length
                      ? confirmReCategorize(file)
                      : handleCategorize(file)
                  }
                  disabled={loadingFileId === file.id}
                >
                  {loadingFileId === file.id
                    ? t('loading')
                    : fileChapters[file.id ?? '']?.length
                    ? t('reCategorize')
                    : t('categorize')}
                </Button>
              </div>

              <div className={styles.chaptersContainer}>
                {fileChapters[file.id ?? '']?.length > 0 ? (
                  <ul className={styles.chapterList}>
                    {fileChapters[file.id ?? ''].map((chapter, index) => (
                      <li key={index} className={styles.chapterItem}>
                        <strong>{chapter.heading}</strong> - {t('line')} {chapter.line}
                        <Button
                          appearance="subtle"
                          onClick={() => handleSummarize(file, index)}
                          disabled={summarizingIndex?.fileId === file.id && summarizingIndex?.index === index}
                          className={styles.summarizeButton}
                        >
                          {summarizingIndex?.fileId === file.id && summarizingIndex?.index === index
                            ? t('summarizing')
                            : t('summarize')}
                        </Button>
                        {chapter.summary && (
                          <p className={styles.summaryText}>
                            <strong>{t('summary')}:</strong> {chapter.summary}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{t('noChaptersFound')}</p>
                )}
              </div>
            </div>
          ))}
        </DrawerBody>
      </OverlayDrawer>

      {confirmReCategorizeFile && (
        <Dialog modalType="alert" open={confirmReCategorizeFile !== null}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>{t('confirmReCategorization')}</DialogTitle>
              <DialogContent>{t('reCategorizationWarning')}</DialogContent>
              <DialogActions>
                <Button onClick={() => setConfirmReCategorizeFile(null)}>{t('cancel')}</Button>
                <Button appearance="primary" onClick={handleConfirmReCategorize}>{t('confirm')}</Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}
    </div>
  );
};

export default TextDetailDrawer;
