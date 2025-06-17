import { Text, Persona } from '@fluentui/react-components';
import UserMessageItemStyles from './UserMessageItemStyles';
import { Message } from '../../../../models/Message';

interface UserMessageItemProps {
  message: Message;
}

const UserMessageItem = ({ message }: UserMessageItemProps) => {
  const styles = UserMessageItemStyles();

  return (
    <div className={styles.container}>
      <div className={styles.messageContent}>
        <Text className={styles.content}>{message.content as string}</Text>
      </div>
      <div className={styles.avatarContainer}>
        <Persona
          textPosition="before"
          secondaryText={new Date(message.created_at).toLocaleDateString()}
          tertiaryText={new Date(message.created_at).toLocaleTimeString()}
        />
      </div>
    </div>
  );
};

export default UserMessageItem;
