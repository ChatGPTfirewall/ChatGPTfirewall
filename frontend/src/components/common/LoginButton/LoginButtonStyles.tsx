import { makeStyles, tokens } from '@fluentui/react-components';

const LoginButtonStyles = makeStyles({
  userText: {
    fontWeight: tokens.fontWeightMedium,
    marginRight: tokens.spacingHorizontalL
  },
  loginButtonContainer: {
    display: 'flex',
    alignItems: 'center'
  }
});

export default LoginButtonStyles;
