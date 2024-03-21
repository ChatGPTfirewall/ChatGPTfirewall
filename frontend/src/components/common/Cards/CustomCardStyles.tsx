import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

const CustomCardStyles = makeStyles({
  guideCard: {
    boxShadow: tokens.shadow16,
    width: '250px',
    minHeight: '100px',
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.margin(tokens.spacingVerticalXL, tokens.spacingHorizontalXL),
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    ':hover': {
      boxShadow: tokens.shadow28,
      '& .step': {
        backgroundColor: tokens.colorBrandBackground,
        color: tokens.colorNeutralBackground1
      }
    }
  },
  step: {
    ...shorthands.padding(
      tokens.spacingVerticalXXS,
      tokens.spacingHorizontalXXS
    ),
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorBrandBackground,
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius(tokens.borderRadiusCircular),
    width: '32px',
    height: '32px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacingHorizontalM
  },
  title: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold
  },
  content: {
    fontSize: tokens.fontSizeBase400,
    ...shorthands.margin(tokens.spacingVerticalS, 0)
  },
  header: {
    display: 'flex',
    alignItems: 'center'
  }
});

export default CustomCardStyles;
