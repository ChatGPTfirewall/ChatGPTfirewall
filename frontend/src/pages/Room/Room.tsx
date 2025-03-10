import { RoomSettings, Room as RoomType } from '../../models/Room';
import ChatContainer from '../../components/layout/ChatContainer/ChatContainer';
import RoomStyles from './RoomStyles';
import ChatInput from '../../components/common/Messages/ChatInput/ChatInput';
import { Body1, Body1Strong, Button, Switch } from '@fluentui/react-components';
import {
  AddRegular,
  DocumentAdd48Regular,
  DocumentQueueAddRegular,
  BookSearchRegular,
  Settings32Regular
} from '@fluentui/react-icons';
import { File } from '../../models/File';
import { useNavigate, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { Message, Result, OpenAIModel } from '../../models/Message';

import { t } from 'i18next';
import SettingsDrawer from '../../components/layout/SettingsDrawer/SettingsDrawer';
import TextDetailDrawer from '../../components/layout/TextDetailDrawer/TextDetailDrawer';
import { useToast } from '../../context/ToastProvider';
import { getRoom, updateRoom, updateRoomFiles } from '../../api/roomsApi';
import {
  createChatGPTMessage,
  createSearchMessage,
  createWebSearchMessage
} from '../../api/messageApi';
import FileSelector from '../../components/common/FileSelector/FileSelector';
import InfoHover from '../../components/common/Dialogs/InfoHover';
import { AnonymizationMapping } from '../../models/AnonymizationMapping';

const Room = () => {
  const styles = RoomStyles();
  const { id } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [fileDetailDrawerOpen, setFileDetailDrawerOpenState] = useState(false);
  const [settingsDrawerOpen, setSettingsDrawerOpenState] = useState(false);
  const [anonymized, setAnonymized] = useState(true);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<'document' | 'web' | 'gpt' >('document');
  const [preferedModel, setPreferedModel] = useState<OpenAIModel>(OpenAIModel.GPT_4O_MINI);

  const anonymizeContent = useCallback(
    (
      content: string,
      anonymizationMappings: AnonymizationMapping[],
      anonymize: boolean,
      room: RoomType | null
    ) => {
      const anonymizeString = (inputString: string) => {
        const escapeRegex = (str: string) =>
          str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes special regex characters

        const sortedMappings = [...anonymizationMappings].sort(
          (a, b) => b.deanonymized.length - a.deanonymized.length
        );

        return sortedMappings.reduce((acc, { anonymized, deanonymized, entityType }) => {
          const target = anonymize ? deanonymized : anonymized;
          const replacement = anonymize ? anonymized : deanonymized;

          // Create a regex to match target with or without ending period (.)
          let regex;
          if (target.endsWith('.')) {
            regex = new RegExp(`\\b${escapeRegex(target)}`, 'gmi');
          } else {
            regex = new RegExp(`\\b${escapeRegex(target)}\\b`, 'gmi');
          }

          // Always de-anonymize if not anonymizing
          if (!anonymize || room?.settings.active_anonymization_types.includes(entityType)) {
            return acc.replace(regex, ` ${replacement}`);
          }

          // If entityType is not in the active_anonymization_types and we are anonymizing, skip this mapping
          return acc;
        }, inputString);
      };

      return anonymizeString(content);
    },
    []
  );
  

  useEffect(() => {
    if (id) {
      getRoom(id)
        .then((fetchedRoom) => {
          setRoom(fetchedRoom);
          if (anonymized) {
            setRoom((prevRoom) => anonymizeRoomMessages(prevRoom, !anonymized, anonymizeContent));
            setRoom((prevRoom) => anonymizeRoomMessages(prevRoom, anonymized, anonymizeContent));
          }
          else {
            setRoom((prevRoom) => anonymizeRoomMessages(prevRoom, anonymized, anonymizeContent));
          }
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.error || t('unexpectedErrorOccurred');
          showToast(`${t('errorFetchingRoom')}: ${errorMessage}`, 'error');
          navigate('/');
        });
    }
  }, [id, showToast, navigate]);

  const anonymizeRoomMessages = (room: RoomType | null, anonymized: boolean, anonymizeContent: Function) => {
    if (!room) return null;

    const updatedMessages = room.messages.map((message) => {
      let updatedContent = message.content;
      if (message.role === 'system' && Array.isArray(message.content)) {
        updatedContent = message.content.map((contentObj) => ({
          ...contentObj,
          content: anonymizeContent(
            contentObj.content,
            room.anonymizationMappings,
            anonymized,
            room
          ),
          context_after: anonymizeContent(
            contentObj.context_after,
            room.anonymizationMappings,
            anonymized,
            room
          ),
          context_before: anonymizeContent(
            contentObj.context_before,
            room.anonymizationMappings,
            anonymized,
            room
          )
        }));
      } else if (typeof message.content === 'string') {
        updatedContent = anonymizeContent(
          message.content,
          room.anonymizationMappings,
          anonymized,
          room
        );
      }
      return { ...message, content: updatedContent };
    });

    return { ...room, messages: updatedMessages };
  };

  useEffect(() => {
    setRoom((prevRoom) => anonymizeRoomMessages(prevRoom, anonymized, anonymizeContent));
  }, [anonymized, anonymizeContent]);

  const toggleAnonymization = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      setAnonymized(ev.currentTarget.checked);
    },
    [setAnonymized]
  );

  const onChangeMessageType = (value: string) => {
    if (value === 'document' || value === 'web' || value === 'gpt') {
      setSearchMode(value);
      return;
    }
    console.error("Unknown Search Mode:", value);
  };

  const onModelChange = (model: OpenAIModel) => {
    setPreferedModel(model);
  };

  const onSendMessage = (value: string) => {
    if (!room) {
      showToast(t('errorNoRoom'), 'error');
      return;
    }

    const newMessage: Message = {
      user: room.user,
      room: room,
      role: 'user',
      content: value,
      created_at: new Date().toISOString()
    };

    const tempMessage: Message = {
      user: room.user,
      room: room,
      role: 'system',
      content: [],
      created_at: new Date().toISOString()
    };

    setIsMessageLoading(true);

    const updatedRoomWithoutTemp = {
      ...room,
      messages: [...room.messages, newMessage]
    };
    setRoom(updatedRoomWithoutTemp);

    const updatedRoom = {
      ...room,
      messages: [...room.messages, newMessage, tempMessage]
    };
    setRoom(updatedRoom);

    if (searchMode === 'web') {
      onSendWebSearch(value);
    } else if (searchMode === 'gpt') {
      onSendDirectlyToChatGPT(value);
    } else if (searchMode === 'document') {
        createSearchMessage(newMessage)
          .then((createdMessage) => {
            if (Array.isArray(createdMessage.content)) {
              createdMessage.content.forEach((contentObj: Result) => {
                if (anonymized) {
                  contentObj.content = anonymizeContent(
                    contentObj.content,
                    createdMessage.room.anonymizationMappings,
                    anonymized,
                    room
                  );
                  contentObj.context_before = anonymizeContent(
                    contentObj.context_before,
                    createdMessage.room.anonymizationMappings,
                    anonymized,
                    room
                  );
                  contentObj.context_after = anonymizeContent(
                    contentObj.context_after,
                    createdMessage.room.anonymizationMappings,
                    anonymized,
                    room
                  );
                }
              });
            }

            setRoom((prevRoom) => {
              if (!prevRoom) return null;

              const filteredMessages = prevRoom.messages.filter(
                (msg) => msg.role !== 'system'
              );
              const newMessages = [...filteredMessages, createdMessage];

              return {
                ...prevRoom,
                messages: newMessages,
                anonymizationMappings: createdMessage.room.anonymizationMappings
              };
            });
          })
          .catch((error) => {
            const errorMessage =
              error.response?.data?.error || t('unexpectedErrorOccurred');
            showToast(`${t('errorSendingMessage')}: ${errorMessage}`, 'error');
          })
          .finally(() => setIsMessageLoading(false));
      } else {
        console.error("unknown search mode:", searchMode);
      }
  };
  // Doc-Hint: Should be a different solution where message should be grouped together with question and context.
  const messageToChatGPT = (room: RoomType) => {
    let question = '';
    let context = '';
    const promptTemplate =
      room.settings && room.settings.prompt_template
        ? room.settings.prompt_template
        : '';
  
    if (room.messages && room.messages.length >= 2) {
      const lastIndex = room.messages.length - 1;
  
      question = room.messages[lastIndex - 1].content as string;
  
      const contextResults = room.messages[lastIndex].content as Result[];
      context = contextResults
        .map((result) => {
          // Collect context parts conditionally
          const parts = [];
          if (result.context_before) parts.push(result.context_before);
          parts.push(result.content);
          if (result.context_after) parts.push(result.context_after);
  
          // Join them with a space and return
          return parts.join(' ');
        })
        .join('\n');
    } else {
      showToast(t('errorNotEnoughMessages'), 'error');
    }
  
    return `${promptTemplate}\n\n${t('question')}:\n${question}\n\n${t('context')}:\n${context}`;
  };

  const getModelFromLastMessage = (room: RoomType) => {
    if (room.messages && room.messages.length >= 2) {
      const lastIndex = room.messages.length - 1;
      let model = room.messages[lastIndex].model as OpenAIModel;
      return model;
    }
  };

  const onSendWebSearch = (question: string) => {
    if (!room) {
      showToast(t('errorNoRoom'), 'error');
      return;
    }
    const webSearchMessage: Message = {
      user: room.user,
      room: room,
      role: 'user',
      content: `${t('searchTemplate')} ${question}`,
      created_at: new Date().toISOString(),
      model: preferedModel,
    };

    const tempMessage: Message = {
      user: room.user,
      room: room,
      role: 'assistant',
      content: t('searchingWeb'),
      created_at: new Date().toISOString()
    };

    setIsMessageLoading(true);

    const updatedRoom = {
      ...room,
      messages: [...room.messages, webSearchMessage, tempMessage]
    };
    setRoom(updatedRoom);
    
    createWebSearchMessage(webSearchMessage)
      .then((createdMessage) => {
        const updatedMessages = updatedRoom.messages
          .slice(0, -1)
          .concat(createdMessage);
        setRoom({
          ...updatedRoom,
          messages: updatedMessages
        });
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.error || t('unexpectedErrorOccurred');
        showToast(`Error: ${errorMessage}`, 'error');
      })
      .finally(() => setIsMessageLoading(false));
    }

  const onSendDirectlyToChatGPT = (question: string) => {
    if (!room) {
      showToast(t('errorNoRoom'), 'error');
      return;
    }
  
    const chatGPTMessage: Message = {
      user: room.user,
      room: room,
      role: 'user',
      content: question,
      created_at: new Date().toISOString(),
      model: preferedModel,
    };

    const tempMessage: Message = {
      user: room.user,
      room: room,
      role: 'assistant',
      content: t('loading'),
      created_at: new Date().toISOString()
    };

    setIsMessageLoading(true);

    const updatedRoom = {
      ...room,
      messages: [...room.messages, chatGPTMessage, tempMessage]
    };
    setRoom(updatedRoom);

    createChatGPTMessage(chatGPTMessage)
      .then((createdMessage) => {
        const updatedMessages = updatedRoom.messages
          .slice(0, -1)
          .concat(createdMessage);
        setRoom({
          ...updatedRoom,
          messages: updatedMessages
        });
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.error || t('unexpectedErrorOccurred');
        showToast(
          `${t('errorSendingMessageToChatGPT')}: ${errorMessage}`,
          'error'
        );
      })
      .finally(() => setIsMessageLoading(false));
  };

  const onSendToChatGPT = () => {
    if (!room) {
      showToast(t('errorNoRoom'), 'error');
      return;
    }

    const chatGPTMessage: Message = {
      user: room.user,
      room: room,
      role: 'user',
      content: messageToChatGPT(room),
      created_at: new Date().toISOString(),
      model: getModelFromLastMessage(room),
    };

    const tempMessage: Message = {
      user: room.user,
      room: room,
      role: 'assistant',
      content: t('loading'),
      created_at: new Date().toISOString()
    };

    setIsMessageLoading(true);

    const updatedRoom = {
      ...room,
      messages: [...room.messages, chatGPTMessage, tempMessage]
    };
    setRoom(updatedRoom);

    createChatGPTMessage(chatGPTMessage)
      .then((createdMessage) => {
        const updatedMessages = updatedRoom.messages
          .slice(0, -1)
          .concat(createdMessage);
        setRoom({
          ...updatedRoom,
          messages: updatedMessages
        });
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.error || t('unexpectedErrorOccurred');
        showToast(
          `${t('errorSendingMessageToChatGPT')}: ${errorMessage}`,
          'error'
        );
      })
      .finally(() => setIsMessageLoading(false));
  };

  const handleSelectedFiles = (selectedFiles: File[]) => {
    if (!room) {
      showToast(t('errorNoRoom'), 'error');
      return;
    }

    const fileIds = selectedFiles.map((file) => file.id || '');

    updateRoomFiles(room.id, fileIds)
      .then((updatedRoom) => {
        setRoom(updatedRoom);
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.error || t('unexpectedErrorOccurred');
        showToast(
          `${t('errorUpdatingRoomDocuments')}: ${errorMessage}`,
          'error'
        );
      });
  };

  const onSaveSettings = (updatedSettings: RoomSettings) => {
    if (!room) {
      showToast(t('errorNoRoom'), 'error');
      return;
    }

    const updatedRoom = {
      ...room,
      settings: updatedSettings
    };

    updateRoom(updatedRoom)
      .then((updatedRoom) => {
        setRoom(updatedRoom);
        showToast(t('settingsSavedSuccessfully'), 'success');
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.error || t('unexpectedErrorOccurred');
        showToast(`${t('errorSavingSettings')}: ${errorMessage}`, 'error');
      });

    closeSettingsDrawer();
  };

  const openFileDetailDrawer = () => {
    setFileDetailDrawerOpenState(true);
  };

  const closeFileDetailDrawer = () => {
    setFileDetailDrawerOpenState(false);
  };

  const openSettingsDrawer = () => {
    setSettingsDrawerOpenState(true);
  };

  const closeSettingsDrawer = () => {
    setSettingsDrawerOpenState(false);
  };

  // Empty files list state
  if (!room || room.files.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <DocumentAdd48Regular className={styles.addIcon} />
        <div className={styles.emptyTextContainer}>
          <Body1Strong>{t('emptyStateBodyTextStrong')}</Body1Strong>
          <Body1 className={styles.bodyText}>{t('emptyStateBodyText')}</Body1>
        </div>
        <FileSelector
          selectedFiles={[]}
          onFilesSelected={handleSelectedFiles}
          triggerButton={(triggerProps) => (
            <Button
              {...triggerProps}
              appearance="primary"
              icon={<AddRegular />}
              className={styles.emptyAddFilesButton}
            >
              {t('addFilesEmptyPage')}
            </Button>
          )}
        />
      </div>
    );
  }

  return (
    <div className={styles.roomContainer}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>{room.name}</span>
        <div>
        <InfoHover>
          <div style={{ padding: '8px', width: "35rem" }}>
            <strong>{t('entityTokensHeading')}</strong>
            <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '8px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', paddingLeft: "3rem", borderBottom: '1px solid #ddd', paddingBottom: '2px' }}>
                    {t('tokenColumn')}
                  </th>
                  <th style={{ textAlign: 'right', paddingRight: "11rem", borderBottom: '1px solid #ddd', paddingBottom: '2px' }}>
                    {t('explanationColumn')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { token: 'CARDINAL', explanation: t('cardinalExplanation') },
                  { token: 'DATE', explanation: t('dateExplanation') },
                  { token: 'EVENT', explanation: t('eventExplanation') },
                  { token: 'FAC', explanation: t('facExplanation') },
                  { token: 'GPE', explanation: t('gpeExplanation') },
                  { token: 'LANGUAGE', explanation: t('languageExplanation') },
                  { token: 'LAW', explanation: t('lawExplanation') },
                  { token: 'LOC', explanation: t('locExplanation') },
                  { token: 'MONEY', explanation: t('moneyExplanation') },
                  { token: 'MISC', explanation: t('miscExplanation') },
                  { token: 'NORP', explanation: t('norpExplanation') },
                  { token: 'ORDINAL', explanation: t('ordinalExplanation') },
                  { token: 'ORG', explanation: t('orgExplanation') },
                  { token: 'PERCENT', explanation: t('percentExplanation') },
                  { token: 'PERSON, PER', explanation: t('personExplanation') },
                  { token: 'PRODUCT', explanation: t('productExplanation') },
                  { token: 'QUANTITY', explanation: t('quantityExplanation') },
                  { token: 'TIME', explanation: t('timeExplanation') },
                  { token: 'WORK_OF_ART', explanation: t('workOfArtExplanation') },
                ].map((item, index) => (
                  <tr key={index}>
                    <td style={{ padding: '4px', borderBottom: '1px solid #ddd' }}>{item.token}</td>
                    <td style={{ padding: '4px', borderBottom: '1px solid #ddd' }}>{item.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InfoHover>

          <Switch
            className={styles.anonSwitch}
            checked={anonymized}
            onChange={toggleAnonymization}
            label={anonymized ? t('isAnonymizedText') : t('isNotAnonymizedText')}
          />
        </div>
        <div className={styles.actions}>
        <Button
            size="large"
            appearance="subtle"
            icon={<BookSearchRegular />}
            onClick={openFileDetailDrawer}
          />
          <TextDetailDrawer
            open={fileDetailDrawerOpen}
            closeDrawer={closeFileDetailDrawer}
            room={room}
          />
          <Button
            size="large"
            appearance="subtle"
            icon={<Settings32Regular />}
            onClick={openSettingsDrawer}
          />
          <SettingsDrawer
            open={settingsDrawerOpen}
            closeDrawer={closeSettingsDrawer}
            room={room}
            onSave={onSaveSettings}
          />
          <FileSelector
            selectedFiles={room.files}
            onFilesSelected={handleSelectedFiles}
            triggerButton={(triggerProps) => (
              <Button
                {...triggerProps}
                size="large"
                appearance="subtle"
                icon={<DocumentQueueAddRegular />}
              />
            )}
          />
        </div>
      </div>
      <ChatContainer
        messages={room.messages}
        onSendToChatGPT={onSendToChatGPT}
        isLoading={isMessageLoading}
        
      />
      <ChatInput
        onSendMessage={onSendMessage}
        onChangeMessageType={onChangeMessageType}
        onModelChange={onModelChange}
        selectedModel={preferedModel}
        selectedMessageType={searchMode}
      />
    </div>
  );
};

export default Room;
