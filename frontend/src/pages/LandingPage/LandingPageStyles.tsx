import { makeStyles, shorthands } from '@fluentui/react-components';

const LandingPageStyles = makeStyles({
  landingPage: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'start',
    height: '100%'
  },
  landingContent: {
    textAlign: 'center',
    maxWidth: '600px',
    paddingTop: '20px',
    marginTop: '40px'
  },
  header: {
    fontSize: '2.5rem',
    marginBottom: '2rem'
  },
  subHeader: {
    fontSize: '1.2rem',
    marginBottom: '2rem'
  },
  appLogo: {
    marginBottom: '-2rem',
    width: '300px'
  },
  links: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '40px',
    color: '#007bff',
    ...shorthands.gap('12px')
  }
});

export default LandingPageStyles;
