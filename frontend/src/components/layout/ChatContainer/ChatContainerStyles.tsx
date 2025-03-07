import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

const ChatContainerStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('10px'),
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalL,
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalL,
    marginLeft: tokens.spacingHorizontalXL,
    marginRight: tokens.spacingHorizontalXL,
    height: 'calc(-220px + 92vh)',
    overflowY: 'auto'
  }
});

export default ChatContainerStyles;
