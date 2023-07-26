import { useAuth0 } from "@auth0/auth0-react";
import { PrimaryButton, DefaultButton } from "@fluentui/react";
import { IContextualMenuProps } from '@fluentui/react';

export const AuthenticationButton = () => {
    const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();

    const menuProps: IContextualMenuProps = {
        items: [
            {
                key: 'settings',
                text: 'Settings',
                iconProps: { iconName: 'Settings' },
                disabled: true,
            },
            {
                key: 'logout',
                text: 'Log Out',
                iconProps: { iconName: 'DoorArrowLeft' },
                onClick: () => logout({ logoutParams: { returnTo: window.location.origin } }),
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
        <PrimaryButton onClick={() => loginWithRedirect()}> Log In </PrimaryButton>
    );
};
