import { makeStyles, tokens } from '@fluentui/react-components';

const SideBarStyles = makeStyles({
  drawer: {
    width: '212px'
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
    color: tokens.colorBrandForeground1,
    filter: 'drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.8))',
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

export default SideBarStyles;
