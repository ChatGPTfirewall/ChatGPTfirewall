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
    // const response = await fetch("/chat", {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify({
    //         content: options.content
    //     })
    // });

    const parsedResponse: Response = { facts: [{ content: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.", file_path: "bla/test.pdf", score: 50.6 }, { content: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.", file_path: "bla/test2.pdf", score: 51.6 }] }

    // await response.json();

    // if (response.status > 299 || !response.ok) {
    //     throw Error(parsedResponse.error || "Unknown error");
    // }
    return parsedResponse;
}

export async function uploadFiles(data: FormData): Promise<any> {
    const response = await fetch("/upload", {
        method: 'POST',
        body: data,
    }).then((response) => {
        response.json().then((body) => {
            body
        })
    })
}

export function getCitationFilePath(citation: string): string {
    return `/content/${citation}`;
}
