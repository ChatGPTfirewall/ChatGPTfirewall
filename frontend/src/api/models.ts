export const enum Approaches {
    RetrieveThenRead = "rtr",
    ReadRetrieveRead = "rrr",
    ReadDecomposeAsk = "rda"
}

export type AskRequestOverrides = {
    semanticRanker?: boolean;
    semanticCaptions?: boolean;
    excludeCategory?: string;
    top?: number;
    temperature?: number;
    promptTemplate?: string;
    promptTemplatePrefix?: string;
    promptTemplateSuffix?: string;
    suggestFollowupQuestions?: boolean;
};

export type AskRequest = {
    question: string;
    approach: Approaches;
    overrides?: AskRequestOverrides;
};

export type AskResponse = {
    answer: string;
    thoughts: string | null;
    data_points: string[];
    error?: string;
};

export type ChatTurn = {
    user: string;
    bot?: Response;
};
export type Fact = {
    answer: string;
    file: string;
    score: number;
    context_before: string;
    context_after: string;
    entities: [{TEXT: string, START_CHAR: number, END_CHAR: number, LABEL: string}];
    original_entities: string[];
}

export type Response = {
    facts: Fact[];
    error?: string;
    prompt_template: string;
}

export type Document = {
    name: string;
    text: string;
    user: User;
}

export type ReadDocument = {
    id: number,
    filename: string,
    user: User;
    fileSize: number;
}

export type User = {
    id: number;
    auth0_id: string;
    username: string;
    email: string;
    lang: string;
}

export type Settings = {
    prompt_template: string;
    pre_phrase_count: number;
    post_phrase_count: number;
    fact_count: number;
}