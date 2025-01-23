import { useState } from 'react';
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
import { summarizeText, SummarizeTextResponse } from '../../../api/summarizeApi'; // Import the summarize API function

interface TextDetailDrawerProps {
  open: boolean;
  closeDrawer: () => void;
  room: Room;
}

interface Chapter {
  line: number;
  heading: string;
  summary?: string; // Add summary to each chapter
}

const TextDetailDrawer = ({ open, closeDrawer, room }: TextDetailDrawerProps) => {
  const styles = TextDetailDrawerStyles(); // Use the styles
  const { t } = useTranslation();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [summarizingIndex, setSummarizingIndex] = useState<number | null>(null); // To track which chapter is being summarized

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
        setChapters(response.headings.map((heading: { line: number; heading: string }) => ({
          line: heading.line,
          heading: heading.heading,
          summary: undefined, // Initialize summary as undefined
        })));
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

  const handleSummarize = async (chapterIndex: number) => {
    if (!validFiles[0]?.text) return;
  
    const chapter = chapters[chapterIndex];
    const lines = validFiles[0].text.split('\n');
  
    // Determine the start and end of the current chapter
    const startLine = chapter.line - 1; // Start from the chapter's line (convert to 0-based index)
    const endLine =
      chapterIndex + 1 < chapters.length
        ? chapters[chapterIndex + 1].line - 1 // Next chapter's line - 1
        : lines.length; // If it's the last chapter, go to the end of the document
  
    const chapterLines = lines.slice(startLine, endLine); // Extract lines for the current chapter
    const textToSummarize = chapterLines.join('\n'); // Join lines into a single text
    setSummarizingIndex(chapterIndex);
  
    try {
      const response: SummarizeTextResponse = await summarizeText(textToSummarize);
      const updatedChapters = [...chapters];
      updatedChapters[chapterIndex].summary = response.summary; // Update the summary
      setChapters(updatedChapters);
    } catch (error) {
      console.error('Error summarizing text:', error);
    } finally {
      setSummarizingIndex(null);
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
                  <div className={styles.fileTextWithLineNumbers}>
                    {file.text?.split('\n').map((line, lineIndex) => (
                      <div key={lineIndex} className={styles.line}>
                        <span className={styles.lineNumber}>{lineIndex + 1}</span>
                        <span className={styles.lineText}>
                          {line.trim() === '' ? '\u00A0' : line} {/* Non-breaking space for empty lines */}
                        </span>
                      </div>
                    ))}
                  </div>
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
                    <Button
                      appearance="subtle"
                      onClick={() => handleSummarize(index)}
                      disabled={summarizingIndex === index}
                      className={styles.summarizeButton}
                    >
                      {summarizingIndex === index ? t('summarizing') : t('summarize')}
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
        </DrawerBody>
      </OverlayDrawer>
    </div>
  );
};

export default TextDetailDrawer;
