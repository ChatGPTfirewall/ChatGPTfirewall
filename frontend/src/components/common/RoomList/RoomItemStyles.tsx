import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

const RoomItemStyles = makeStyles({
  roomItemContainer: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    marginTop: tokens.spacingHorizontalXS,
    marginBottom: tokens.spacingHorizontalXS
  },
  roomButton: {
    flexGrow: 1,
    justifyContent: 'start',
    textOverflow: 'ellipsis',
    ...shorthands.overflow('hidden'),
    whiteSpace: 'nowrap',
    ':hover': {
      backgroundColor: tokens.colorNeutralStroke2,
      color: tokens.colorNeutralForeground1
    },
    fontWeight: tokens.fontWeightRegular
  },
  textArea: {
    ...shorthands.overflow('hidden'),
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  menuButton: {
    marginLeft: tokens.spacingHorizontalS,
    ':hover': {
      backgroundColor: tokens.colorNeutralStroke1
    },
    flexShrink: 0
  },
  selected: {
    backgroundColor: tokens.colorNeutralStroke2,
    color: tokens.colorNeutralForeground1,
    ':hover': {
      backgroundColor: tokens.colorNeutralStroke2,
      color: tokens.colorNeutralForeground1
    }
  },
  unselected: {
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    ':hover': {
      backgroundColor: tokens.colorNeutralStroke2,
      color: tokens.colorNeutralForeground1
    }
  }
});

export default RoomItemStyles;
