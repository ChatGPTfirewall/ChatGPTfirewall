import { makeStyles, tokens } from '@fluentui/react-components';

const NavBarStyles = makeStyles({
  header: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    height: '55px'
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: tokens.spacingHorizontalL,
    marginLeft: tokens.spacingHorizontalL
  },
  headerTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    marginRight: tokens.spacingHorizontalXXXL,
    color: tokens.colorNeutralForegroundOnBrand,
    textDecorationLine: 'none'
  },
  headerTitle: {
    marginLeft: tokens.spacingHorizontalL,
    fontWeight: tokens.fontWeightSemibold
  },
  headerNavList: {
    display: 'flex',
    alignItems: 'center'
  },
  headerNavPageLink: {
    color: tokens.colorNeutralForegroundOnBrand,
    textDecorationLine: 'none',
    opacity: '0.75',
    transitionTimingFunction: tokens.curveDecelerateMid,
    transitionDuration: tokens.durationUltraSlow,
    transitionProperty: 'opacity',
    '&:hover': {
      opacity: '1'
    }
  },
  headerNavPageLinkActive: {
    color: tokens.colorNeutralBackground1Selected,
    fontWeight: tokens.fontWeightSemibold,
    opacity: '1'
  },
  headerNavLeftMargin: {
    marginLeft: tokens.spacingHorizontalL
  },
  appLogo: {
    marginRight: '-12px',
    width: '42px'
  }
});

export default NavBarStyles;
