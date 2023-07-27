import { AskRequest, Response, ChatRequest } from "./models";
import { User } from "@auth0/auth0-react";

export async function askApi(options: AskRequest): Promise<Response> {
    const response = await fetch("/ask", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            question: options.question,
            approach: options.approach,
            overrides: {
                semantic_ranker: options.overrides?.semanticRanker,
                semantic_captions: options.overrides?.semanticCaptions,
                top: options.overrides?.top,
                temperature: options.overrides?.temperature,
                prompt_template: options.overrides?.promptTemplate,
                prompt_template_prefix: options.overrides?.promptTemplatePrefix,
                prompt_template_suffix: options.overrides?.promptTemplateSuffix,
                exclude_category: options.overrides?.excludeCategory
            }
        })
    });

    const parsedResponse: Response = await response.json();
    if (response.status > 299 || !response.ok) {
        throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}

export async function chatApi(options: ChatRequest): Promise<Response> {
    const response = await fetch("/api/context?content=" + options.content, {
        method: "GET",
    });

    const parsedResponse: Response = await response.json();

    if (response.status > 299 || !response.ok) {
        throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}

export async function uploadFiles(data: any, user: User): Promise<any> {

    const response = await fetch("http://127.0.0.1:7007/upload?user_name=" + user.nickname, {
        method: 'POST',
        body: data
    }).then((response) => response.json())
}

uploadToNextcloud

export async function uploadToNextcloud(clientId: any, clientSecret: any, authorizationUrl: any, nextCloudUserName: any): Promise<any> {

    const response = await fetch("http://127.0.0.1:7007/nextcloud?clientId=" +  clientId + "&" + "clientSecret=" + clientSecret + "&" + "authorizationUrl=" + authorizationUrl + "&" + "nextCloudUserName="+ nextCloudUserName, {
        method: 'POST',
        body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        authorization_url: authorizationUrl,
        nextCloud_Username: nextCloudUserName
        }),
    }).then((response) => response.json())
}

export async function initUser(user: User, firstLoginHook: any): Promise<any> {
    const response = await fetch("http://127.0.0.1:7007/user/create", {
        method: 'POST',
        body: JSON.stringify({
            user_sub: user.sub,
            username: user.nickname,
            email: user.email
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    }).then((response) => response.json())
        .then(data => {
            if (!data.error) {
                firstLoginHook()
            }
        })
}

export function getCitationFilePath(citation: string): string {
    return `/content/${citation}`;
}
