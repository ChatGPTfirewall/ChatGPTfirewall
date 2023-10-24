// src/i18n/i18n.ts

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        // Hier kommen die englischen Übersetzungen aus deiner JSON-Datei
        "chatWithYourData": "Chat with your data",
        "demoPageChatWithData": "Demo Page: Chat with your data",
        "files": "Files",
        "selectedMoreItems": " items selected",
        "selectedItems": "1 item selected: ",
        "noSelectedItems": "No items selected",
        "filterByName": "Filter by name",
        "uploadedFiles": "Your uploaded files",
        "deleteDoc": "Delete documents",
        "reloadDoc": "Reload documents",
        "clearChat": "Clear Chat",
        "devSettings": "Developer Settings",
        "addFiles": "Add Files",
        "askTryExample": "Ask anything or try an example",
        "card1Upload": "Upload your data or select it via your Cloud",
        "card2Ask": "Ask questions that your data can answer",
        "card3Demo": "You can try out the demo",
        "chatTextType": "Type a new question...",
        "s3Storage": "Scalable storage in the clouad.",
        "uploadButton": "Select a folder or a file to upload.",
        "selectMethodUpload": "Select method",
        "settings": "Settings",
        "logout": "Log Out",
        "reloading": "Reloading...",
        "loginAndAskAnything": "Login and ask anything or try an example",
        "fileSize": "File size",
        "sendingToChatGPT": "Your question is sent to ChatGPT with the following search results.",
        "checkYourData": "Please check if there are sensitive information in the search results.",
        "answer": "Answer",
        "from": "from",
        "at": "at",
        "accuracy": "accuracy",
        "editSearchResults": "Edit Search Results",
        "send": "Send",
        "context": "Context",
        "question": "Question"
      },
    },
    de: {
      translation: {
        "chatWithYourData": "Chatten Sie mit Ihren Daten",
        "demoPageChatWithData": "Demo Seite: Chatten Sie mit Ihren Daten",
        "files": "Dateien",
        "noSelectedItems": "Keine Einträge ausgewählt",
        "selectedMoreItems": " Einträge ausgewählt",
        "selectedItems": "1 Eintrag ausgewählt: ",
        "deleteDoc": "Dokumente löschen",
        "reloadDoc": "Dokumente neuladen",
        "filterByName": "Nach Dateiname suchen",
        "uploadedFiles": "Ihre hochgeladenen Dateien",
        "clearChat": "Chat löschen",
        "devSettings": "Einstellungen für Entwickler",
        "addFiles": "Dateien hinzufügen",
        "askTryExample": "Fragen Sie etwas oder probieren Sie ein Beispiel aus",
        "card1Upload": "Laden Sie Ihre Daten hoch oder wählen Sie sie über Ihre Cloud aus",
        "card2Ask": "Stellen Sie Fragen, die Ihre Daten beantworten können",
        "card3Demo": "Sie können die Demo ausprobieren",
        "chatTextType": "Geben Sie eine neue Frage ein...",
        "s3Storage": "Skalierbarer Speicher in der Cloud",
        "uploadButton": "Wählen Sie einen Ordner oder eine Datei zum Hochladen",
        "selectMethodUpload": "Methode wählen",
        "settings": "Einstellungen",
        "logout": "Ausloggen",
        "reloading": "Lade neu...",
        "loginAndAskAnything": "Loggen sie sich ein und fragen Sie ihre Dokumente",
        "fileSize": "Dateigröße",
        "sendingToChatGPT": "Deine Frage wird mit den nachfolgenden Suchergebnissen an ChatGPT gesendet.", 
        "checkYourData": "Bitte überprüfe ob in den Suchergebnissen empfindliche Informationen enthalten sind.",
        "answer": "Antwort",
        "from": "aus",
        "at": "bei",
        "accuracy": "Genauigkeit",
        "editSearchResults": "Suchergebnisse überarbeiten",
        "send": "Senden",
        "context": "Kontext",
        "question": "Frage"
      },
    },
    // Weitere Sprachen und Übersetzungen hier hinzufügen
  },
  lng: 'en', // Standardsprache
  fallbackLng: 'en', // Fallback-Sprache, wenn die Übersetzung fehlt
  interpolation: {
    escapeValue: false, // HTML-Escapes und Formatierungszeichen zulassen
  },
});

export default i18n;
