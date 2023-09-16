import { Outlet, NavLink, Link } from "react-router-dom";



import { useAuth0 } from "@auth0/auth0-react";

import styles from "./Layout.module.css";
import { AuthenticationButton } from "../../components/AuthenticationButton";
import { initUser } from "../../api";

const Layout = () => {
    const {user, isLoading, isAuthenticated} = useAuth0();

    const onFirstLogin = () => {
        // insert code for operations after the first login of a user

        console.log("This was a users first login")}

    if (isAuthenticated) {
        initUser(user!, onFirstLogin)
    }

    return (
        <div className={styles.layout}>
            <header className={styles.header} role={"banner"}>
                <div className={styles.headerContainer}>
                    <Link to="/" className={styles.headerTitleContainer}>
                        <h3 className={styles.headerTitle}>Chat with your data</h3>
                    </Link>
                    <nav>
                        <ul className={styles.headerNavList}>
                            <li>
                                <NavLink to="/" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                                    Chat
                                </NavLink>
                            </li>
                            <li className={styles.headerNavLeftMargin}>
                                <AuthenticationButton/>
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
