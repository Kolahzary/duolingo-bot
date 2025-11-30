export interface MatchPair {
    fromToken: string;
    learningToken: string;
    character?: string;
    transliteration?: string;
}

export interface Challenge {
    id: string;
    type: string;
    pairs?: MatchPair[];
    // Add other challenge types as needed
    prompt?: string;
    correctSolutions?: string[];
}

export interface Session {
    id: string;
    type: string;
    challenges: Challenge[];
    fromLanguage: string;
    learningLanguage: string;
    metadata?: any;
}
