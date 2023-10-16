import { Outlet, NavLink, Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';


import { useAuth0 } from "@auth0/auth0-react";

import styles from "./Layout.module.css";
import { AuthenticationButton } from "../../components/AuthenticationButton";
import { initUser } from "../../api";
import { useState, useEffect } from 'react';
import { LanguageButton } from "../../components/LanguageButton";

const Layout = () => {
    const { user, isLoading, isAuthenticated } = useAuth0();
    const [isUserInitialized, setUserInitialized] = useState(false);
    const [ lang, setLang ] = useState("en")
    const { t } = useTranslation();
    const onFirstLogin = () => {
        // insert code for operations after the first login of a user

        console.log("This was a users first login")
    }

    //check if user is authenticated and if the user is initialized
    useEffect(() => {
        if (isAuthenticated && !isUserInitialized) {
            initUser(user!, onFirstLogin, setLang)
            setUserInitialized(true);
        }
    }, [isAuthenticated, user, isUserInitialized]);

    return (
        <div className={styles.layout}>
            <header className={styles.header} role={"banner"}>
                <div className={styles.headerContainer}>
                    <Link to="/" className={styles.headerTitleContainer}>
                        <h3 className={styles.headerTitle}>{t('chatWithYourData')}</h3>
                    </Link>
                    <nav>
                        <ul className={styles.headerNavList}>
                            <li>
                                <NavLink to="/" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                                    Chat
                                </NavLink>
                            </li>
                            <li className={styles.headerNavLeftMargin}>
                                <NavLink to="/Demo" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                                    Demo
                                </NavLink>
                            </li>
                            <li className={styles.headerNavLeftMargin}>
                                <AuthenticationButton />
                            </li>
                            <li className={styles.headerNavLeftMargin}>
                                <LanguageButton default_lang={lang}/>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>

            <Outlet />
        </div>
    );
};

export default Layout;
