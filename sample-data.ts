import { EnhancedFeedback } from './types';

export const sampleEnhancedFeedback: EnhancedFeedback[] = [
    {
        question: "Discuss the role of the gig economy in fostering economic growth in India. What are the challenges associated with it?",
        overallScore: 7.2,
        confidence: 0.95,
        humanReviewRequired: false,
        wordCount: 280,
        timeEstimate: "12 minutes",
        questionTypeMatch: "The answer correctly addresses both parts of the analytical question, discussing both economic growth and challenges.",
        dimensionalScores: {
            contentAccuracy: 7.5,
            structurePresentation: 6.5,
            keywordUsage: 7.0,
            languageClarity: 8.0,
            analyticalDepth: 6.8,
            currentAffairsRelevance: 7.5,
            examplesQuality: 8.0
        },
        strengths: [
            "Good introduction that clearly defines the gig economy.",
            "Covered both economic growth aspects and challenges, showing a balanced view.",
            "Used relevant and contemporary examples like Urban Company, Swiggy, and Zomato."
        ],
        weaknesses: [
            "Lacked specific data or statistics to back up claims about economic growth.",
            "The section on challenges could be more structured; it mixes worker rights with regulatory issues.",
            "Conclusion is a bit abrupt and could be more forward-looking."
        ],
        keywordsAnalysis: {
            used: ["Gig Economy", "Job Creation", "Flexibility", "Job Security", "Startups"],
            missing: ["NITI Aayog", "Code on Social Security 2020", "Platform Workers", "Skill Development", "Informal Sector"],
            incorrectUsage: []
        },
        structureAnalysis: {
            hasIntroduction: true,
            hasConclusion: true,
            logicalFlow: "Good",
            paragraphStructure: "Paragraphs are mostly well-defined but some mix multiple ideas. Using subheadings would improve clarity."
        },
        improvementSuggestions: [
            "Incorporate Data: Strengthen arguments by citing reports, e.g., from NITI Aayog or the ILO on the gig economy's size and growth.",
            "Structure Your Arguments: Use subheadings for different sections (e.g., 'Positive Impacts', 'Challenges for Workers', 'Regulatory Hurdles').",
            "Enhance Conclusion: A great conclusion doesn't just summarize; it offers a forward-looking perspective or suggests a balanced way forward."
        ],
        modelAnswerHints: [
            "An ideal answer would start by quoting a recent statistic on the size of India's gig workforce.",
            "It would systematically break down challenges into social, economic, and legal categories.",
            "It should conclude by discussing potential policy solutions, referencing the Code on Social Security, 2020."
        ],
        nextSteps: [
            "Read the summary of the 'Code on Social Security, 2020' focusing on provisions for gig and platform workers.",
            "Practice writing answers on economic topics, focusing on integrating data from the Economic Survey.",
            "Review editorials from newspapers like The Hindu or Indian Express on labor reforms and the gig economy."
        ]
    }
];
