import { makeStyles, tokens } from '@fluentui/react-components';

const RoomListStyles = makeStyles({
  createRoomButton: {
    width: '100%',
    marginBottom: tokens.spacingVerticalM,
    marginTop: tokens.spacingVerticalS
  },
  sectionTitle: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground3,
    marginTop: tokens.spacingVerticalM,
    marginBottom: tokens.spacingVerticalS,
    marginLeft: tokens.spacingHorizontalS,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  sectionContainer: {
    marginBottom: tokens.spacingVerticalS
  }
});

export default RoomListStyles;
