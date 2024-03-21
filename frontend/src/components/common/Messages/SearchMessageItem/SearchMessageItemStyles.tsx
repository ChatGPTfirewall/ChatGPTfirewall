import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

const SearchMessageItemStyles = makeStyles({
  container: {
    alignSelf: 'start',
    maxWidth: '1000px',
    width: '80%',
    ...shorthands.gap(tokens.spacingHorizontalL),
    alignItems: 'center',
    display: 'flex',
    ':hover & .timestamp': {
      backgroundColor: tokens.colorBrandBackground,
      opacity: '1'
    }
  },
  messageContent: {
    ...shorthands.borderRadius('6px'),
    ...shorthands.padding(
      tokens.spacingHorizontalXL,
      tokens.spacingHorizontalXXXL,
      tokens.spacingHorizontalL,
      tokens.spacingHorizontalL
    ),
    ...shorthands.margin('10px', '0'),
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow4,
    width: '90%',
    ...shorthands.gap(tokens.spacingHorizontalL)
  },
  timestamp: {
    color: tokens.colorNeutralForeground3,
    opacity: '1',
    transitionTimingFunction: tokens.curveDecelerateMid,
    transitionDuration: tokens.durationFast,
    transitionProperty: 'opacity'
  },
  avatarContainer: {
    display: 'flex',
    alignSelf: 'start',
    marginTop: tokens.spacingHorizontalXL,
    ...shorthands.gap(tokens.spacingHorizontalS),
    width: '7rem'
  },
  introText: {},
  statText: {
    opacity: '0.6'
  },
  resultContainer: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingHorizontalS)
  },
  textarea: {
    boxShadow: tokens.shadow2,
    ...shorthands.padding(tokens.spacingHorizontalXS)
  },
  resultContent: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding(tokens.spacingHorizontalXS),
    whiteSpace: 'pre-line'
  },
  actionButtons: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between'
  },
  visible: {
    color: tokens.colorNeutralForeground2BrandSelected
  },
  contentSkeleton: {
    alignItems: 'center',
    display: 'grid',
    paddingBottom: '10px',
    position: 'relative',
    ...shorthands.gap('10px'),
    gridTemplateColumns: 'min-content 80%'
  },
  statSkeleton: {
    alignItems: 'center',
    display: 'grid',
    paddingBottom: '10px',
    position: 'relative',
    ...shorthands.gap('10px'),
    gridTemplateColumns: 'min-content 20% 20% 15%'
  }
});

export default SearchMessageItemStyles;
