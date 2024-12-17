import TextDetailDrawerStyles from './TextDetailDrawerStyles';
import {
  Button,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  OverlayDrawer,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { Room } from '../../../models/Room';

interface TextDetailDrawerProps {
  open: boolean;
  closeDrawer: () => void;
  room: Room;
}

const TextDetailDrawer = ({ open, closeDrawer, room }: TextDetailDrawerProps) => {
  const styles = TextDetailDrawerStyles(); // Use the styles
  const { t } = useTranslation();

  // If `files` or `text` is unavailable, show a fallback message
  const files = room.files ?? [];
  const validFiles = files.filter((file) => file.text); // Filter files that have text

  return (
    <div>
      <OverlayDrawer
        modalType="non-modal"
        open={open}
        position="end"
        size="large"
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                icon={<Dismiss24Regular />}
                onClick={closeDrawer}
              />
            }
          >
            {t('textDetailDrawerTitle')}
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          <div className={styles.textdetailBody}>
            {validFiles.length === 0 ? (
              <p>{t('noFilesToDisplay')}</p>
            ) : (
              validFiles.map((file, index) => (
                <div key={index} className={styles.fileContainer}>
                  <h3 className={styles.fileTitle}>{file.filename}</h3>
                  <p className={styles.fileText}>{file.text}</p>
                </div>
              ))
            )}
          </div>
        </DrawerBody>
      </OverlayDrawer>
    </div>
  );
};

export default TextDetailDrawer;
