import { PrimaryButton, DefaultButton } from "@fluentui/react";
import { IContextualMenuProps } from '@fluentui/react';
import DemoPage from "../../pages/demoPage/DemoPage";

export const DemoButton = () => {

    const menuProps: IContextualMenuProps = {
        items: [
            {
                key: 'settings',
                text: 'Settings',
                iconProps: { iconName: 'Settings' },
                disabled: true,
            },
        ],
    };

    return (
        <PrimaryButton onClick={() => DemoPage}> Try Demo </PrimaryButton>
    );
};
