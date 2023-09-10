import { Auth0Provider } from '@auth0/auth0-react';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
    const domain = import.meta.env.VITE_AUTH0_DOMAIN;
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                redirect_uri: window.location.origin
            }}
            cacheLocation="localstorage"
        >
            {children}
        </Auth0Provider>
    );
};


