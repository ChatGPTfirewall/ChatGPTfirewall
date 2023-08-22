import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import { initializeIcons } from "@fluentui/react";
import { Auth0Provider } from '@auth0/auth0-react';

import "./index.css";

import Layout from "./pages/layout/Layout";
import NoPage from "./pages/NoPage";
import Chat from "./pages/chat/Chat";

initializeIcons();

export default function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Chat />} />
                    <Route path="*" element={<NoPage />} />
                </Route>
            </Routes>
        </HashRouter>
    );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <Auth0Provider
            domain="dev-ccc.eu.auth0.com"
            clientId="C1VKNSTk1BMd2ReoSzUWOogc0TATmADR"
            authorizationParams={{
                redirect_uri: window.location.origin
            }}
            cacheLocation="localstorage"
        >
            <App />
        </Auth0Provider>
    </React.StrictMode>
);
