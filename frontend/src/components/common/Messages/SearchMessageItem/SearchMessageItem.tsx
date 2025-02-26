import { useState, useEffect, Fragment } from 'react';
import {
  Text,
  Button,
  Tooltip,
  mergeClasses,
  Body1Strong,
  Body1Stronger,
  Divider,
  Caption1Strong,
  Persona,
  Skeleton,
  SkeletonItem
} from '@fluentui/react-components';
import SearchMessageItemStyles from './SearchMessageItemStyles';
import { Message, Result } from '../../../../models/Message';
import { getUser } from '../../../../api/usersApi';
import {
  DatabaseSearchRegular,
  Edit24Regular,
  Info20Regular,
  Send24Regular,
  DocumentSearchRegular
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { HighlightWithinTextarea } from 'react-highlight-within-textarea';
import { useAuth0 } from '@auth0/auth0-react';
import { Dropdown, Option, OptionOnSelectData } from '@fluentui/react-components';
import { OpenAIModel } from '../../../../models/Message';
import { useNavigate } from 'react-router-dom';

interface SearchMessageItemProps {
  message: Message;
  onSendToChatGPT: () => void;
  isLoading: boolean;
  onSaveMessage: (updatedMessage: Message) => void;
}

const SearchMessageItem = ({
  message,
  onSendToChatGPT,
  isLoading = false,
  onSaveMessage
}: SearchMessageItemProps) => {
  const styles = SearchMessageItemStyles();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [editable, setEditable] = useState(false);
  const [visible, setVisible] = useState(false);
  // displayed results
  const [results, setResults] = useState<Result[]>(message.content as Result[]);
  // results holding the old state while editing the normal results
  const [tempResults, setTempResults] = useState<Result[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user: auth0User } = useAuth0();

  const [, setMaxApiCalls] = useState<number | null>(null);

  const availableModels = [
    { key: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: t('gpt35turbo_description') },
    { key: 'gpt-4o', label: 'GPT-4o', description: t('gpt4o_description') },
    { key: 'gpt-4o-mini', label: 'GPT-4o Mini', description: t('gpt4o_mini_description') }
  ];
  
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o-mini');
  
  // Handle model selection change
  const handleModelChange = (_event: React.SyntheticEvent, data: OptionOnSelectData) => {
    if (data.optionValue) {
      setSelectedModel(data.optionValue);
      message.model = data.optionValue as OpenAIModel;
    }
  };

  useEffect(() => {
    if (!message.model) {
      message.model = selectedModel as OpenAIModel;
    }
  }, [message, selectedModel]);

  useEffect(() => {
    const fetchUserFromBackend = async () => {
      if (auth0User?.sub) {
        try {
          const fetchedUser = await getUser(auth0User.sub);
          setMaxApiCalls(fetchedUser.max_api_calls);
          if (fetchedUser.max_api_calls === 0) {
            setErrorMessage(`${t('trialOverMessage')}`);
          } else {
            setResults(message.content as Result[]);
            setErrorMessage(null);
          }
        } catch (error) {
          console.error(
            'Error fetching user from backend, creating new one.',
            error
          );
        }
      }
    };

    fetchUserFromBackend();
  }, [message.content]);

  const handleEditClick = () => {
    setEditable(true);
    setTempResults(structuredClone(results));
    // Store the combined value as the new value for editing
    setResults((prevResults) =>
      prevResults.map((result) => ({
        ...result,
        content: `${result.context_before} ${result.content} ${result.context_after}`,
      }))
    );
  };

  const handleSaveClick = () => {
    setEditable(false);
  
    const updatedResults = results.map((result, index) => {
      const prevResult = tempResults[index];
  
      // Check if the result content has changed
      const isChanged =
        result.content !== `${prevResult.context_before} ${prevResult.content} ${prevResult.context_after}`;
  
      if (isChanged) {
        // Only update if there's a change
        return {
          ...result,
          context_before: '',
          content: result.content,
          context_after: ''
        };
      }
  
      // If no change, return the result as-is
      return prevResult;
    });

    setResults(updatedResults);
    message.content = updatedResults;
    onSaveMessage(message); // Call the onSaveMessage prop with the updated message
  };

  const handleDiscardClick = () => {
    setEditable(false);
    setResults(structuredClone(tempResults));
  };

  const handleContentChange = (index: number, value: string) => {
    setResults((prevResults) => {
      const newResults = [...prevResults];
      newResults[index].content = value;
      return newResults;
    });
  };
  return (
    <div className={styles.container}>
      {/* Persona */}
      <div className={styles.avatarContainer}>
        <Persona
          avatar={{ icon: <DatabaseSearchRegular /> }}
          primaryText={t('resultRoleName')}
          secondaryText={new Date(message.created_at).toLocaleDateString()}
          tertiaryText={new Date(message.created_at).toLocaleTimeString()}
        />
      </div>
      <div className={styles.messageContent}>
        {/* Header */}
        <Body1Strong className={styles.introText}>
          {t('searchMessageIntroText')}
        </Body1Strong>
        {/* Body */}
        <Divider />
        {isLoading && message.content.length == 0 ? (
          <div>
            <Skeleton>
              {Array.from({ length: 3 }, (_, index) => (
                <Fragment key={index}>
                  <div className={styles.statSkeleton}>
                    <SkeletonItem size={16} />
                    <SkeletonItem size={16} />
                    <SkeletonItem size={16} />
                    <SkeletonItem size={16} />
                  </div>
                  <div className={styles.contentSkeleton}>
                    <SkeletonItem size={16} />
                    <SkeletonItem size={16} />
                    <SkeletonItem size={16} />
                  </div>
                </Fragment>
              ))}
            </Skeleton>
          </div>
        ) : (
          <>
            {errorMessage ? (
              <Text>{errorMessage}</Text>
            ) : (
              results.map((result: Result, i: number) => (
                <div key={i} className={styles.resultContainer}>
                  {/* Left Section: Filename & Accuracy */}
                  <div className={styles.resultHeader}>
                    <Caption1Strong className={styles.statText}>
                      {t('searchMessageStatText', {
                        index: i + 1,
                        filename: String(result.fileName), // Bold filename
                        accuracy: (result.accuracy * 100).toFixed(2)
                      })}
                    </Caption1Strong>
                    <Button icon={<DocumentSearchRegular/>} onClick={() => navigate(`/files/${result.fileId}`)}>
                    {t('viewFileButton')}
                    </Button>
                  </div>
                  {editable ? (
                    <div className={styles.textarea}>
                      <HighlightWithinTextarea
                        value={result.content}
                        highlight={[]}
                        onChange={(value: string) => handleContentChange(i, value)}
                      />
                    </div>
                  ) : (
                    <Text className={styles.resultContent}>
                      {result.context_before} <strong>{result.content}</strong> {result.context_after}
                    </Text>
                  )}
                </div>
              ))
            )}
          </>
        )}
        <Divider />
        {/* Footer */}
        <Body1Stronger className={styles.introText}>
          {t('searchMessageIntroHint')}
        </Body1Stronger>
        <div className={styles.actionButtons}>
          {editable ? (
            <>
              <Button appearance="secondary" onClick={handleDiscardClick}>
                {t('cancelEditResultsButton')}
              </Button>
              <Button appearance="primary" onClick={handleSaveClick}>
                {t('save')}
              </Button>
            </>
          ) : (
            <>
              <Button
                appearance="secondary"
                icon={<Edit24Regular />}
                onClick={handleEditClick}
                disabled={isLoading && message.content.length == 0}
              >
                {t('editResultsButton')}
              </Button>
              <div style={{ display: 'flex', fontWeight: 'bold', gap: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', alignContent: 'center' }}>
                  {t('aiModelLabel')}:
                </label>
                <Dropdown
                  value={selectedModel}
                  onOptionSelect={handleModelChange}
                  aria-label="Select AI Model"
                >
                  {availableModels.map((model) => (
                    <Option key={model.key} value={model.key} text={model.label}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <strong>{model.label}</strong>
                        <span style={{ opacity: 0.7 }}>{model.description}</span>
                      </div>
                    </Option>
                  ))}
                </Dropdown>
              </div>
              <div>
                <Button
                  iconPosition="after"
                  appearance="primary"
                  icon={<Send24Regular />}
                  onClick={onSendToChatGPT}
                  disabled={isLoading && message.content.length == 0}
                >
                  {t('sendToChatGPTButton')}
                </Button>
                <Tooltip
                  content={t('chatGPTSendHint')}
                  withArrow
                  relationship="description"
                  onVisibleChange={(_e, data) => setVisible(data.visible)}
                >
                  <Info20Regular
                    tabIndex={0}
                    className={mergeClasses(visible && styles.visible)}
                  />
                </Tooltip>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchMessageItem;
