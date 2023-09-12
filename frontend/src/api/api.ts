import { AskRequest, Response} from "./models";
import { User } from "@auth0/auth0-react";

export async function chatApi(question: string, user: User): Promise<Response> {
    const response = await fetch("/api/question", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            question: question,
            user_auth0_id: user.sub
        }),
    });

    const parsedResponse: Response = await response.json();

    if (response.status > 299 || !response.ok) {
        throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}

export async function chatWithLLM(question: string, file: string, text: string): Promise<any> {
    const response = await fetch("/api/context", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            question: question,
            contexts: [
                { file: file, editedText: text }
            ]
        }),
    }).then((response) => response.json())

    return response
}

export async function uploadFiles(data: any): Promise<any> {

    const response = await fetch("/api/upload", {
        method: 'POST',
        body: data
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

export async function initUser(user: User, firstLoginHook: any): Promise<any> {
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
            }
        })
}

export async function initUserCollection(user: User): Promise<any> {
    const response = await fetch("/api/collections/create", {
        method: 'POST',
        body: JSON.stringify({
            user_auth0_id: user.sub
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    })
    return "ok"
}

export function getCitationFilePath(citation: string): string {
    return `/content/${citation}`;
}
