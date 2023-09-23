import { useRef, useState, useEffect } from "react";
import { Checkbox, Panel, DefaultButton, TextField, SpinButton, PrimaryButton, Modal } from "@fluentui/react";
import { SparkleFilled } from "@fluentui/react-icons";

import styles from "./Chat.module.css";

import { chatApi, Response, chatWithLLM } from "../../api";
import { Answer, AnswerError, AnswerLoading } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import { ExampleList } from "../../components/Example";
import { UserChatMessage } from "../../components/UserChatMessage";
import { AnalysisPanelTabs } from "../../components/AnalysisPanel";
import { SettingsButton } from "../../components/SettingsButton";
import { ClearChatButton } from "../../components/ClearChatButton";
import { FileExplorer } from "../../components/FileExplorer";
import { KnowledgeBaseModal } from "../../components/KnowledgeBaseModal";
import { EditTextModal } from "../../components/EditTextModal";
import { useAuth0 } from "@auth0/auth0-react";
import { AuthenticationButton } from "../../components/AuthenticationButton";
import { DemoButton } from "../../components/DemoButton";
import DemoPage from "../demoPage/DemoPage";

const Chat = () => {
    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
    const [promptTemplate, setPromptTemplate] = useState<string>("");
    const [retrieveCount, setRetrieveCount] = useState<number>(3);
    const [useSemanticRanker, setUseSemanticRanker] = useState<boolean>(true);
    const [useSemanticCaptions, setUseSemanticCaptions] = useState<boolean>(false);
    const [excludeCategory, setExcludeCategory] = useState<string>("");
    const [useSuggestFollowupQuestions, setUseSuggestFollowupQuestions] = useState<boolean>(false);

    const lastQuestionRef = useRef<string>("");
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();
    const [editText, setEditText] = useState(false);
    const [text, setText] = useState("");
    const [highlights, setHighlights] = useState<[number, number][]>([]);
    const [file, setFile] = useState("");
    const [question, setQuestion] = useState("");

    const [activeCitation, setActiveCitation] = useState<string>();
    const [activeAnalysisPanelTab, setActiveAnalysisPanelTab] = useState<AnalysisPanelTabs | undefined>(undefined);

    const [selectedAnswer, setSelectedAnswer] = useState<number>(0);
    const [answers, setAnswers] = useState<[user: string, response: Response][]>([]);

    const { user, isAuthenticated } = useAuth0();

    const makeApiRequest = async (question: string) => {
        lastQuestionRef.current = question;

        error && setError(undefined);
        setIsLoading(true);
        setActiveCitation(undefined);
        setActiveAnalysisPanelTab(undefined);

        try {
            const result = await chatApi(question, user!);
            setEditText(true)
            setText(result.facts![0].full_text)
            const transformedList: [number, number][] = result.facts![0].entities.map((entity) => [entity[1], entity[2]]);
            setHighlights(transformedList)
            setFile(result.facts![0].file)
            setQuestion(question)
            setAnswers([...answers, [question, result]]);
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };
 

    const updateChat = (llmAnswer: string) => {
        const chatMessage: Response = {
            llm_answer: llmAnswer
        }

        const shortText = text.slice(0, 300) + "..."
        setAnswers([...answers, [shortText, chatMessage]])
    }

    const clearChat = () => {
        lastQuestionRef.current = "";
        error && setError(undefined);
        setActiveCitation(undefined);
        setActiveAnalysisPanelTab(undefined);
        setAnswers([]);
    };

    const saveText = (data: any) => {
        setText(data)
    }

    const sendText = () => {
        const llmAnswer = chatWithLLM(question, file, text)
        llmAnswer.then((answer) => { updateChat(answer) })
        setEditText(false)
    };

    useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }), [isLoading]);

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

    const onExcludeCategoryChanged = (_ev?: React.FormEvent, newValue?: string) => {
        setExcludeCategory(newValue || "");
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

        return (
            <div className={styles.container}>
                <div className={styles.commandsContainer}>
                    <FileExplorer user={user!} />
                    <ClearChatButton className={styles.commandButton} onClick={clearChat} disabled={!lastQuestionRef.current || isLoading} />
                    <SettingsButton className={styles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
                    <KnowledgeBaseModal buttonClassName={styles.commandButton} />
                </div>
                <div className={styles.chatRoot}>
                    <div className={styles.chatContainer}>
                        {!lastQuestionRef.current ? (
                            <div className={styles.chatEmptyState}>
                                <SparkleFilled fontSize={"120px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label="Chat logo" />
                                <h1 className={styles.chatEmptyStateTitle}>Chat with your data</h1>
                                <h2 className={styles.chatEmptyStateSubtitle}>Ask anything or try an example</h2>
                                <ExampleList onExampleClicked={onExampleClicked} />
                            </div>
                        ) : (
                            <div className={styles.chatMessageStream}>
                                {answers.map((answer, index) => (
                                    <div key={index}>
                                        <UserChatMessage message={answer[0]} />
                                        <div className={styles.chatMessageGpt}>
                                            <Answer
                                                key={index}
                                                answer={answer[1]}
                                                isSelected={selectedAnswer === index && activeAnalysisPanelTab !== undefined}
                                                onCitationClicked={c => onShowCitation(c, index)}
                                                onThoughtProcessClicked={() => onToggleTab(AnalysisPanelTabs.ThoughtProcessTab, index)}
                                                onSupportingContentClicked={() => onToggleTab(AnalysisPanelTabs.SupportingContentTab, index)}
                                                onFollowupQuestionClicked={q => makeApiRequest(q)}
                                                showFollowupQuestions={useSuggestFollowupQuestions && answers.length - 1 === index}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <>
                                        <UserChatMessage message={lastQuestionRef.current} />
                                        <div className={styles.chatMessageGptMinWidth}>
                                            <AnswerLoading />
                                        </div>
                                    </>
                                )}
                                {error ? (
                                    <>
                                        <UserChatMessage message={lastQuestionRef.current} />
                                        <div className={styles.chatMessageGptMinWidth}>
                                            <AnswerError error={error.toString()} onRetry={() => makeApiRequest(lastQuestionRef.current)} />
                                        </div>
                                    </>
                                ) : null}
                                <div ref={chatMessageStreamEnd} />
                            </div>
                        )}
                        {!editText ? (
                            <div className={styles.chatInput}>
                                <QuestionInput
                                    clearOnSend
                                    placeholder="Type a new question (e.g. does my plan cover annual eye exams?)"
                                    disabled={isLoading}
                                    onSend={question => makeApiRequest(question)}
                                />
                            </div>
                        ) : (
                            <div className={styles.promptReady}>
                                <div className={styles.buttonGroup}>
                                    <EditTextModal text={text} highlights={highlights} sendToParent={saveText} />
                                    <PrimaryButton onClick={sendText}>Send</PrimaryButton>
                                </div>
                            </div>
                        )}
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
                        <TextField className={styles.chatSettingsSeparator} label="Exclude category" onChange={onExcludeCategoryChanged} />
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
                    <h1 className={styles.chatEmptyStateTitle}>Chat with your data</h1>
                    <h2 className={styles.chatEmptyStateSubtitle}>Login and ask anything or try an example</h2>
                    <AuthenticationButton />
                    <h2 className={styles.chatEmptyStateSubtitle}>You can try the demo</h2>
                    <DemoButton />
                </div>
            </div>
        </div>
    )
};

export default Chat;
