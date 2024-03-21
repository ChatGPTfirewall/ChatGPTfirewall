import {
  Text,
  Persona,
  Skeleton,
  SkeletonItem
} from '@fluentui/react-components';
import ChatGPTMessageItemStyles from './ChatGPTMessageItemStyles';
import { Message } from '../../../../models/Message';
import { BotSparkleRegular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';

interface ChatGPTMessageItemProps {
  message: Message;
  isLoading?: boolean;
}

const ChatGPTMessageItem = ({
  message,
  isLoading = false
}: ChatGPTMessageItemProps) => {
  const styles = ChatGPTMessageItemStyles();
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.avatarContainer}>
        <Persona
          avatar={{ icon: <BotSparkleRegular /> }}
          primaryText={t('chatGPTRoleName')}
          secondaryText={new Date(message.created_at).toLocaleDateString()}
          tertiaryText={new Date(message.created_at).toLocaleTimeString()}
        />
      </div>
      <div className={styles.messageContent}>
        {isLoading && message.content == 'Loading' ? (
          <Skeleton>
            <div className={styles.contentSkeleton}>
              <SkeletonItem />
              <SkeletonItem />
              <SkeletonItem />
            </div>
          </Skeleton>
        ) : (
          <Text className={styles.content}>{message.content as string}</Text>
        )}
      </div>
    </div>
  );
};

export default ChatGPTMessageItem;
