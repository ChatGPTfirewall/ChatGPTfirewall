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
  actionContainer: {
    ...shorthands.margin(tokens.spacingVerticalM, 0, tokens.spacingVerticalM),
    display: 'flex',
    alignItems: 'center',
  },
  textBox: {
    flexGrow: 1,
    fontSize: tokens.fontSizeBase200,
  },
  chaptersContainer: {
    ...shorthands.margin(tokens.spacingVerticalM, 0),
    display: 'flex',
    flexDirection: 'column',
  },
  chapterList: {
    ...shorthands.padding(0),
  },
  chapterItem: {
    marginBottom: tokens.spacingVerticalXS,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightRegular,
  },
});

export default TextDetailDrawerStyles;
