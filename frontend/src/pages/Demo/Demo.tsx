import { useTranslation } from 'react-i18next';
import DemoStyles from './DemoStyles';
import { Button, Switch } from '@fluentui/react-components';
import { DocumentBulletListMultiple24Regular } from '@fluentui/react-icons';
import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { File } from '../../models/File';
import ChatInput from '../../components/common/Messages/ChatInput/ChatInput';
import { Room } from '../../models/Room';
import { getRooms, updateRoomFiles } from '../../api/roomsApi';
import { useToast } from '../../context/ToastProvider';
import ChatContainer from '../../components/layout/ChatContainer/ChatContainer';
import { Message, Result } from '../../models/Message';
import {
  createChatGPTMessage,
  createSearchMessage
} from '../../api/messageApi';
import FileSelector from '../../components/common/FileSelector/FileSelector';
import ExampleCards from '../../components/common/Cards/ExampleCards/ExampleCards';

const demoUserIdDE = 'auth0|demo_user_de';
const demoUserIdEN = 'auth0|demo_user_en';

const Demo = () => {
  const styles = DemoStyles();
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const [anonymized, setAnonymized] = useState(true);
  const [isMessageLoading, setIsMessageLoading] = useState(false);

  useEffect(() => {
    const fetchDemoUser = (auth0_id: string) => {
      getRooms(auth0_id)
        .then((fetchedRooms) => {
          setRoom(fetchedRooms[0]);
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.error || t('unexpectedErrorOccurred');
          showToast(`${t('errorFetchingRooms')}: ${errorMessage}`, 'error');
        });
    };

    i18n.language.startsWith('en')
      ? fetchDemoUser(demoUserIdEN)
      : fetchDemoUser(demoUserIdDE);
  }, [i18n.language, showToast, t]);

  const toggleAnonymization = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      setAnonymized(ev.currentTarget.checked);
    },
    [setAnonymized]
  );

  const onExampleClicked = (example?: string) => {
    onSendMessage(example!);
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

    const updatedRoom = {
      ...room,
      messages: [...room.messages, newMessage, tempMessage]
    };
    setRoom(updatedRoom);

    createSearchMessage(newMessage)
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
        showToast(`${t('errorSendingMessage')}: ${errorMessage}`, 'error');
      })
      .finally(() => setIsMessageLoading(false));
  };

  // Doc-Hint: Should be a different solution where message should be grouped together with question and context.
  const messageToChatGPT = (room: Room) => {
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
      content: 'Loading',
      created_at: new Date().toISOString()
    };

    setIsMessageLoading(true);

    const updatedRoom = {
      ...room,
      messages: [...room.messages, chatGPTMessage, tempMessage]
    };
    setRoom(updatedRoom);

    createChatGPTMessage(chatGPTMessage, true)
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

  return (
    <div className={styles.chatRoot}>
      <div className={styles.header}>
        <Switch
          className={styles.anonSwitch}
          checked={anonymized}
          onChange={toggleAnonymization}
          label={anonymized ? t('isAnonymizedText') : t('isNotAnonymizedText')}
        />
        <div className={styles.actions}>
          <FileSelector
            selectedFiles={room?.files || []}
            onFilesSelected={handleSelectedFiles}
            triggerButton={(triggerProps) => (
              <Button
                {...triggerProps}
                size="large"
                appearance="subtle"
                icon={<DocumentBulletListMultiple24Regular />}
              />
            )}
            passedUser={room?.user}
          />
        </div>
      </div>
      {room && room.messages.length === 0 ? (
        <div className={styles.exampleContainer}>
          <div className={styles.chatEmptyState}>
            <h1 className={styles.chatEmptyStateTitle}>Demo</h1>
            <h2 className={styles.chatEmptyStateSubtitle}>
              {t('exampleCardsSubtitle')}
            </h2>
            <ExampleCards onExampleClicked={onExampleClicked} />
          </div>
          <ChatInput onSendMessage={onSendMessage} demo />
        </div>
      ) : (
        <div className={styles.chatContainer}>
          <ChatContainer
            messages={room?.messages || []}
            onSendToChatGPT={onSendToChatGPT}
            isLoading={isMessageLoading}
          />
          <ChatInput onSendMessage={onSendMessage} demo />
        </div>
      )}
    </div>
  );
};

export default Demo;
