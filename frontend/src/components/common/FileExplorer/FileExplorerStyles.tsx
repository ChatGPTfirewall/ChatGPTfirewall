import { makeStyles, tokens } from '@fluentui/react-components';

const FileExplorerStyles = makeStyles({
  triggerButton: {
    fontWeight: tokens.fontWeightMedium
  },
  surface: {
    maxWidth: '60%',
    minWidth: '25%'
  },
  content: {
    display: 'flex',
    flexDirection: 'column'
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: tokens.spacingVerticalL
  },
  fileList: {
    display: 'flex',
    flexDirection: 'column'
  },
  deleteButton: {
    alignSelf: 'end'
  }
});

export default FileExplorerStyles;
