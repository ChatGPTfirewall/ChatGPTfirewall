import { useState, useRef, useEffect } from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import RoomItem from './RoomItem';
import { Room } from '../../../models/Room';
import { Button, Input } from '@fluentui/react-components';
import {ChatAddRegular, DocumentQueueAddRegular} from '@fluentui/react-icons';
import RoomListStyles from './RoomListStyles';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../../context/UserProvider';
import {
  createRoom,
  deleteRoom,
  getRooms,
  updateRoom
} from '../../../api/roomsApi';
import { useToast } from '../../../context/ToastProvider';

type TimeCategory = 'today' | 'yesterday' | 'previousDays';

interface GroupedRooms {
  today: Room[];
  yesterday: Room[];
  previousDays: Room[];
}

const RoomList = () => {
  const styles = RoomListStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useUser();
  const { showToast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const newRoomInputRef = useRef<HTMLInputElement | null>(null);

  // Helper function to determine time category
  const getTimeCategory = (createdAt: Date): TimeCategory => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const roomDate = new Date(createdAt);
    const roomDateOnly = new Date(roomDate.getFullYear(), roomDate.getMonth(), roomDate.getDate());
    
    if (roomDateOnly.getTime() === today.getTime()) {
      return 'today';
    } else if (roomDateOnly.getTime() === yesterday.getTime()) {
      return 'yesterday';
    } else {
      return 'previousDays';
    }
  };

  // Group rooms by time category
  const groupedRooms: GroupedRooms = rooms.reduce<GroupedRooms>(
    (groups, room) => {
      const category = getTimeCategory(room.created_at);
      groups[category].push(room);
      return groups;
    },
    { today: [], yesterday: [], previousDays: [] }
  );

  // Sort rooms within each group by creation date (newest first)
  Object.keys(groupedRooms).forEach(key => {
    const category = key as TimeCategory;
    groupedRooms[category].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  });

  // change focus to input for rename or new room
  useEffect(() => {
    if (isCreating) {
      newRoomInputRef.current?.focus();
    }
  }, [isCreating]);

  // fetch all rooms for the user initially
  useEffect(() => {
    if (user && user.auth0_id) {
      getRooms(user.auth0_id)
        .then((fetchedRooms) => {
          setRooms(fetchedRooms);
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.error || t('unexpectedErrorOccurred');
          showToast(`${t('errorFetchingRooms')}: ${errorMessage}`, 'error');
          setRooms([]);
        });
    }
  }, [user, t, showToast]);

  const handleShowCreateInput = () => {
    setIsCreating(true);
  };

  const handleCreateRoom = () => {
    if (newRoomName.trim() !== '') {
      createRoom(user!.auth0_id, newRoomName)
        .then((createdRoom) => {
          setRooms((prevRooms) => [...prevRooms, createdRoom]);
          showToast(t('roomCreatedSuccessfully'), 'success');
          setIsCreating(false);
          setNewRoomName('');
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.error || t('unexpectedErrorOccurred');
          showToast(t('errorCreateRoom') + ': ' + errorMessage, 'error');
          setIsCreating(false);
        });
    } else {
      setIsCreating(false);
    }
  };

  const handleRename = (roomId: string, newName: string) => {
    const roomToUpdate = rooms.find((room) => room.id === roomId);
    if (roomToUpdate) {
      const updatedRoom = { ...roomToUpdate, name: newName };
      updateRoom(updatedRoom)
        .then((response) => {
          const updatedRooms = rooms.map((room) =>
            room.id === roomId ? response : room
          );
          setRooms(updatedRooms);
          showToast(t('roomRenamedSuccessfully'), 'success');
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.error || t('unexpectedErrorOccurred');
          showToast(t('errorRenameRoom') + ': ' + errorMessage, 'error');
        });
    }
  };

  const handleDelete = (roomId: string) => {
    //check if roomId matches the one from the URL
    if (location.pathname === `/chat/room/${roomId}`) {
      navigate('/');
    }
    
    deleteRoom(roomId)
      .then(() => {
        const updatedRooms = rooms.filter((room) => room.id !== roomId);
        setRooms(updatedRooms);
        showToast(t('roomDeletedSuccessfully'), 'success');
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.error || t('unexpectedErrorOccurred');
        showToast(t('errorDeleteRoom') + ': ' + errorMessage, 'error');
      });
  };

  // Render function for a group of rooms
  const renderRoomGroup = (category: TimeCategory, rooms: Room[]) => {
    if (rooms.length === 0) return null;
    
    return (
      <div key={category} className={styles.sectionContainer}>
        <div className={styles.sectionTitle}>
          {t(category)}
        </div>
        {rooms.map((room, index) => (
          <RoomItem
            key={room.id || index}
            room={room}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <Link to="/files">
        <Button
          appearance="primary"
          className={styles.createRoomButton}
          icon={<DocumentQueueAddRegular/>}
        >
          {t('files')}
        </Button>
      </Link>
      <Button
        appearance="secondary"
        className={styles.createRoomButton}
        onClick={handleShowCreateInput}
        icon={<ChatAddRegular/>}
      >
        {t('newChatButton')}
      </Button>
      {isCreating && (
        <Input
          appearance="underline"
          ref={newRoomInputRef}
          value={newRoomName}
          onChange={(_event, data) => setNewRoomName(data.value || '')}
          onBlur={handleCreateRoom}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCreateRoom();
              e.preventDefault();
            }
          }}
          placeholder={t('roomNamePlaceholder')}
        />
      )}
      {renderRoomGroup('today', groupedRooms.today)}
      {renderRoomGroup('yesterday', groupedRooms.yesterday)}
      {renderRoomGroup('previousDays', groupedRooms.previousDays)}
    </div>
  );
};

export default RoomList;
