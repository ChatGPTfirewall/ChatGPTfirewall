import { makeStyles, tokens } from '@fluentui/react-components';

const LoginButtonStyles = makeStyles({
  userText: {
    fontWeight: tokens.fontWeightBold,
  },
  loginButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: "row"
  },
  mailText: {
    fontWeight: tokens.fontWeightRegular,
    fontSize: tokens.fontSizeBase200,
  },
  UserDetailsContainer: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: "column",
    marginRight: tokens.spacingHorizontalL
  },
});

export default LoginButtonStyles;
