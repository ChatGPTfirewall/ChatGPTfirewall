import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

const RoomStyles = makeStyles({
  roomContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },
  chatSection: {
    width: '100%',
    maxWidth: '800px',
    ...shorthands.border('1px solid gray'),
    ...shorthands.borderRadius('8px'),
    ...shorthands.overflow('hidden'),
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    zIndex: '50',
    height: '8vh',
    boxShadow: `0px 20px 17px 0px ${tokens.colorNeutralBackground1}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase500,
    display: 'flex',
    alignItems: 'center',
    maxWidth: "55vw",
    wordBreak: "break-all",
    maxHeight: "8vh"
  },
  actions: {
    display: 'flex',
    height: '32px',
    marginRight: tokens.spacingHorizontalL
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.gap(tokens.spacingHorizontalXL)
  },
  addIcon: {
    color: tokens.colorNeutralForeground4
  },
  bodyText: {
    color: tokens.colorNeutralForeground4
  },
  emptyAddFilesButton: {
    width: 'fit-content'
  },
  emptyTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingHorizontalXS),
    alignItems: 'center'
  },
  anonSwitch: {
    width: '240px'
  }
});

export default RoomStyles;
