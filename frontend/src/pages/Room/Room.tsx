import { RoomSettings, Room as RoomType } from '../../models/Room';
import ChatContainer from '../../components/layout/ChatContainer/ChatContainer';
import RoomStyles from './RoomStyles';
import ChatInput from '../../components/common/Messages/ChatInput/ChatInput';
import { Body1, Body1Strong, Button, Switch } from '@fluentui/react-components';
import {
  AddRegular,
  DocumentAdd48Regular,
  DocumentBulletListMultiple24Regular,
  Settings32Regular
} from '@fluentui/react-icons';
import { File } from '../../models/File';
import { useNavigate, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { Message, Result } from '../../models/Message';

import { t } from 'i18next';
import SettingsDrawer from '../../components/layout/SettingsDrawer/SettingsDrawer';
import { useToast } from '../../context/ToastProvider';
import { getRoom, updateRoom, updateRoomFiles } from '../../api/roomsApi';
import {
  createChatGPTMessage,
  createSearchMessage
} from '../../api/messageApi';
import FileSelector from '../../components/common/FileSelector/FileSelector';

const Room = () => {
  const styles = RoomStyles();
  const { id } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [settingsDrawerOpen, setSettingsDrawerOpenState] = useState(false);
  const [anonymized, setAnonymized] = useState(true);
  const [isMessageLoading, setIsMessageLoading] = useState(false);

  const anonymizeContent = useCallback((content: any, anonymizationMappings: any[], anonymize: boolean) => {
    if (typeof content === 'string') {
      let processedContent = content;
  
      const sortedMappings = [...anonymizationMappings].sort((a, b) => b.deanonymized.length - a.deanonymized.length);
  
      sortedMappings.forEach(mapping => {
        const { anonymized, deanonymized } = mapping;
        const target = anonymize ? deanonymized : anonymized;
        const replacement = anonymize ? anonymized : deanonymized;
        const regex = new RegExp(`\\b${target}\\b`, 'g');
        processedContent = processedContent.replace(regex, replacement);
      });
  
      return processedContent;
    }
    else if (Array.isArray(content)) {
      return content.map(contentObject => {
        if (typeof contentObject.content !== 'string') {
          console.error('Expected content field to be a string', contentObject);
          return contentObject;
        }
  
        let processedContent = contentObject.content;
  
        const sortedMappings = [...anonymizationMappings].sort((a, b) => b.deanonymized.length - a.deanonymized.length);
  
        sortedMappings.forEach(mapping => {
          const { anonymized, deanonymized } = mapping;
          const target = anonymize ? deanonymized : anonymized;
          const replacement = anonymize ? anonymized : deanonymized;
          const regex = new RegExp(`\\b${target}\\b`, 'g');
          processedContent = processedContent.replace(regex, replacement);
        });
  
        return {
          ...contentObject,
          content: processedContent,
        };
      });
    }
    else {
      console.warn('Unexpected content type', content);
      return content;
    }
  }, []);

  useEffect(() => {
    if (id) {
      getRoom(id)
        .then(fetchedRoom => {
          setRoom(fetchedRoom);
        })
        .catch(error => {
          const errorMessage = error.response?.data?.error || t('unexpectedErrorOccurred');
          showToast(`${t('errorFetchingRoom')}: ${errorMessage}`, 'error');
          navigate('/');
        });
    }
  }, [id, showToast, navigate]);

  useEffect(() => {
    if (room) {
      const anonymizationMappings = room.anonymizationMappings.map(mapping => ({
        deanonymized: mapping.deanonymized,
        anonymized: mapping.anonymized,
      }));

      const updatedMessages = room.messages.map(message => {
        const content = anonymizeContent(message.content, anonymizationMappings, anonymized);
        return { ...message, content };
      });

      setRoom({ ...room, messages: updatedMessages });
    }
  }, [anonymized]);

  const toggleAnonymization = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      setAnonymized(ev.currentTarget.checked);
    },
    [setAnonymized]
  );

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

    createSearchMessage(newMessage)
    .then((createdMessage) => {
      const anonymizationMappings = createdMessage.room.anonymizationMappings.map(mapping => ({
        deanonymized: mapping.deanonymized,
        anonymized: mapping.anonymized,
      }));

    if (Array.isArray(createdMessage.content)) {
      createdMessage.content.forEach((contentObj: any) => {
        if (anonymized) {
          contentObj.content = anonymizeContent(contentObj.content, anonymizationMappings, anonymized);
        }
      });
    }

      //const updatedMessages = updatedRoom.messages.concat(createdMessage);

      setRoom(prevRoom => {
        if (!prevRoom) return null;
      
        const filteredMessages = prevRoom.messages.filter(msg => msg.role !== 'system');
        const newMessages = [...filteredMessages, createdMessage];
        
        return {
          ...prevRoom,
          messages: newMessages
        };
      });
    })
    .catch((error) => {
      const errorMessage = error.response?.data?.error || t('unexpectedErrorOccurred');
      showToast(`${t('errorSendingMessage')}: ${errorMessage}`, 'error');
    })
    .finally(() => setIsMessageLoading(false));
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
      context = contextResults.map((result) => result.content).join('\n');
    } else {
      showToast(t('errorNotEnoughMessages'), 'error');
    }

    return `${promptTemplate}\n\n${t('question')}:\n${question}\n\n${t('context')}:\n${context}`;
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
      created_at: new Date().toISOString()
    };

    const tempMessage: Message = {
      user: room.user,
      room: room,
      role: 'assistant',
      content: 'Loading...',
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
        <Switch
          className={styles.anonSwitch}
          checked={anonymized}
          onChange={toggleAnonymization}
          label={anonymized ? t('isAnonymizedText') : t('isNotAnonymizedText')}
        />
        <div className={styles.actions}>
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
                icon={<DocumentBulletListMultiple24Regular />}
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
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
};

export default Room;