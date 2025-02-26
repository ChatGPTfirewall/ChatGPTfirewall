import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFileDetails, updateFileHeadings } from '../../api/fileApi';
import { useUser } from '../../context/UserProvider';
import { File } from '../../models/File';
import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle } from '@fluentui/react-components';
import { ArrowLeft20Regular, ArrowLeft24Regular, TextBulletListSquareSparkleRegular, ChatAddRegular } from '@fluentui/react-icons';
import { tokens } from '@fluentui/react-components';
import FileSidebar from '../../components/layout/FilesSideBar/FileSideBar';
import { categorizeText } from '../../api/categorizeApi';
import { summarizeText, SummarizeTextResponse } from '../../api/summarizeApi';
import { createRoom, updateRoomFiles } from '../../api/roomsApi';
import { useTranslation } from 'react-i18next';

const FileDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const summaryRef = useRef<HTMLDivElement>(null);
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    const [summarizingIndex, setSummarizingIndex] = useState<{ fileId: string; index: number } | null>(null);

    const handleSummarize = async (file: File, chapterIndex: number) => {
        if (!file.text || !file.headings || file.headings.length === 0) return;
    
        const chapters = file.headings;
        const chapter = chapters[chapterIndex];
        const lines = file.text.split('\n');
    
        const startLine = chapter.line - 1;
        const endLine = chapterIndex + 1 < chapters.length ? chapters[chapterIndex + 1].line - 1 : lines.length;
        const textToSummarize = lines.slice(startLine, endLine).join('\n');
    
        setSummarizingIndex({ fileId: file.id ?? '', index: chapterIndex });
    
        try {
            const response: SummarizeTextResponse = await summarizeText(textToSummarize);
    
            if (response?.summary) {
                const updatedHeadings = [...chapters];
                updatedHeadings[chapterIndex] = { ...chapter, summary: response.summary };
    
                setFile((prev) => (prev ? { ...prev, headings: updatedHeadings } : prev));
    
                if (file.id) {
                    await updateFileHeadings(file.id, updatedHeadings);
                }
            }
        } catch (error) {
            console.error("Error summarizing text:", error);
        } finally {
            setSummarizingIndex(null);
        }
    };    

    useEffect(() => {
        if (!user || !id) return;

        console.log("Fetching file details for ID:", id);
        setFile(null);

        getFileDetails(id)
            .then((fileDetails) => {
                console.log("Fetched file details:", fileDetails);
                setFile(fileDetails);
            })
            .catch((error) => {
                console.error("Error fetching file details:", error);
            });
    }, [id]);

    const scrollToMatch = (targetRef: React.RefObject<HTMLDivElement>, line: number) => {
      if (targetRef.current) {
          const elements = targetRef.current.querySelectorAll('[data-line]');
          const targetElement = Array.from(elements).find((el) =>
              el.getAttribute('data-line') === String(line)
          );
  
          if (targetElement) {
              targetElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
              });
          }
      }
  };  

  const handleCreateRoom = async () => {
    if (!user || !file) return;

    setLoading(true);
        try {
            if (!file.id) return;
            // Step 1: Create the room
            const newRoom = await createRoom(user.auth0_id, `${file.filename}`);

            // Step 2: Add the document to the room
            await updateRoomFiles(newRoom.id, [file.id]);

            // Step 3: Navigate to the room
            navigate(`/chat/room/${newRoom.id}`);
        } catch (error) {
            console.error("Error creating room and adding file:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmReCategorize = async () => {
        if (!confirmReCategorizeFile || !confirmReCategorizeFile.text) return;
    
        setLoading(true);
        
        try {
            const response = await categorizeText(confirmReCategorizeFile.text);
            if (response?.headings) {
                const newHeadings = response.headings.map((heading: { line: number; heading: string }) => ({
                    line: heading.line,
                    heading: heading.heading,
                    summary: undefined,
                }));
    
                setFile((prev) => (prev ? { ...prev, headings: newHeadings } : prev));
    
                if (confirmReCategorizeFile.id) {
                    await updateFileHeadings(confirmReCategorizeFile.id, newHeadings);
                }
            }
        } catch (error) {
            console.error("Error re-categorizing headings:", error);
        } finally {
            setConfirmReCategorizeFile(null);
            setLoading(false);
        }
    };    

    const handleGenerateHeadings = async () => {
        if (!file || !file.text) return;
        setLoading(true);
        
        try {
            const response = await categorizeText(file.text);
            if (response?.headings) {
                const newHeadings = response.headings.map((heading: { line: number; heading: string }) => ({
                    line: heading.line,
                    heading: heading.heading,
                    summary: undefined,
                }));

                setFile((prev) => prev ? { ...prev, headings: newHeadings } : prev);
                if (file.id) await updateFileHeadings(file.id, newHeadings);
            }
        } catch (error) {
            console.error("Error generating headings:", error);
        } finally {
            setLoading(false);
        }
    };

    const [confirmReCategorizeFile, setConfirmReCategorizeFile] = useState<File | null>(null);

    return (
        <div style={{ display: 'flex', height: "calc(100vh - 55px)", width: navigator.userAgent.includes('Firefox') ? '-moz-available' : '-webkit-fill-available' }}>
            <FileSidebar />

            {/* Left Panel w/ Text */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'auto' }}>
            {/* Pinned Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #ccc', background: '#fff', height: '4rem', maxWidth: "50vw" }}>
                <Button icon={<ArrowLeft24Regular />} onClick={() => navigate(-1)} style={{ background: tokens.colorBrandBackground, color: "white" }} />
                <h2 style={{ marginLeft: '10px', flexGrow: 1, wordBreak: "break-all",  overflow: "hidden", paddingBottom: ".25rem", paddingTop: ".25rem",  maxHeight: "5rem"}}>{file?.filename || t('document')}</h2>
                <Button 
                icon={<ChatAddRegular/>} 
                onClick={handleCreateRoom} 
                disabled={loading} 
                style={{ marginLeft: '10px', minWidth: "9rem"}}
                >
                {loading ? t('loading') : t('createRoomFileButton')}
                </Button>
                </div>
            {/* New Room Button */}

            {/* Scrollable Content */}
            <div ref={contentRef} style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              userSelect: 'text',
              maxHeight: 'auto',
              }}>
                {file ? (
                file.text?.split('\n').map((line, index) => (
                  <div key={index} style={{
                      display: 'grid',
                      gridTemplateColumns: '50px auto',
                      alignItems: 'start'
                  }}>
                      <span style={{
                      textAlign: 'right',
                      paddingRight: '10px',
                      fontSize: '14px',
                      color: '#888',
                      userSelect: 'none'
                      }}>
                      {index + 1}
                      </span>
                      <p data-line={index + 1} style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{line}</p>
                  </div>
                  ))                    
                ) : (
                <p>{t('SelectFilesDialog')}</p>
                )}
            </div>
            </div>

            {/* Divider */}
            <div style={{ width: '3px', background: '#ccc',}} />

            {/* Right Panel w/ Chapters & Summaries */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'auto' }}>
            {/* Pinned Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #ccc', background: '#fff', height: '4rem' }}>
                <h3 style={{ flexGrow: 1 }}>{t('headingsAndSummaries')}</h3>
                <Button
                icon={<TextBulletListSquareSparkleRegular/>}
                onClick={() => (file?.headings?.length ? setConfirmReCategorizeFile(file) : handleGenerateHeadings())}
                disabled={loading}
                >
                {loading
                    ? t('loading')
                    : file?.headings?.length
                    ? t('reCategorize')
                    : t('categorize')}
                </Button>
            </div>

            {/* Scrollable Summaries */}
            <div ref={summaryRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', userSelect: 'text' }}>
                {file?.headings?.length ? (
                file.headings.map((chapter, index) => (
                    <div key={index} data-line={chapter.line} style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button icon={<ArrowLeft20Regular />} onClick={() => scrollToMatch(contentRef, chapter.line)} />
                        <h3 style={{ marginLeft: '10px' }}>{chapter.heading}</h3>
                        <p style={{ marginLeft: '10px' }}>{t('line') + ": " + chapter.line}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                        <Button
                        appearance="primary"
                        onClick={() => handleSummarize(file, index)}
                        disabled={summarizingIndex?.fileId === file.id && summarizingIndex?.index === index}
                        >
                        {summarizingIndex?.fileId === file.id && summarizingIndex?.index === index
                            ? t('summarizing')
                            : t('summarize')}
                        </Button>
                    </div>
                    {chapter.summary && (
                        <p>
                        <strong>{t('summary')}:</strong> {chapter.summary}
                        </p>
                    )}
                    </div>
                ))
                ) : (
                    file ? (
                        <p>{t('GenerateChaptersDialog')}</p>
                    ) : (
                        <p>{t('emptyStateBodyTextStrong')}</p>
                    )
                )}
            </div>

            {/* Confirmation Dialog for Re-Categorization */}
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
        </div>
    );
};

export default FileDetailPage;
