import { makeStyles, tokens } from '@fluentui/react-components';

const FilesSideBarStyles = makeStyles({
  drawer: {
    width: 'auto',
  },
  divider: {
    marginTop: tokens.spacingVerticalS,
    marginBottom: tokens.spacingVerticalS
  },
  sidebarContainer: {
    display: 'flex'
  },
  collapsed: {
    width: '0'
  },
  toggleArea: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorNeutralForeground4
  },
  toggleIcon: {
    cursor: 'pointer',
    paddingTop: tokens.spacingVerticalM,
    paddingBottom: tokens.spacingVerticalM,
    ':hover': {
      color: tokens.colorNeutralForeground1Hover
    }
  },
  createRoomButton: {
    width: '100%',
    marginBottom: tokens.spacingVerticalM,
    marginTop: tokens.spacingVerticalS
  }
});

export default FilesSideBarStyles;
