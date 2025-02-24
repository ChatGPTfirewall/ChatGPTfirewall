import { makeStyles, tokens } from '@fluentui/react-components';

const CompactFileListStyles = makeStyles({
  fileIcon: {
    verticalAlign: 'middle',
    maxHeight: '16px',
    maxWidth: '16px',
    marginRight: tokens.spacingHorizontalS
  },
  langIcon: {
    verticalAlign: 'middle',
    maxHeight: '16px',
    maxWidth: '16px'
  },
  fileCell: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    paddingLeft: "0rem ",
  },
});

export default CompactFileListStyles;
