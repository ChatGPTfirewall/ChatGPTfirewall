import { makeStyles, tokens } from '@fluentui/react-components';

const FileListStyles = makeStyles({
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
    overflowX: 'hidden'
  },
  fileCellText: {
    width: '100%'
  }
});

export default FileListStyles;
