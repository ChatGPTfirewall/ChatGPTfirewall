import SettingsDrawerStyles from './SettingsDrawerStyles';
import {
  Button,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Field,
  OverlayDrawer,
  Select,
  SpinButton,
  Textarea
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { Room, RoomSettings } from '../../../models/Room';
import { useEffect, useState } from 'react';

type LanguageKey = keyof RoomSettings['templates'];

interface SettingsDrawerProps {
  open: boolean;
  closeDrawer: () => void;
  room: Room;
  onSave: (updatedSettings: RoomSettings) => void;
}

const SettingsDrawer = ({
  open,
  closeDrawer,
  room,
  onSave
}: SettingsDrawerProps) => {
  const styles = SettingsDrawerStyles();
  const { t } = useTranslation();
  const [promptTemplate, setPromptTemplate] = useState(
    room.settings.prompt_template
  );
  const [phraseCount, setPhraseCount] = useState(
    room.settings.pre_phrase_count
  );

  const handleTemplateChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const templateKey = event.target.value as LanguageKey;
    setPromptTemplate(room.settings.templates?.[templateKey] ?? '');
  };

  const handleSaveClick = () => {
    const updatedSettings: RoomSettings = {
      ...room.settings,
      prompt_template: promptTemplate,
      pre_phrase_count: phraseCount,
      post_phrase_count: phraseCount
    };

    onSave(updatedSettings);
  };

  useEffect(() => {
    if (!open) {
      setPromptTemplate(room.settings.prompt_template);
      setPhraseCount(room.settings.pre_phrase_count);
    }
  }, [open, room.settings]);

  return (
    <div>
      <OverlayDrawer
        modalType="non-modal"
        open={open}
        position="end"
        size="medium"
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
            {t('settingsDrawerTitle')}
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          <div className={styles.settingsBody}>
            <Field label={t('promptTemplateLabel')}>
              <Textarea
                textarea={{ className: styles.textArea }}
                appearance="outline"
                resize="vertical"
                value={promptTemplate}
                onChange={(e) => setPromptTemplate(e.target.value)}
              />
            </Field>
            <Field label={t('promptTemplateSelectLabel')}>
              <Select
                defaultValue={room.user.lang}
                onChange={handleTemplateChange}
              >
                <option value="de">{t('promptTemplateOptionDE')}</option>
                <option value="en">{t('promptTemplateOptionEN')}</option>
              </Select>
            </Field>
            <Field label={t('resultSentenceCountLabel')}>
              <SpinButton
                appearance="underline"
                value={phraseCount}
                onChange={(_, data) => {
                  setPhraseCount(data.value!);
                }}
                min={0}
                max={4}
              />
            </Field>
            <Button
              appearance="primary"
              className={styles.saveButton}
              onClick={handleSaveClick}
            >
              {t('save')}
            </Button>
          </div>
        </DrawerBody>
      </OverlayDrawer>
    </div>
  );
};

export default SettingsDrawer;
