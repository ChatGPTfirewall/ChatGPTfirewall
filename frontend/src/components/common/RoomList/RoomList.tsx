import { useState, useRef, useEffect } from 'react';
import RoomItem from './RoomItem';
import { Room } from '../../../models/Room';
import { Button, Input } from '@fluentui/react-components';
import { ChatAddRegular } from '@fluentui/react-icons';
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

const RoomList = () => {
  const styles = RoomListStyles();
  const { t } = useTranslation();
  const { user } = useUser();
  const { showToast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const newRoomInputRef = useRef<HTMLInputElement | null>(null);

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

  return (
    <div>
      <Button
        appearance="secondary"
        className={styles.createRoomButton}
        onClick={handleShowCreateInput}
        icon={<ChatAddRegular/>}
      >
        {t('createRoomButton')}
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
      {rooms.map((room, index) => (
        <RoomItem
          key={index}
          room={room}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

export default RoomList;
