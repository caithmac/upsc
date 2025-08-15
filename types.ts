
export interface QuestionClassification {
    questionType: "ESSAY" | "FACTUAL" | "CASE_STUDY" | "CURRENT_AFFAIRS" | "DIAGRAM_BASED" | "COMPARATIVE" | "ANALYTICAL";
    subject: "History" | "Geography" | "Polity" | "Economics" | "Environment" | "Ethics" | "InternationalRelations" | "ScienceTech";
    expectedWordCount: number;
    keyRequirements: string[];
    evaluationFocus: string[];
}

export interface EnhancedFeedback {
    question: string;
    overallScore: number;
    confidence: number;
    humanReviewRequired: boolean;
    wordCount: number;
    timeEstimate: string;
    questionTypeMatch: string;

    dimensionalScores: {
        contentAccuracy: number;
        structurePresentation: number;
        keywordUsage: number;
        languageClarity: number;
        analyticalDepth: number;
        currentAffairsRelevance: number;
        examplesQuality: number;
    };

    strengths: string[];
    weaknesses: string[];

    keywordsAnalysis: {
        used: string[];
        missing: string[];
        incorrectUsage: string[];
    };

    structureAnalysis: {
        hasIntroduction: boolean;
        hasConclusion: boolean;
        logicalFlow: "Poor" | "Fair" | "Good" | "Excellent";
        paragraphStructure: string;
    };

    improvementSuggestions: string[];
    modelAnswerHints: string[];
    nextSteps: string[];
}
