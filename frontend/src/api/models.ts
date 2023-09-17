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
    full_text: string;
    entities: [[string, number, number, string]];
}

export type Response = {
    facts?: Fact[];
    error?: string;
    llm_answer?: any;
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
}

export type User = {
    id: number;
    auth0_id: string;
    username: string;
    email: string;
}


