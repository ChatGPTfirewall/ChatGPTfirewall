import { useRef, useState, useEffect } from "react";
import { Panel, DefaultButton, TextField, SpinButton, PrimaryButton, Text } from "@fluentui/react";
import { Send24Regular, SparkleFilled } from "@fluentui/react-icons";

import styles from "./Chat.module.css";

import { chatApi, chatWithLLM, Fact, getSettings, Settings, updateSettings } from "../../api";
import { Answer, AnswerError, AnswerLoading } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import { ExampleList } from "../../components/Example";
import { UserChatMessage } from "../../components/UserChatMessage";
import { AnalysisPanelTabs } from "../../components/AnalysisPanel";
import { ClearChatButton } from "../../components/ClearChatButton";
import FileExplorer from "../../components/FileExplorer/FileExplorer";
import { KnowledgeBaseModal } from "../../components/KnowledgeBaseModal";
import { User, useAuth0 } from "@auth0/auth0-react";
import { AuthenticationButton } from "../../components/AuthenticationButton";
import { useTranslation } from 'react-i18next';
import { UserLoading } from "../../components/UserChatMessage/UserLoading";
import { getDocuments } from '../../api';
import { SettingsButton } from "../../components/SettingsButton";


const Chat = () => {

    const { t } = useTranslation();
    const [isDemoRequestSent, setIsDemoRequestSent] = useState(false);

    const defaultPrompt_de: string = `Beantworten Sie die Frage anhand des unten stehenden Kontextes. Wenn die\nFrage nicht mit den angegebenen Informationen beantwortet werden kann, antworten Sie\nmit \"Ich weiß es nicht\".\n\n{context}\n\nFrage: \n\n{question}\n\nAntwort: \"\"`

    const defaultPrompt_en: string = `Answer the question using the context below. If the\nquestion cannot be answered with the information provided, answer with \"I don't know\".\n\n{context}\n\nQuestion: \n\n{question}\n\nAnswer: \"\"`

    const defaultSettings: Settings = {
        prompt_template: defaultPrompt_de,
        pre_phrase_count: 2,
        post_phrase_count: 2,
        fact_count: 3
    };




    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [filesExists, setFileExists] = useState(false);

    const lastQuestionRef = useRef<string>("");
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingLLM, setIsLoadingLLM] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();
    const [question, setQuestion] = useState("");
    const [editMode, setEditMode] = useState<boolean>(false);

    const [activeCitation, setActiveCitation] = useState<string>();
    const [activeAnalysisPanelTab, setActiveAnalysisPanelTab] = useState<AnalysisPanelTabs | undefined>(undefined);

    const [selectedAnswer, setSelectedAnswer] = useState<number>(0);
    const [answers, setAnswers] = useState<[user: Fact[] | string, ai: Fact[] | string][]>([]);

    const { user, isAuthenticated } = useAuth0();

    const makeApiRequest = async (question: string) => {
        lastQuestionRef.current = question;
        setIsLoading(true)

        try {
            const response = await chatApi(question, user!);
            setQuestion(question)
            response.facts.map((fact) => { fact.answer = `${fact.context_before}\n${fact.answer}\n${fact.context_after}` })
            setAnswers([...answers, [question, response.facts]]);
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSettingsRequest = async (auth0_id: string, settings: Settings) => {
        try {
            const response = await updateSettings(auth0_id, settings);
        } catch (e) {
            setError(e);
        }
    };

    const getSettingsRequest = async (auth0_id: string) => {
        try {
            const response = await getSettings(auth0_id);
            setSettings(response)
        } catch (e) {
            setError(e);
        }
    }

    const clearChat = () => {
        lastQuestionRef.current = "";
        error && setError(undefined);
        setActiveCitation(undefined);
        setActiveAnalysisPanelTab(undefined);
        setAnswers([]);
    };

    const updateSearchResults = (updatedSearchResults: Fact[], answer_index: number) => {
        const updatedAnswers = [...answers]
        updatedAnswers[answer_index][1] = updatedSearchResults
        setAnswers(updatedAnswers)
    }

    const changeEditMode = () => {
        setEditMode(!editMode)
    }

    const sendText = async (index: number) => {
        setIsLoadingLLM(true)
        const context = (answers[index][1] as Fact[]).map((fact) => fact.answer).join('\n\n');

        try {
            const llmAnswer = await chatWithLLM(question, context, settings.prompt_template)
            setAnswers([...answers, [answers[index][1], llmAnswer.result]])
        } catch (e) {
            setError(e);
        } finally {
            setIsLoadingLLM(false);
        }
    };

    function handleSettingsChange<K extends keyof Settings>(key: K, newValue: Settings[K]): void {
        setSettings(prevSettings => ({
            ...prevSettings,
            [key]: newValue
        }));
    }

    type SettingsKeyType = keyof Settings;

    function createOnChangeHandler(
        key: SettingsKeyType,
        transformFunction: (value: string) => any = value => value // Annahme, dass alle Eingaben ursprünglich Strings sind
    ): (e: React.SyntheticEvent<HTMLElement>, newValue?: string) => void {
        return (e, newValue) => {
            const transformedValue = transformFunction(newValue || "");
            handleSettingsChange(key, transformedValue);
        };
    }

    const resetToDefaultPrompt_de = () => {
        handleSettingsChange('prompt_template', defaultPrompt_de)
    }
    const resetToDefaultPrompt_en = () => {
        handleSettingsChange('prompt_template', defaultPrompt_en)
    }

    useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }), [isLoading, isLoadingLLM]);


    useEffect(() => {
        if (isAuthenticated) {
            checkFilesFromUser(user!);
            getSettingsRequest(user!.sub!);

        }
    }, [user, isAuthenticated]);

    const checkFilesFromUser = (user: User) => {
        getDocuments(user.sub!).then((response) => {
            if (response.length > 0) {
                setFileExists(true);
            } else {
                setFileExists(false);
            }
        });
    }

    const onExampleClicked = (example: string) => {
        makeApiRequest(example);
    };

    const onShowCitation = (citation: string, index: number) => {
        if (activeCitation === citation && activeAnalysisPanelTab === AnalysisPanelTabs.CitationTab && selectedAnswer === index) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveCitation(citation);
            setActiveAnalysisPanelTab(AnalysisPanelTabs.CitationTab);
        }

        setSelectedAnswer(index);
    };

    useEffect(() => {
        if (isAuthenticated && !isDemoRequestSent) {
            setIsDemoRequestSent(true);
        }
    }, [isAuthenticated, user, isDemoRequestSent]);

    useEffect(() => {
        if (isAuthenticated) {
            updateSettingsRequest(user!.sub!, settings);
        }

    }, [settings]);

    const onToggleTab = (tab: AnalysisPanelTabs, index: number) => {
        if (activeAnalysisPanelTab === tab && selectedAnswer === index) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveAnalysisPanelTab(tab);
        }

        setSelectedAnswer(index);
    };

    if (isAuthenticated) {
        return (
            <div className={styles.container}>
                <div className={styles.commandsContainer}>
                    <FileExplorer user={user!} deletedHook={() => { checkFilesFromUser(user!) }} />
                    <ClearChatButton className={styles.commandButton} onClick={clearChat} disabled={!lastQuestionRef.current || isLoading} />
                    <SettingsButton className={styles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
                    <KnowledgeBaseModal buttonClassName={styles.commandButton} uploadHook={() => { checkFilesFromUser(user!) }} />
                </div>
                <div className={styles.chatRoot}>
                    <div className={styles.chatContainer}>
                        {!lastQuestionRef.current ? (
                            <div className={styles.chatEmptyState}>
                                <SparkleFilled fontSize={"120px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label="Chat logo" />
                                <h1 className={styles.chatEmptyStateTitle}>{t('chatWithYourData')}</h1>
                                <h2 className={styles.chatEmptyStateSubtitle}>{t('askTryExample')}</h2>
                                <ExampleList onExampleClicked={onExampleClicked} />
                            </div>
                        ) : (
                            <div className={styles.chatMessageStream}>
                                {answers.map((answer, index) => (
                                    <div key={index}>
                                        <UserChatMessage answer={answer[0]} question={question} />
                                        <div className={styles.chatMessageGpt}>
                                            <Answer
                                                key={index}
                                                answer_index={index}
                                                searchResults={answer[1]}
                                                isSelected={selectedAnswer === index && activeAnalysisPanelTab !== undefined}
                                                onCitationClicked={c => onShowCitation(c, index)}
                                                onThoughtProcessClicked={() => onToggleTab(AnalysisPanelTabs.ThoughtProcessTab, index)}
                                                onSupportingContentClicked={() => onToggleTab(AnalysisPanelTabs.SupportingContentTab, index)}
                                                onFollowupQuestionClicked={q => makeApiRequest(q)}
                                                onChange={updateSearchResults}
                                                editMode={editMode}
                                            >
                                                {(index === answers.length - 1) ? (
                                                    <>
                                                        {!editMode ? (
                                                            <div className={styles.buttonGroup}>

                                                                <DefaultButton onClick={changeEditMode}>
                                                                    <Text>{t('editSearchResults')}</Text>
                                                                </DefaultButton>
                                                                <PrimaryButton onClick={() => sendText(index)}><div className={styles.sendButton}><span>{t('send')}</span> <Send24Regular></Send24Regular></div> </PrimaryButton>
                                                            </div>
                                                        ) : (
                                                            <div className={styles.buttonGroup}>
                                                                <DefaultButton onClick={changeEditMode}>
                                                                    <Text>{t('Okay')}</Text>
                                                                </DefaultButton>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <></>
                                                )}
                                            </Answer>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <>
                                        <UserChatMessage answer={question} />
                                        <div className={styles.chatMessageGptMinWidth}>
                                            <AnswerLoading />
                                        </div>
                                    </>
                                )}
                                {isLoadingLLM && (
                                    <>
                                        <UserLoading />
                                    </>
                                )}
                                {error ? (
                                    <>
                                        <UserChatMessage answer={question} />
                                        <div className={styles.chatMessageGptMinWidth}>
                                            <AnswerError error={error.toString()} onRetry={() => makeApiRequest(lastQuestionRef.current)} />
                                        </div>
                                    </>
                                ) : null}
                                <div ref={chatMessageStreamEnd} />
                            </div>
                        )}
                        <div className={styles.chatInput}>
                            <QuestionInput
                                clearOnSend
                                placeholder={t('chatTextType')}
                                disabled={!filesExists}
                                onSend={question => makeApiRequest(question)}
                            />
                        </div>
                    </div>
                    <Panel
                        headerText="Configure answer generation"
                        isOpen={isConfigPanelOpen}
                        isBlocking={false}
                        onDismiss={() => setIsConfigPanelOpen(false)}
                        closeButtonAriaLabel="Close"
                        onRenderFooterContent={() => <DefaultButton onClick={() => setIsConfigPanelOpen(false)}>Close</DefaultButton>}
                        isFooterAtBottom={true}
                    >
                        <TextField
                            className={styles.chatSettingsSeparator}
                            value={settings.prompt_template}
                            label={t('promptTemplate')}
                            multiline
                            autoAdjustHeight
                            onChange={createOnChangeHandler('prompt_template')}
                        />
                        <DefaultButton
                            className={styles.resetButton}
                            onClick={resetToDefaultPrompt_de}
                        >
                            {t('resetToDefaultPrompt_de')}
                        </DefaultButton>
                        <DefaultButton
                            className={styles.resetButton}
                            onClick={resetToDefaultPrompt_en}
                        >
                            {t('resetToDefaultPrompt_en')}
                        </DefaultButton>
                        <SpinButton
                            className={styles.chatSettingsSeparator}
                            label={t('prephrases')}
                            min={0}
                            max={8}
                            defaultValue={settings.pre_phrase_count.toString()}
                            onChange={createOnChangeHandler('pre_phrase_count', parseInt)}
                        />
                        <SpinButton
                            className={styles.chatSettingsSeparator}
                            label={t('postphrases')}
                            min={0}
                            max={8}
                            defaultValue={settings.post_phrase_count.toString()}
                            onChange={createOnChangeHandler('post_phrase_count', parseInt)}
                        />
                        <SpinButton
                            className={styles.chatSettingsSeparator}
                            label={t('factCount')}
                            min={1}
                            max={5}
                            defaultValue={settings.fact_count.toString()}
                            onChange={createOnChangeHandler('fact_count', parseInt)}
                        />
                    </Panel>
                </div>
            </div>
        );
    }
    return (
        <div className={styles.chatRoot}>
            <div className={styles.chatContainer}>
                <div className={styles.chatEmptyState}>
                    <SparkleFilled fontSize={"120px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label="Chat logo" />
                    <h1 className={styles.chatEmptyStateTitle}>{t('chatWithYourData')}</h1>
                    <h2 className={styles.chatEmptyStateSubtitle}>{t('loginAndAskAnything')}</h2>
                    <AuthenticationButton />
                </div>
            </div>
        </div>
    )
};



export default Chat;
