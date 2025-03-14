import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFileDetails, updateFileHeadings } from '../../api/fileApi';
import { useUser } from '../../context/UserProvider';
import { File } from '../../models/File';
import FilePageStyles from './FilesStyles';
import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle } from '@fluentui/react-components';
import { LocationAddLeftFilled, ArrowLeft24Regular, TextBulletListSquareSparkleRegular, ChatAddRegular } from '@fluentui/react-icons';
import { tokens } from '@fluentui/react-components';
import FileSidebar from '../../components/layout/FilesSideBar/FileSideBar';
import { categorizeText } from '../../api/categorizeApi';
import { summarizeText, SummarizeTextResponse } from '../../api/summarizeApi';
import { createRoom, updateRoomFiles } from '../../api/roomsApi';
import { useTranslation } from 'react-i18next';

const FileDetailPage = () => {
    const styles = FilePageStyles();
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const summaryRef = useRef<HTMLDivElement>(null);
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    const [summarizingIndex, setSummarizingIndex] = useState<{ fileId: string; index: number } | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(localStorage.getItem('sidebarCollapsed') === 'true');

    const [fullSummarizationState, setFullSummarizationState] = useState({
        isOpen: false,
        isAborted: false,
        currentIndex: 0,
        totalChapters: 0,
        summarizedCount: 0,
        startTime: 0,
        estimatedTimeLeft: '',
        avgTimePerChapter: 0,
    });    

    const isAbortedRef = useRef(fullSummarizationState.isAborted);

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
                const chapters = file.headings;
                const chapter = chapters[chapterIndex];
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
        if (location.pathname === '/files') {
            setIsSidebarCollapsed(false);
          }
        if (!user || !id) return;
        setFile(null);
        getFileDetails(id)
            .then((fileDetails) => {
                setFile(fileDetails);
            })
            .catch((error) => {
                console.error("Error fetching file details:", error);
            });
    }, [id, location.pathname]);

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
    
    const handleStartFullSummarization = async () => {
        if (!file || !file.headings) return;
    
        let latestFile = file;
        const chaptersToSummarize = latestFile.headings?.filter(ch => !ch.summary) || [];
        if (chaptersToSummarize.length === 0) return;
    
        setFullSummarizationState(prev => ({
            ...prev,
            isOpen: true,
            isAborted: false,
            currentIndex: 0,
            totalChapters: chaptersToSummarize.length,
            summarizedCount: 0,
            startTime: Date.now(),
            estimatedTimeLeft: "0",
            avgTimePerChapter: 0, 
        }));
    
        isAbortedRef.current = false;
    
        for (let i = 0; i < chaptersToSummarize.length; i++) {
            while (isAbortedRef.current) {
                setFullSummarizationState(prev => ({
                    ...prev,
                    isAborted: true,
                    isOpen: false,
                }));
                return;
            }
    
            if (latestFile.headings) {
                await handleSummarize(latestFile, latestFile.headings.indexOf(chaptersToSummarize[i]));
            }
    
            // Ensure latest file state is updated after summarization
            await new Promise(resolve => setTimeout(resolve, 0)); 
            setFile(prev => {
                if (!prev) return prev;
                latestFile = prev;
                return prev;
            });
    
            setFullSummarizationState(prev => {
                const elapsedTime = (Date.now() - prev.startTime) / 1000;
                const avgTimePerChapter = elapsedTime / (i + 1); // Compute only on completion
                const estimatedTimeLeft = avgTimePerChapter * (chaptersToSummarize.length - (i + 1));
    
                return {
                    ...prev,
                    summarizedCount: i + 1,
                    avgTimePerChapter, // Store the correct average time
                    estimatedTimeLeft: estimatedTimeLeft.toFixed(2),
                };
            });
        }
    
        setFullSummarizationState(prev => ({
            ...prev,
            isOpen: false,
        }));
    };
    

const abortSummarization = () => {
    setFullSummarizationState(prev => {
        const newAbortedState = true;
        isAbortedRef.current = newAbortedState;
        return { ...prev, isAborted: newAbortedState };
    });
};
    
const FullSummarizationDialog = () => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(0);

    useEffect(() => {
        if (!fullSummarizationState.isOpen || !fullSummarizationState.startTime) return;

        const interval = setInterval(() => {
            const newElapsedTime = ((Date.now() - fullSummarizationState.startTime) / 1000);
            setElapsedTime(newElapsedTime);

            if (fullSummarizationState.summarizedCount > 0) {
                setEstimatedTimeLeft(parseFloat(fullSummarizationState.estimatedTimeLeft));
            } else {
                setEstimatedTimeLeft(0);
            }
        }, 250);

        return () => clearInterval(interval);
    }, [fullSummarizationState.isOpen, fullSummarizationState.summarizedCount]);

    return (
        <Dialog modalType="alert" open={fullSummarizationState.isOpen}>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>{t('fullSummarizationInProgress')}</DialogTitle>
                    <DialogContent>
                        <p>{t('progress')}: {fullSummarizationState.summarizedCount} / {fullSummarizationState.totalChapters}</p>
                        <progress value={fullSummarizationState.summarizedCount} max={fullSummarizationState.totalChapters} style={{ width: '100%' }}></progress>
                        <p>{t('percentage')}: {((fullSummarizationState.summarizedCount / fullSummarizationState.totalChapters) * 100).toFixed(2)}%</p>
                        <p>{t('timePer')}: {fullSummarizationState.avgTimePerChapter.toFixed(2)}s</p>
                        <p>{t('elapsedTime')}: {elapsedTime.toFixed(2)}s</p>
                        <p>{t('estimatedTimeLeft')}: {estimatedTimeLeft}s</p>
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={abortSummarization} 
                            disabled={fullSummarizationState.isAborted}
                        >
                            {fullSummarizationState.isAborted ? t('waitingToAbort') : t('abort')}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
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
        <div className={styles.container}>
            <FileSidebar collapsed={isSidebarCollapsed} onCollapsedChange={setIsSidebarCollapsed} />
            {/* Left Panel w/ Text */}
            <div className={styles.leftPanel} style={{ flex: 1 }}>
            {/* Pinned Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #ccc', background: '#fff', height: '4rem', maxWidth: "50vw" }}>
                <Button icon={<ArrowLeft24Regular />} onClick={() => navigate(-1)} style={{ background: tokens.colorBrandBackground, color: "white" }} />
                <h2 className={styles.headerTitle} style={{ marginLeft: '10px', overflow: "hidden" }}>{file?.filename || t('document')}</h2>
                <Button 
                className={styles.createRoomButton}
                icon={<ChatAddRegular/>} 
                onClick={handleCreateRoom} 
                disabled={loading} 
                >
                {loading ? t('loading') : t('createRoomFileButton')}
                </Button>
                </div>

            {/* Scrollable Content */}
            <div className={styles.scrollableContent} ref={contentRef} style={{flex: 1, padding: '20px' }}>
                {file ? (
                file.text?.split('\n').map((line, index) => (
                  <div key={index} style={{
                      display: 'grid',
                      gridTemplateColumns: '50px auto',
                      alignItems: 'start'
                  }}>
                      <span className={styles.lineNumber}>
                      {index + 1}
                      </span>
                      <p data-line={index + 1} className={styles.lineText} style={{ margin: 0}}>{line}</p>
                  </div>
                  ))                    
                ) : (
                <p>{t('SelectFilesDialog')}</p>
                )}
            </div>
            </div>

            {/* Divider */}
            <div className={styles.divider} style={{background: "#ccc"}} />

            {/* Right Panel w/ Chapters & Summaries */}
            <div className={styles.rightPanel} style={{ flex: 1 }}>
            {/* Pinned Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #ccc', background: '#fff', height: '4rem' }}>
                <h3 className={styles.summaryTitle}>{t('headingsAndSummaries')}</h3>
                {file?.headings?.length ? (
                    <Button
                        icon={<TextBulletListSquareSparkleRegular />}
                        onClick={handleStartFullSummarization}
                        disabled={loading}
                    >
                        {t('fullSummarize')}
                    </Button>
                ) : null}
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
                    <div key={index} className={styles.chapterContainer} data-line={chapter.line}>
                    <div className={styles.chapterHeader}>
                        <Button icon={<LocationAddLeftFilled />} style={{color: tokens.colorBrandForeground1}} onClick={() => scrollToMatch(contentRef, chapter.line)} />
                        <h3 style={{ marginLeft: '10px', wordBreak: 'break-all' }}>{chapter.heading}</h3>
                        <p style={{ marginLeft: '10px' }}>{t('line') + ": " + chapter.line}</p>
                    </div>
                    <div className={styles.summaryText}>
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
            {/* Render the Full Summarization Dialog */}
            <FullSummarizationDialog />
            </div>
        </div>
    );
};

export default FileDetailPage;
