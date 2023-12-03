import { useRef, useState, useEffect } from "react";
import { Panel, DefaultButton, TextField, SpinButton, PrimaryButton, Text } from "@fluentui/react";
import { Send24Regular, SparkleFilled } from "@fluentui/react-icons";

import styles from "./DemoPage.module.css";

import { chatApi, chatWithLLM, Fact, getSettings, Settings } from "../../api";
import { Answer, AnswerError, AnswerLoading } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import { DemoList } from "../../components/Example";
import { UserChatMessage } from "../../components/UserChatMessage";
import { AnalysisPanelTabs } from "../../components/AnalysisPanel";
import { ClearChatButton } from "../../components/ClearChatButton";
import FileExplorer from "../../components/FileExplorer/FileExplorer";
import { useAuth0 } from "@auth0/auth0-react";
import { useTranslation } from 'react-i18next';
import { UserLoading } from "../../components/UserChatMessage/UserLoading";
import { SettingsButton } from "../../components/SettingsButton";



const DemoPage = () => {
    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);

    const defaultPrompt: string = `Beantworten Sie die Frage anhand des unten stehenden Kontextes. Wenn die Frage nicht mit den angegebenen Informationen beantwortet werden kann, antworten Sie mit "Ich weiß es nicht".
    
{context}
    
Frage: 
    
{question}
    
Antwort: "" `

    const defaultSettings: Settings = {
        prompt_template: "",
        pre_phrase_count: 2,
        post_phrase_count: 2,
        fact_count: 3
    };
    const { t, i18n } = useTranslation();

    const lastQuestionRef = useRef<string>("");
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);
    const [settings, setSettings] = useState<Settings>(defaultSettings);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingLLM, setIsLoadingLLM] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();
    const [question, setQuestion] = useState("");
    const [editMode, setEditMode] = useState<boolean>(false);

    const [activeCitation, setActiveCitation] = useState<string>();
    const [activeAnalysisPanelTab, setActiveAnalysisPanelTab] = useState<AnalysisPanelTabs | undefined>(undefined);

    const [selectedAnswer, setSelectedAnswer] = useState<number>(0);
    const [answers, setAnswers] = useState<[user: Fact[] | string, ai: Fact[] | string][]>([]);

    const { user } = useAuth0();

    const makeApiRequest = async (question: string) => {
        lastQuestionRef.current = question;
        setIsLoading(true)

        try {
            const response = await chatApi(question, `auth0|demo_user_${i18n.language}`);
            setQuestion(question)
            response.facts.map((fact) => { fact.answer = `${fact.context_before}\n${fact.answer}\n${fact.context_after}` })
            setAnswers([...answers, [question, response.facts]]);
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };



    const clearChat = () => {
        lastQuestionRef.current = "";
        error && setError(undefined);
        setActiveCitation(undefined);
        setActiveAnalysisPanelTab(undefined);
        setAnswers([]);
    };

    const updateSearchResults = (updatedSearchResults: Fact[], answer_index?: number) => {
        const updatedAnswers = [...answers]
        updatedAnswers[answer_index!][1] = updatedSearchResults
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


    const getSettingsRequest = async (auth0_id: string) => {
        try {
            const response = await getSettings(auth0_id);
            setSettings(response)
        } catch (e) {
            setError(e);
        }
    }


    useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }), [isLoading, isLoadingLLM]);


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

    const onToggleTab = (tab: AnalysisPanelTabs, index: number) => {
        if (activeAnalysisPanelTab === tab && selectedAnswer === index) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveAnalysisPanelTab(tab);
        }

        setSelectedAnswer(index);
    };
    const modifiedSub = `auth0|demo_user_${i18n.language}`;

    return (
        <div className={styles.container}>
            <div className={styles.commandsContainer}>
                <FileExplorer user={{ ...user, sub: modifiedSub }} deletedHook={() => { }} />
                <ClearChatButton className={styles.commandButton} onClick={clearChat} disabled={!lastQuestionRef.current || isLoading} />
                <SettingsButton className={styles.commandButton} onClick={() => { setIsConfigPanelOpen(!isConfigPanelOpen); getSettingsRequest(`auth0|demo_user_${i18n.language}`); }} />
            </div>
            <div className={styles.chatRoot}>
                <div className={styles.chatContainer}>
                    {!lastQuestionRef.current ? (
                        <div className={styles.chatEmptyState}>
                            <SparkleFilled fontSize={"120px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label="Chat logo" />
                            <h1 className={styles.chatEmptyStateTitle}>{t('demoPageChatWithData')}</h1>
                            <h2 className={styles.chatEmptyStateSubtitle}>{t('askTryExample')}</h2>
                            <DemoList onExampleClicked={onExampleClicked} lang={i18n.language} />

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
                            disabled={false}
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
                        readOnly
                    />
                    <SpinButton
                        className={styles.chatSettingsSeparator}
                        label={t('prephrases')}
                        min={1}
                        max={8}
                        defaultValue={settings.pre_phrase_count.toString()}
                        disabled
                    />
                    <SpinButton
                        className={styles.chatSettingsSeparator}
                        label={t('postphrases')}
                        min={1}
                        max={8}
                        defaultValue={settings.post_phrase_count.toString()}
                        disabled
                    />
                    <SpinButton
                        className={styles.chatSettingsSeparator}
                        label={t('factCount')}
                        min={1}
                        max={5}
                        defaultValue={settings.fact_count.toString()}
                        disabled
                    />
                </Panel>
            </div>
        </div>
    );

};

export default DemoPage;
