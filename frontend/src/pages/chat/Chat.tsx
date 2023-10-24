import { useRef, useState, useEffect } from "react";
import { Checkbox, Panel, DefaultButton, TextField, SpinButton, PrimaryButton, Text } from "@fluentui/react";
import { Send24Regular, SparkleFilled } from "@fluentui/react-icons";

import styles from "./Chat.module.css";

import { chatApi, chatWithLLM, Fact } from "../../api";
import { Answer, AnswerError, AnswerLoading } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import { ExampleList } from "../../components/Example";
import { UserChatMessage } from "../../components/UserChatMessage";
import { AnalysisPanelTabs } from "../../components/AnalysisPanel";
import { ClearChatButton } from "../../components/ClearChatButton";
import FileExplorer from "../../components/FileExplorer/FileExplorer";
import { KnowledgeBaseModal } from "../../components/KnowledgeBaseModal";
import { useAuth0 } from "@auth0/auth0-react";
import { AuthenticationButton } from "../../components/AuthenticationButton";
import { DemoButton } from "../../components/DemoButton";
import DemoPage from "../demoPage/DemoPage";
import { useTranslation } from 'react-i18next';
import { UserLoading } from "../../components/UserChatMessage/UserLoading";



const Chat = () => {

    const { t } = useTranslation();


    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
    const [promptTemplate, setPromptTemplate] = useState<string>("");
    const [retrieveCount, setRetrieveCount] = useState<number>(3);
    const [useSemanticRanker, setUseSemanticRanker] = useState<boolean>(true);
    const [useSemanticCaptions, setUseSemanticCaptions] = useState<boolean>(false);
    const [useSuggestFollowupQuestions, setUseSuggestFollowupQuestions] = useState<boolean>(false);

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
            setPromptTemplate(response.prompt_template)
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
            const llmAnswer = await chatWithLLM(question, context, promptTemplate)
            setAnswers([...answers, [answers[index][1], llmAnswer.result]])
        } catch (e) {
            setError(e);
        } finally {
            setIsLoadingLLM(false);
        }
    };





    useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }), [isLoading, isLoadingLLM]);

    const onPromptTemplateChange = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setPromptTemplate(newValue || "");
    };

    const onRetrieveCountChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setRetrieveCount(parseInt(newValue || "3"));
    };

    const onUseSemanticRankerChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSemanticRanker(!!checked);
    };

    const onUseSemanticCaptionsChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSemanticCaptions(!!checked);
    };


    const onUseSuggestFollowupQuestionsChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSuggestFollowupQuestions(!!checked);
    };

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

    if (isAuthenticated) {

        if (user!.email === 'demo@demo.demo') {
            // Weiterleitung zur Demo-Seite
            return (<DemoPage />)
        }
        return (
            <div className={styles.container}>
                <div className={styles.commandsContainer}>
                    <FileExplorer user={user!} />
                    <ClearChatButton className={styles.commandButton} onClick={clearChat} disabled={!lastQuestionRef.current || isLoading} />
                    {/* <SettingsButton className={styles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} /> */}
                    <KnowledgeBaseModal buttonClassName={styles.commandButton} />
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
                                disabled={isLoading}
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
                            defaultValue={promptTemplate}
                            label="Override prompt template"
                            multiline
                            autoAdjustHeight
                            onChange={onPromptTemplateChange}
                        />

                        <SpinButton
                            className={styles.chatSettingsSeparator}
                            label="Retrieve this many documents from search:"
                            min={1}
                            max={50}
                            defaultValue={retrieveCount.toString()}
                            onChange={onRetrieveCountChange}
                        />
                        <Checkbox
                            className={styles.chatSettingsSeparator}
                            checked={useSemanticRanker}
                            label="Use semantic ranker for retrieval"
                            onChange={onUseSemanticRankerChange}
                        />
                        <Checkbox
                            className={styles.chatSettingsSeparator}
                            checked={useSemanticCaptions}
                            label="Use query-contextual summaries instead of whole documents"
                            onChange={onUseSemanticCaptionsChange}
                            disabled={!useSemanticRanker}
                        />
                        <Checkbox
                            className={styles.chatSettingsSeparator}
                            checked={useSuggestFollowupQuestions}
                            label="Suggest follow-up questions"
                            onChange={onUseSuggestFollowupQuestionsChange}
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
                    <h2 className={styles.chatEmptyStateSubtitle}>{t('card3Demo')}</h2>
                    <DemoButton />
                </div>
            </div>
        </div>
    )
};



export default Chat;
