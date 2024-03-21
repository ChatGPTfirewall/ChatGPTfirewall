import { Text, Persona } from '@fluentui/react-components';
import UserMessageItemStyles from './UserMessageItemStyles';
import { Message } from '../../../../models/Message';
import { useUser } from '../../../../context/UserProvider';

interface UserMessageItemProps {
  message: Message;
}

const truncateString = (str: string, num: number) => {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + '...';
};

const UserMessageItem = ({ message }: UserMessageItemProps) => {
  const styles = UserMessageItemStyles();
  const { user } = useUser();
  const truncatedName = truncateString(user!.username, 8);

  return (
    <div className={styles.container}>
      <div className={styles.messageContent}>
        <Text className={styles.content}>{message.content as string}</Text>
      </div>
      <div className={styles.avatarContainer}>
        <Persona
          textPosition="before"
          name={truncatedName}
          primaryText={truncatedName}
          secondaryText={new Date(message.created_at).toLocaleDateString()}
          tertiaryText={new Date(message.created_at).toLocaleTimeString()}
        />
      </div>
    </div>
  );
};

export default UserMessageItem;
