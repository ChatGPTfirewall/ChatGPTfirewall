import { PrimaryButton, DefaultButton } from "@fluentui/react";
import { IContextualMenuProps } from '@fluentui/react';
import DemoPage from "../../pages/demoPage/DemoPage";

export const DemoButton = () => {

    return (
        <PrimaryButton onClick={() => DemoPage}> Try Demo </PrimaryButton>
    );
};
