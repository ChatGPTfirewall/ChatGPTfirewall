import { useState } from 'react';
import { Dialog, DialogSurface, DialogTitle, DialogActions, Checkbox, Button, } from '@fluentui/react-components';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (settings: Record<string, boolean>) => void;
}

const labels = [
  'CARDINAL', 'DATE', 'EVENT', 'FAC', 'GPE', 'LANGUAGE', 'LAW', 'LOC', 
  'MONEY', 'NORP', 'ORDINAL', 'ORG', 'PERCENT', 'PERSON', 'PRODUCT', 
  'QUANTITY', 'TIME', 'WORK_OF_ART', 'PER', 'MISC'
];

const SettingsDialog = ({ isOpen, onClose, onApply }: SettingsDialogProps) => {
  const [settings, setSettings] = useState<Record<string, boolean>>(
    labels.reduce((acc, label) => ({ ...acc, [label]: true }), {})
  );

  const handleToggle = (label: string) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [label]: !prevSettings[label],
    }));
  };

  const handleApply = () => {
    onApply(settings);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(_, { open }) => !open && onClose()}>
      <DialogSurface>
          <DialogTitle>Anonymized Entities:</DialogTitle>
          <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '10px 0', width: "auto"}}>
            {labels.map(label => (
              <Checkbox
                key={label}
                label={label}
                checked={settings[label]}
                onChange={() => handleToggle(label)}
                style={{ marginBottom: '10px' }}
              />
            ))}
          </div>
          <DialogActions>
            <Button onClick={handleApply}>Apply</Button>
          </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};

export default SettingsDialog;
