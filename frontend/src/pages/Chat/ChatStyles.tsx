import {
  makeStyles,
  tokens,
  typographyStyles
} from '@fluentui/react-components';

const ChatStyles = makeStyles({
  chatRoot: {
    display: 'flex',
    overflowY: 'auto',
    marginTop: tokens.spacingVerticalXL,
    width: '100%'
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
