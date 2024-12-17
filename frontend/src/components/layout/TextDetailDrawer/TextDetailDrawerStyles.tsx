import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

const TextDetailDrawerStyles = makeStyles({
  promptTemplateSelectContainer: {},
  resultSentenceCountContainer: {
    display: 'flex',
    ...shorthands.gap(tokens.spacingHorizontalXL)
  },
  resultSentenceCountLabel: {
    alignSelf: 'center'
  },
  textdetailBody: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingHorizontalXXL)
  },
  textArea: {
    minHeight: '52px',
    height: '260px',
    maxHeight: '480px'
  }
});

export default TextDetailDrawerStyles;
