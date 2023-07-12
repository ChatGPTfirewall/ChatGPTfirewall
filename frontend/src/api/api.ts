import { AskRequest, Response, ChatRequest } from "./models";

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

export async function uploadFiles(data: any): Promise<any> {

    const response = await fetch("http://127.0.0.1:7007/upload", {
        method: 'POST',
        body: data,
        headers: {
            'Content-Type': "multipart/form-data",
        },
    }).then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.log(error));
}

export function getCitationFilePath(citation: string): string {
    return `/content/${citation}`;
}
