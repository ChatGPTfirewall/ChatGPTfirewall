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
    marginBottom: tokens.spacingVerticalM,
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
  settingsButton: {
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    color: tokens.colorBrandBackground,
    position: 'absolute',
    top: '10px',
    right: '15px'
  },
  inputContainer: {
    position: 'relative',
    display: 'inline-block',
    maxWidth: '75%',
    width: '75%',
    minWidth: '400px',
    boxShadow: tokens.shadow8
  },
  bottomContainer: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',  // Allows items to wrap when space is limited
    marginTop: tokens.spacingVerticalXS,
    width: '100%', // Make it span the input width
    paddingBottom: tokens.spacingHorizontalS,
    Gap: tokens.spacingHorizontalM,
  },
  
  buttonGroup: {
    display: 'flex',
    Gap: tokens.spacingHorizontalXS, // Fix typo and make buttons closer
  },
  
  pillButton: {
    ...shorthands.borderRadius(tokens.borderRadiusCircular),
    ...shorthands.padding(tokens.spacingHorizontalXS, tokens.spacingVerticalXS),
    fontSize: tokens.fontSizeBase200,
    minWidth: 'auto', // Prevent buttons from stretching
    whiteSpace: 'nowrap',
    marginLeft: tokens.spacingHorizontalS,
    marginRight: tokens.spacingHorizontalS,
  },
  
  dropdown: {
    minWidth: '150px', // Adjust width to prevent stretching
    flexShrink: 0, // Prevent dropdown from taking extra space
  },  
});

export default ChatInputStyles;
