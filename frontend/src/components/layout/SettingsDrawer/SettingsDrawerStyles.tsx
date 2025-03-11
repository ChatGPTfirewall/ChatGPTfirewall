import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

const SettingsDrawerStyles = makeStyles({
  promptTemplateSelectContainer: {},
  resultSentenceCountContainer: {
    display: 'flex',
    ...shorthands.gap(tokens.spacingHorizontalXL)
  },
  resultSentenceCountLabel: {
    alignSelf: 'center'
  },
  settingsBody: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingHorizontalXXL)
  },
  textArea: {
    minHeight: '52px',
    height: '260px',
    maxHeight: '480px'
  },
  saveButton: {
    width: '160px',
    alignSelf: 'end'
  },
  checkboxGroup: {
    Gap: '8px',
    Padding: '8px',
  },
  crementButton: {
    transform: 'scale(2)',
    backgroundColor: tokens.colorBrandBackground,
    color: 'white'
  },
  applyButton: {
    backgroundColor: tokens.colorBrandBackground,
    color: 'white',
    marginTop: tokens.spacingVerticalXS
  }
});

export default SettingsDrawerStyles;
