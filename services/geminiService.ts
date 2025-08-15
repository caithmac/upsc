import { GoogleGenAI, Type } from "@google/genai";
import { EnhancedFeedback, QuestionClassification } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Enhanced Prompts
const QUESTION_TYPE_DETECTION_PROMPT = `
Analyze the following UPSC question and classify it. Return a JSON object with the classification.

Question: {question_text}

Classification criteria:
- ESSAY: Long-form questions (200+ words), philosophical/analytical topics
- FACTUAL: Direct knowledge questions, definitions, list-based answers
- CASE_STUDY: Scenario-based questions with practical applications
- CURRENT_AFFAIRS: Questions about recent events, government policies
- DIAGRAM_BASED: Questions requiring maps, charts, or illustrations
- COMPARATIVE: Questions asking to compare/contrast concepts
- ANALYTICAL: Questions requiring critical analysis, pros/cons

Return JSON format:
{
  "questionType": "ESSAY|FACTUAL|CASE_STUDY|CURRENT_AFFAIRS|DIAGRAM_BASED|COMPARATIVE|ANALYTICAL",
  "subject": "History|Geography|Polity|Economics|Environment|Ethics|InternationalRelations|ScienceTech",
  "expectedWordCount": 250,
  "keyRequirements": ["requirement1", "requirement2"],
  "evaluationFocus": ["content", "structure", "examples", "analysis"]
}
`;

const SUBJECT_SPECIFIC_PROMPTS: Record<string, string> = {
  History: `
You are an expert UPSC History examiner. Evaluate this answer focusing on:
- Chronological accuracy and timeline understanding
- Cause-effect relationships in historical events
- Use of specific dates, names, and historical evidence
- Balanced perspective on historical interpretations
- Connection between past events and present relevance

Historical accuracy weight: 40%
Analytical depth weight: 30%
Examples and evidence weight: 20%
Structure and presentation weight: 10%
`,
  Geography: `
You are an expert UPSC Geography examiner. Evaluate focusing on:
- Spatial understanding and location accuracy
- Physical-human geography linkages
- Use of geographical terminology and concepts
- Map-based thinking and spatial relationships
- Environmental and developmental connections
- Statistical data usage and accuracy

Conceptual clarity weight: 35%
Spatial accuracy weight: 25%
Data and examples weight: 25%
Analytical skills weight: 15%
`,
  Polity: `
You are an expert UPSC Polity examiner. Evaluate focusing on:
- Constitutional provisions accuracy
- Understanding of governmental processes
- Federal structure and center-state relations
- Rights and duties comprehension
- Contemporary political developments relevance
- Legal and procedural accuracy

Constitutional knowledge weight: 40%
Current relevance weight: 25%
Analytical understanding weight: 20%
Structure and clarity weight: 15%
`,
  Economics: `
You are an expert UPSC Economics examiner. Evaluate focusing on:
- Economic concepts and theory application
- Statistical data interpretation
- Policy analysis and implications
- Current economic trends awareness
- Quantitative reasoning where applicable
- Economic terminology usage

Conceptual understanding weight: 35%
Data interpretation weight: 25%
Policy analysis weight: 25%
Current affairs integration weight: 15%
`
};

const ENHANCED_EVALUATION_PROMPT = `
You are an expert UPSC examiner with 20+ years of experience. Evaluate this answer using the provided context.

CONTEXT:
- Question Type: {questionType}
- Subject: {subject}
- Expected Word Count: {expectedWordCount}
- Key Requirements: {keyRequirements}

ORIGINAL QUESTION: {question}

CANDIDATE ANSWER: {transcribedText}

EVALUATION CRITERIA (Use subject-specific weights):
{subjectSpecificCriteria}

Provide detailed evaluation in this exact JSON format:
{
  "overallScore": 0,
  "confidence": 0,
  "humanReviewRequired": false,
  "wordCount": 0,
  "timeEstimate": "X minutes",
  "questionTypeMatch": "How well answer addresses question type",
  "dimensionalScores": {
    "contentAccuracy": 0, "structurePresentation": 0, "keywordUsage": 0, "languageClarity": 0, "analyticalDepth": 0, "currentAffairsRelevance": 0, "examplesQuality": 0
  },
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"],
  "keywordsAnalysis": { "used": [], "missing": [], "incorrectUsage": [] },
  "structureAnalysis": { "hasIntroduction": false, "hasConclusion": false, "logicalFlow": "Poor", "paragraphStructure": "evaluation" },
  "improvementSuggestions": ["specific suggestion 1"],
  "modelAnswerHints": ["What ideal answer should include point 1"],
  "nextSteps": ["Immediate action 1"]
}

EVALUATION NOTES:
- Flag confidence < 0.7 for human review
- Consider handwriting legibility in scoring
- Account for visual elements (diagrams, maps) mentioned in answer
- Compare against UPSC marking standards (liberal for content, strict for presentation)
- Provide actionable, specific feedback
`;

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const transcribeAnswerSheet = async (documentFile: File): Promise<string> => {
    try {
        const filePart = await fileToGenerativePart(documentFile);
        const prompt = `You are an Optical Character Recognition (OCR) specialist. Transcribe the handwritten text from the provided document which may contain multiple questions and answers. 
        
        Your task is to:
        1. Identify each distinct question and its corresponding answer.
        2. Transcribe both the question and the answer text accurately.
        3. Separate each complete question-and-answer pair with the exact delimiter: '--- Q&A SEPARATOR ---'.

        Your response should contain only the transcribed text and the separators. Do not add any other commentary, titles, or formatting.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    { text: prompt },
                    filePart,
                ]
            },
            config: {
                temperature: 0.1,
            }
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error transcribing answer sheet:", error);
        throw new Error("Failed to transcribe the document. The AI may not have been able to read the handwriting.");
    }
}

// Helper to extract question, answer, and classify the question in one step.
async function analyzeQuestionAndGetClassification(qnaText: string): Promise<{ question: string; answer: string; classification: QuestionClassification }> {
    const prompt = `
You are a UPSC exam analysis tool. Given a block of transcribed text containing a question and its answer, your tasks are:
1. Separate the question from the answer.
2. Analyze the QUESTION and classify it according to the provided criteria.

Transcribed Text:
---
${qnaText}
---

Return a single JSON object with the following structure:
{
  "question": "The extracted question text.",
  "answer": "The extracted answer text.",
  "classification": {
    "questionType": "ESSAY|FACTUAL|CASE_STUDY|CURRENT_AFFAIRS|DIAGRAM_BASED|COMPARATIVE|ANALYTICAL",
    "subject": "History|Geography|Polity|Economics|Environment|Ethics|InternationalRelations|ScienceTech",
    "expectedWordCount": 250,
    "keyRequirements": ["requirement1", "requirement2"],
    "evaluationFocus": ["content", "structure", "examples", "analysis"]
  }
}
`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
            classification: {
                type: Type.OBJECT,
                properties: {
                    questionType: { type: Type.STRING, enum: ["ESSAY", "FACTUAL", "CASE_STUDY", "CURRENT_AFFAIRS", "DIAGRAM_BASED", "COMPARATIVE", "ANALYTICAL"] },
                    subject: { type: Type.STRING, enum: ["History", "Geography", "Polity", "Economics", "Environment", "Ethics", "InternationalRelations", "ScienceTech"] },
                    expectedWordCount: { type: Type.NUMBER },
                    keyRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
                    evaluationFocus: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["questionType", "subject", "expectedWordCount", "keyRequirements", "evaluationFocus"]
            }
        },
        required: ["question", "answer", "classification"]
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    return JSON.parse(response.text);
}


const enhancedFeedbackSchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: { type: Type.NUMBER },
        confidence: { type: Type.NUMBER },
        humanReviewRequired: { type: Type.BOOLEAN },
        wordCount: { type: Type.NUMBER },
        timeEstimate: { type: Type.STRING },
        questionTypeMatch: { type: Type.STRING },
        dimensionalScores: {
            type: Type.OBJECT,
            properties: {
                contentAccuracy: { type: Type.NUMBER },
                structurePresentation: { type: Type.NUMBER },
                keywordUsage: { type: Type.NUMBER },
                languageClarity: { type: Type.NUMBER },
                analyticalDepth: { type: Type.NUMBER },
                currentAffairsRelevance: { type: Type.NUMBER },
                examplesQuality: { type: Type.NUMBER }
            },
            required: ["contentAccuracy", "structurePresentation", "keywordUsage", "languageClarity", "analyticalDepth", "currentAffairsRelevance", "examplesQuality"]
        },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        keywordsAnalysis: {
            type: Type.OBJECT,
            properties: {
                used: { type: Type.ARRAY, items: { type: Type.STRING } },
                missing: { type: Type.ARRAY, items: { type: Type.STRING } },
                incorrectUsage: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["used", "missing", "incorrectUsage"]
        },
        structureAnalysis: {
            type: Type.OBJECT,
            properties: {
                hasIntroduction: { type: Type.BOOLEAN },
                hasConclusion: { type: Type.BOOLEAN },
                logicalFlow: { type: Type.STRING, enum: ["Poor", "Fair", "Good", "Excellent"] },
                paragraphStructure: { type: Type.STRING }
            },
            required: ["hasIntroduction", "hasConclusion", "logicalFlow", "paragraphStructure"]
        },
        improvementSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        modelAnswerHints: { type: Type.ARRAY, items: { type: Type.STRING } },
        nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["overallScore", "confidence", "humanReviewRequired", "wordCount", "timeEstimate", "questionTypeMatch", "dimensionalScores", "strengths", "weaknesses", "keywordsAnalysis", "structureAnalysis", "improvementSuggestions", "modelAnswerHints", "nextSteps"]
};

const finalEvaluationSchema = {
    type: Type.ARRAY,
    items: enhancedFeedbackSchema
};


export const gradeAnswerSheet = async (documentFile: File, transcribedText: string): Promise<EnhancedFeedback[]> => {
    try {
        const qnaPairs = transcribedText.split('--- Q&A SEPARATOR ---').map(p => p.trim()).filter(p => p.length > 0);

        // Step 1: Analyze and classify all questions in parallel
        const analysisPromises = qnaPairs.map(qna => analyzeQuestionAndGetClassification(qna));
        const analyses = await Promise.all(analysisPromises);
        
        // Step 2: Build the single, powerful evaluation prompt
        const evaluationBatch = analyses.map(({ question, answer, classification }) => {
            const subject = classification.subject as keyof typeof SUBJECT_SPECIFIC_PROMPTS;
            const subjectSpecificCriteria = SUBJECT_SPECIFIC_PROMPTS[subject] || "General evaluation criteria apply.";

            return {
                context: {
                    questionType: classification.questionType,
                    subject: classification.subject,
                    expectedWordCount: classification.expectedWordCount,
                    keyRequirements: classification.keyRequirements,
                    subjectSpecificCriteria
                },
                question,
                answer
            };
        });

        const prompt = `
You are an expert UPSC examiner with 20+ years of experience. Evaluate a batch of answers based on the provided context for each.

EVALUATION BATCH:
${JSON.stringify(evaluationBatch, null, 2)}

Provide a detailed evaluation for EACH answer in the batch. Your final output MUST be a JSON array, where each object in the array corresponds to an answer from the input batch and follows the specified JSON schema.
Ensure the output is a valid JSON array of evaluation objects.
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: finalEvaluationSchema,
                temperature: 0.3,
            },
        });
        
        const feedbackArray = JSON.parse(response.text.trim());

        // Manually add the original question to each feedback object
        return feedbackArray.map((fb: Omit<EnhancedFeedback, 'question'>, index: number) => ({
            ...fb,
            question: analyses[index].question
        }));


    } catch (error) {
        console.error("Error grading answer sheet:", error);
        throw new Error("Failed to get feedback from the AI. Please check the console for details.");
    }
};
