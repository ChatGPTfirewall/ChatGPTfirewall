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

interface CategorizedHeading {
  line: number;
  heading: string;
}

interface CategorizeTextResponse {
  headings: { line: number; heading: string }[];
}

const TextDetailDrawer = ({ open, closeDrawer, room }: TextDetailDrawerProps) => {
  const styles = TextDetailDrawerStyles(); // Use the styles
  const { t } = useTranslation();

  const [chapters, setChapters] = useState<{ line: number; heading: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // If `files` or `text` is unavailable, show a fallback message
  const files = room.files ?? [];
  const validFiles = files.filter((file) => file.text); // Filter files that have text

  const handleCategorize = async () => {
    if (validFiles.length === 0 || !validFiles[0].text) {
      console.warn('No valid files with text to categorize');
      return;
    }
  
    console.log('Starting categorization for text:', validFiles[0].text.slice(0, 100));
    setLoading(true);
  
    try {
      const response = await categorizeText(validFiles[0].text || '');
      console.log('API Response:', response);
  
      if (response && response.headings) {
        setChapters(response.headings); // Use the 'headings' array
        console.log('Updated chapters:', response.headings);
      } else {
        console.error('Unexpected response format:', response);
        setChapters([]);
      }
    } catch (error) {
      console.error('Error categorizing text:', error);
      setChapters([]);
    } finally {
      setLoading(false);
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
            {loading ? (
              <p>{t('loadingChapters')}</p>
            ) : chapters.length > 0 ? (
              <ul className={styles.chapterList}>
                {chapters.map((chapter, index) => (
                  <li key={index} className={styles.chapterItem}>
                    <strong>{chapter.heading}</strong> - {t('line')} {chapter.line}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t('noChaptersFound')}</p>
            )}
          </div>
        </DrawerBody>
      </OverlayDrawer>
    </div>
  );
};

export default TextDetailDrawer;
