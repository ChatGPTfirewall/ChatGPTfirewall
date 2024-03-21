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
  Send24Regular
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { HighlightWithinTextarea } from 'react-highlight-within-textarea';
import { useAuth0 } from '@auth0/auth0-react';

interface SearchMessageItemProps {
  message: Message;
  onSendToChatGPT: () => void;
  isLoading: boolean;
}

const SearchMessageItem = ({
  message,
  onSendToChatGPT,
  isLoading = false
}: SearchMessageItemProps) => {
  const styles = SearchMessageItemStyles();
  const { t } = useTranslation();
  const [editable, setEditable] = useState(false);
  const [visible, setVisible] = useState(false);
  // displayed results
  const [results, setResults] = useState<Result[]>(message.content as Result[]);
  // results holding the old state while editing the normal results
  const [tempResults, setTempResults] = useState<Result[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user: auth0User } = useAuth0();


  const [, setMaxApiCalls] = useState<number | null>(null);

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
  };

  const handleSaveClick = () => {
    setEditable(false);
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
                  <Caption1Strong className={styles.statText}>
                    {t('searchMessageStatText', {
                      index: i + 1,
                      filename: result.fileName,
                      accuracy: (result.accuracy * 100).toFixed(2)
                    })}
                  </Caption1Strong>
                  {editable ? (
                    <div className={styles.textarea}>
                      <HighlightWithinTextarea
                        value={result.content}
                        highlight={[]}
                        onChange={(value: string) => handleContentChange(i, value)}
                      />
                    </div>
                  ) : (
                    <Text className={styles.resultContent}>{result.content}</Text>
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
