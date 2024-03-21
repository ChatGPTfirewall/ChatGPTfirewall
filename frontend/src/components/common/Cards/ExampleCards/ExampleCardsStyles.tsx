import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

const ExampleCardsStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  examplesCardList: {
    display: 'flex',
    flexWrap: 'wrap',
    ...shorthands.gap('10px'),

    justifyContent: 'center'
  },
  demoTextContainer: {
    textAlign: 'center', // Zentriert den Text und den Link
    marginTop: tokens.spacingVerticalM, // Gibt etwas Abstand nach oben
    marginBottom: tokens.spacingVerticalM // Gibt etwas Abstand nach unten
  },
  demoLink: {
    fontSize: tokens.fontSizeBase400, // Etwas größere Schrift für den Link
    fontWeight: tokens.fontWeightSemibold, // Macht den Link fett
    color: tokens.colorBrandBackground, // Farbe für den Link, nutze Brand-Farben für Klickbarkeit
    ...shorthands.margin(tokens.spacingVerticalS, 0),
    paddingBottom: '65px'
  }
});

export default ExampleCardsStyles;
