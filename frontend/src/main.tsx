import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

import { Auth0Provider } from '@auth0/auth0-react';

import App from './App.tsx';
import './i18n';
import './main.css';
import {
  BrandVariants,
  FluentProvider,
  createDarkTheme,
  createLightTheme,
  Theme
} from '@fluentui/react-components';
import { UserProvider } from './context/UserProvider.tsx';
import { ToastProvider } from './context/ToastProvider.tsx';

const chatGPTfirewall: BrandVariants = {
  10: '#010308',
  20: '#07172E',
  30: '#00264E',
  40: '#003264',
  50: '#193E72',
  60: '#2D4A7E',
  70: '#3F568A',
  80: '#506396',
  90: '#6170A1',
  100: '#717EAB',
  110: '#828CB6',
  120: '#939AC0',
  130: '#A3A9CA',
  140: '#B4B8D4',
  150: '#C4C7DD',
  160: '#D5D6E7'
};

const lightTheme: Theme = {
  ...createLightTheme(chatGPTfirewall)
};

const darkTheme: Theme = {
  ...createDarkTheme(chatGPTfirewall)
};

darkTheme.colorBrandForeground1 = chatGPTfirewall[110];
darkTheme.colorBrandForeground2 = chatGPTfirewall[120];

const rootElement = document.getElementById('root')!;
const audience = import.meta.env.VITE_JWT_AUDIENCE as string;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience
      }}
      cacheLocation="localstorage"
    >
      <FluentProvider theme={lightTheme} style={{ height: '100%' }}>
        <ToastProvider>
          <UserProvider>
            <App />
          </UserProvider>
        </ToastProvider>
      </FluentProvider>
    </Auth0Provider>
  </React.StrictMode>
);
