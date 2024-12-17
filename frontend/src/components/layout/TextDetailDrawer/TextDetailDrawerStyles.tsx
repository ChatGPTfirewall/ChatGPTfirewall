import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

const TextDetailDrawerStyles = makeStyles({
  textdetailBody: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingHorizontalXXL),
  },
  fileContainer: {
    ...shorthands.margin(0, 0, tokens.spacingVerticalM),
    display: 'flex',
    flexDirection: 'column',
  },
  fileTitle: {
    marginBottom: tokens.spacingHorizontalXS,
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
  },
  fileText: {
    whiteSpace: 'pre-wrap',
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
  },
});

export default TextDetailDrawerStyles;
