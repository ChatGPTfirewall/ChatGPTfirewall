import React, { useState } from 'react';
import TextDetailDrawerStyles from './TextDetailDrawerStyles';
import {
  Button,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  OverlayDrawer,
  Input,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { Room } from '../../../models/Room';
import { categorizeText } from '../../../api/categorizeApi';

interface TextDetailDrawerProps {
  open: boolean;
  closeDrawer: () => void;
  room: Room;
}

const TextDetailDrawer = ({ open, closeDrawer, room }: TextDetailDrawerProps) => {
  const styles = TextDetailDrawerStyles(); // Use the styles
  const { t } = useTranslation();

  const [chapters, setChapters] = useState<{ line: number; heading: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  // If `files` or `text` is unavailable, show a fallback message
  const files = room.files ?? [];
  const validFiles = files.filter((file) => file.text); // Filter files that have text

  // Function to handle categorization
  const handleCategorize = async () => {
    if (validFiles.length === 0 || !validFiles[0].text) return; // Check if there's a valid file

    setLoading(true); // Set loading state
    try {
      const result = await categorizeText(validFiles[0].text || '');
      setChapters(result); // Update the chapters state with the API result
    } catch (error) {
      console.error('Error categorizing text:', error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div>
      <OverlayDrawer
        modalType="non-modal"
        open={open}
        position="end"
        size="large"
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                icon={<Dismiss24Regular />}
                onClick={closeDrawer}
              />
            }
          >
            {t('textDetailDrawerTitle')}
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          <div className={styles.textdetailBody}>
            {validFiles.length === 0 ? (
              <p>{t('noFilesToDisplay')}</p>
            ) : (
              validFiles.map((file, index) => (
                <div key={index} className={styles.fileContainer}>
                  <h3 className={styles.fileTitle}>{file.filename}</h3>
                  <p className={styles.fileText}>{file.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Textbox and Button */}
          <div className={styles.actionContainer}>
            <Input
              placeholder={t('enterTextToCategorize')}
              className={styles.textBox}
              disabled
              value={
                validFiles.length > 0 && validFiles[0].text
                  ? validFiles[0].text.slice(0, 50) + '...' // Show a preview of the text
                  : ''
              }
            />
            <Button
              appearance="primary"
              onClick={handleCategorize}
              disabled={validFiles.length === 0 || loading}
            >
              {loading ? t('loading') : t('categorize')}
            </Button>
          </div>

          {/* Display the categorized headings */}
          <div className={styles.chaptersContainer}>
            {chapters.length > 0 ? (
              <ul className={styles.chapterList}>
                {chapters.map((chapter, index) => (
                  <li key={index} className={styles.chapterItem}>
                    <strong>{chapter.heading}</strong> - {t('line')} {chapter.line}
                  </li>
                ))}
              </ul>
            ) : (
              !loading && <p>{t('noChaptersFound')}</p>
            )}
          </div>
        </DrawerBody>
      </OverlayDrawer>
    </div>
  );
};

export default TextDetailDrawer;
