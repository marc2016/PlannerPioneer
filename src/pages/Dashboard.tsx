import { useState } from "react";
import reactLogo from "../assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "../App.css";

import { useTranslation } from "react-i18next";
//...
function Dashboard() {
    const [greetMsg, setGreetMsg] = useState("");
    const [name, setName] = useState("");
    const { t } = useTranslation();

    async function greet() {
        // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
        setGreetMsg(await invoke("greet", { name }));
    }

    return (
        <main className="container">
            <h1>{t('dashboard.welcome')}</h1>

            <div className="row">
                <a href="https://vite.dev" target="_blank">
                    <img src="/vite.svg" className="logo vite" alt="Vite logo" />
                </a>
                <a href="https://tauri.app" target="_blank">
                    <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <p>{t('dashboard.click_logos')}</p>

            <form
                className="row"
                onSubmit={(e) => {
                    e.preventDefault();
                    greet();
                }}
            >
                <input
                    id="greet-input"
                    onChange={(e) => setName(e.currentTarget.value)}
                    placeholder={t('dashboard.enter_name')}
                />
                <button type="submit">{t('dashboard.greet')}</button>
            </form>
            <p>{greetMsg}</p>
        </main>
    );
}

export default Dashboard;
