import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

const ChatInputStyles = makeStyles({
  demoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.gap('8px'),
    marginBottom: tokens.spacingVerticalXL,
    boxShadow: `0px -20px 17px 0px ${tokens.colorNeutralBackground1}`,
    width: '100%',
    alignSelf: 'center'
  },

  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.gap('8px'),
    marginBottom: tokens.spacingVerticalXL,
    boxShadow: `0px -20px 17px 0px ${tokens.colorNeutralBackground1}`
  },
  textArea: {
    flexGrow: 1,
    ...shorthands.padding(tokens.spacingHorizontalM),
    width: '100%'
  },
  sendButton: {
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    color: tokens.colorBrandBackground,
    position: 'absolute',
    bottom: '10px',
    right: '15px'
  },
  inputContainer: {
    position: 'relative',
    display: 'inline-block',
    maxWidth: '75%',
    width: '75%',
    minWidth: '400px',
    boxShadow: tokens.shadow8
  }
});

export default ChatInputStyles;
