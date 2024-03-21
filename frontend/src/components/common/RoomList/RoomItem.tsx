import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Room } from '../../../models/Room';
import { MoreVertical24Regular } from '@fluentui/react-icons';
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  mergeClasses,
  Input
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import RoomItemStyles from './RoomItemStyles';

interface RoomItemProps {
  room: Room;
  onRename: (roomID: string, newName: string) => void; // Anpassen, um den neuen Namen als Argument zu akzeptieren
  onDelete: (roomID: string) => void;
}

const RoomItem = ({ room, onRename, onDelete }: RoomItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(room.name);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const styles = RoomItemStyles();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isSelected = location.pathname === `/chat/room/${room.id}`;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleRoomClick = () => {
    navigate(`/chat/room/${room.id}`);
  };

  const handleRenameClick = () => {
    setIsEditing(true);
  };

  const handleBlurOrEnter = () => {
    if (tempName.trim() === '') {
      setTempName(room.name);
    } else {
      onRename(room.id, tempName);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={mergeClasses(
        styles.roomItemContainer,
        isSelected ? styles.selected : styles.unselected
      )}
    >
      {isEditing ? (
        <Input
          value={tempName}
          onChange={(_event, data) => setTempName(data.value || '')}
          onBlur={handleBlurOrEnter}
          onKeyDown={(event) => event.key === 'Enter' && handleBlurOrEnter()}
          ref={inputRef}
        />
      ) : (
        <Button
          appearance="subtle"
          className={styles.roomButton}
          onClick={handleRoomClick}
        >
          <span className={styles.textArea}>{room.name}</span>
        </Button>
      )}

      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <MenuButton
            appearance="subtle"
            icon={<MoreVertical24Regular />}
            onClick={(event) => event.stopPropagation()}
            className={styles.menuButton}
          />
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem onClick={handleRenameClick}>{t('renameRoom')}</MenuItem>
            <MenuItem onClick={() => onDelete(room.id)}>
              {t('deleteRoom')}
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </div>
  );
};

export default RoomItem;
