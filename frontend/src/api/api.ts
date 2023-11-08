import { ReadDocument, Response } from "./models";
import { User } from "@auth0/auth0-react";

export async function chatApi(question: string, user: User | string): Promise<Response> {
    const user_auth0_id = typeof user === 'string' ? user : user.sub;

    const response = await fetch("/api/question", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            question: question,
            user_auth0_id: user_auth0_id
        }),
    });

    const parsedResponse: Response = await response.json();

    if (response.status > 299 || !response.ok) {
        throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}


export async function chatWithLLM(question: string, context: string, template: string): Promise<any> {
    const response = await fetch("/api/context", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            question: question,
            context: context,
            template: template
        }),
    }).then((response) => response.json())

    return response
}

export async function uploadFiles(data: any): Promise<any> {
    const response = await fetch("/api/documents/upload", {
        method: 'POST',
        body: data
    }).then((response) => response.json())

    return response
}

export async function setLanguage(data: any): Promise<any> {
    const response = await fetch("/api/language", {
        method: 'POST', // Da du Daten an den Server sendest, sollte die Methode POST sein
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Du übergibst die ausgewählte Sprache als JSON-Daten
    });
    // Wenn die Anfrage erfolgreich ist, kannst du die Antwort zurückgeben
    return response.json();
}

export async function getLanguage(auth0_id: string): Promise<any> {
    const response = await fetch("/api/language?auth0_id=" + auth0_id, {
        method: 'GET', // Da du Daten an den Server sendest, sollte die Methode POST sein
        headers: {
            'Content-Type': 'application/json',
        }
    });
    // Wenn die Anfrage erfolgreich ist, kannst du die Antwort zurückgeben
    return response.json();
}

export async function deleteDocuments(documents: ReadDocument[]): Promise<any> {

    const response = await fetch("/api/documents", {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            documents: documents
        })
    }).then((response) => response.json())
}

export async function getDocuments(auth0_id: string): Promise<ReadDocument[]> {

    const response = await fetch("/api/documents", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            auth0_id: auth0_id
        })
    })

    const parsedResponse: ReadDocument[] = await response.json();

    return parsedResponse;
}

  export async function sendChatPageRequest(user: User) {
    const response = await fetch('/api/chat', {
      method: 'DELETE', 
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          auth0_id: user.sub,
          username: user.nickname,
          email: user.email
      }),
    }).then((response) => response.json())
}


export async function reloadFiles(auth0_id: string): Promise<any> {

    const response = await fetch("/api/files/reload", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            auth0_id: auth0_id
        })
    }).then((response) => response.json())
}

export async function uploadToNextcloud(clientId: any, clientSecret: any, authorizationUrl: any, nextCloudUserName: any): Promise<any> {
    const response = await fetch("/api/upload/nextcloud", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            clientId: clientId,
            clientSecret: clientSecret,
            authorizationUrl: authorizationUrl,
            nextCloudUserName: nextCloudUserName,
            redirectUri: window.location.host + "/api/upload/nextcloud/redirect"
        }),
    }).then((response) => response.json());
}

export async function initUser(user: User, firstLoginHook: any, setLang: any): Promise<any> {
    const response = await fetch("/api/users/create", {
        method: 'POST',
        body: JSON.stringify({
            auth0_id: user.sub,
            username: user.nickname,
            email: user.email
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => response.json())
        .then(data => {
            if (!data.error) {
                firstLoginHook()
                setLang(data.lang)
            }
        })
}

export function getCitationFilePath(citation: string): string {
    return `/content/${citation}`;
}
