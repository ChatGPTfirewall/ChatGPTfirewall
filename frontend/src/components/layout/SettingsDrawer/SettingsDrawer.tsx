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
  Textarea,
  Checkbox,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { Room, RoomSettings } from '../../../models/Room';
import { useCallback, useEffect, useState } from 'react';

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
  
  // State management for various settings
  const [promptTemplate, setPromptTemplate] = useState(room.settings.prompt_template);
  const [phraseCount, setPhraseCount] = useState(room?.settings?.pre_phrase_count);

  // State for the active anonymization types
  const [activeAnonymizationTypes, setActiveAnonymizationTypes] = useState<string[]>(room.settings.active_anonymization_types || []);

  // List of all possible anonymization types (unchanged)
  const allAnonymizationTypes = [
    'CARDINAL', 'DATE', 'EVENT', 'FAC', 'GPE', 'LANGUAGE', 'LAW', 'LOC',
    'MONEY', 'MISC', 'NORP', 'ORDINAL', 'ORG', 'PERCENT', 'PERSON','PER', 
    'PRODUCT', 'QUANTITY', 'TIME', 'WORK_OF_ART'
  ];

  const handleTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const templateKey = event.target.value as LanguageKey;
    setPromptTemplate(room.settings.templates?.[templateKey] ?? '');
  };

  const debounce = (func: Function, delay: number) => {
    let timeoutId: number;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => func(...args), delay);
    };
  };

  // Debounced onChange handler for SpinButton
  const handlePhraseCountChange = useCallback(
    debounce((_: any, data: { value: number }) => {
      setPhraseCount(data.value ?? 0);
    }, 175), // Adjust the delay as needed
    []
  );

  const handleAnonymizationTypeChange = (type: string) => {
    // Toggle the active status of the anonymization type
    setActiveAnonymizationTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)  // Remove type if already active
        : [...prev, type]  // Add type if not active
    );
  };

  const handleSaveClick = () => {
    const updatedSettings: RoomSettings = {
      ...room.settings,
      prompt_template: promptTemplate,
      pre_phrase_count: phraseCount,
      post_phrase_count: phraseCount,
      active_anonymization_types: activeAnonymizationTypes
    };

    onSave(updatedSettings);
  };

  useEffect(() => {
    if (!open) {
      setPromptTemplate(room.settings.prompt_template);
      setPhraseCount(room.settings.pre_phrase_count);
      setActiveAnonymizationTypes(room.settings.active_anonymization_types || []);
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
                textarea={{ className: styles.textArea, style: { height: '10rem' } }}
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
                onChange={handlePhraseCountChange}
                min={0}
                max={4}
              />
            </Field>

            <Field label={t('activeAnonymizationTypesLabel')}>
              <div className={styles.checkboxGroup}>
                {allAnonymizationTypes.map((type, index) => {
                  const checkboxId = `anonymization-type-${index}`; // Unique id for each checkbox
                  return (
                    <Checkbox
                      key={type}
                      id={checkboxId}  // Assign a unique id to each checkbox
                      label={type}  // Use the label prop for displaying the text
                      checked={activeAnonymizationTypes.includes(type)}
                      onChange={() => handleAnonymizationTypeChange(type)}
                    />
                  );
                })}
              </div>
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
