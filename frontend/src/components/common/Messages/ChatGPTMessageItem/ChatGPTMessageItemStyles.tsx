import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

const ChatGPTMessageItemStyles = makeStyles({
  container: {
    alignSelf: 'start',
    maxWidth: '1000px',
    width: '80%',
    ...shorthands.gap(tokens.spacingHorizontalL),
    alignItems: 'center',
    display: 'flex',
    ':hover & .timestamp': {
      backgroundColor: tokens.colorBrandBackground,
      opacity: '1'
    }
  },
  messageContent: {
    ...shorthands.borderRadius('6px'),
    ...shorthands.padding(
      tokens.spacingHorizontalXL,
      tokens.spacingHorizontalXXXL,
      tokens.spacingHorizontalL,
      tokens.spacingHorizontalL
    ),
    ...shorthands.margin('10px', '0'),
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow4,
    width: '90%',
    ...shorthands.gap(tokens.spacingHorizontalS)
  },
  content: {
    color: tokens.colorNeutralForeground1,
    ...shorthands.margin('0'),
    whiteSpace: 'pre-line'
  },
  timestamp: {
    color: tokens.colorNeutralForeground3,
    opacity: '1',
    transitionTimingFunction: tokens.curveDecelerateMid,
    transitionDuration: tokens.durationFast,
    transitionProperty: 'opacity'
  },
  avatarContainer: {
    display: 'flex',
    alignSelf: 'start',
    marginTop: tokens.spacingHorizontalXL,
    ...shorthands.gap(tokens.spacingHorizontalS),
    width: '7rem'
  },
  contentSkeleton: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '10px',
    position: 'relative',
    ...shorthands.gap('10px'),
    width: '100%'
  }
});

export default ChatGPTMessageItemStyles;
