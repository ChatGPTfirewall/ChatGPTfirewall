import { useAuth0 } from "@auth0/auth0-react";
import { PrimaryButton, DefaultButton } from "@fluentui/react";
import { IContextualMenuProps } from '@fluentui/react';
import { useTranslation } from 'react-i18next';

export const AuthenticationButton = () => {
    const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
    const { t, i18n } = useTranslation();

    const menuProps: IContextualMenuProps = {
        items: [
            {
                key: 'settings',
                text: t('settings'),
                iconProps: { iconName: 'Settings' },
                disabled: true,
            },
            {
                key: 'logout',
                text: t('logout'),
                iconProps: { iconName: 'DoorArrowLeft' },
                onClick: (ev, item) => {
                    logout({ logoutParams: { returnTo: window.location.origin } });
                    return true; // oder false oder undefined, je nachdem, was Sie möchten
                },
            }
        ],
    };

    if (isAuthenticated && user) {
        return (
            <DefaultButton
                text={user.name}
                primary
                menuProps={menuProps}
            />
        );
    }

    return (
        <PrimaryButton onClick={() => loginWithRedirect()}> {t('logIn')} </PrimaryButton>
    );
};
