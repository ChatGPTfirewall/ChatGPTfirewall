import {
  makeStyles,
  tokens,
  typographyStyles
} from '@fluentui/react-components';

const ChatStyles = makeStyles({
  chatRoot: {
    display: 'flex',
    marginTop: tokens.spacingVerticalXL,
    width: '100%',
    height: 'calc(-55px + 100vh - var(--spacingVerticalXL))'
  },
  chatContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%'
  },
  chatEmptyState: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  chatEmptyStateTitle: typographyStyles.display,
  chatEmptyStateSubtitle: typographyStyles.subtitle1
});

export default ChatStyles;
