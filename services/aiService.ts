
import { GoogleGenAI, Type } from "@google/genai";
import type { Question, QuizMode, StudyGuide } from '../types';

// This declaration is needed because we are loading pdfjs from a CDN
declare const pdfjsLib: any;

export async function extractTextFromPdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
    }

    return fullText;
}

export async function generateStudyGuide(context: string): Promise<StudyGuide> {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `You are an expert academic assistant specializing in the ISTQB syllabus. Your task is to analyze the provided text and distill it into a concise and effective study guide.

    **Core Requirements:**

    1.  **Extract Key Terminologies:** Identify the most important terms, concepts, or acronyms from the text. For each term, provide a clear and simple definition based on the context provided.
    2.  **Create a Cheat Sheet:** Summarize the core concepts, principles, rules, or processes from the text. This should be formatted as a bulleted list for quick revision and easy understanding.
    3.  **Accuracy and Conciseness:** Both the terminologies and the cheat sheet must be accurate and directly derived from the provided text. Avoid introducing external information. The goal is to create a high-yield summary of the source material.
    4.  **Quality Gate:** If the provided text is too short, irrelevant, or lacks sufficient substance to create a meaningful study guide, you MUST return an empty object.

    Here is the text to analyze:
    ---
    ${context}
    ---
    `;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            terminologies: {
                type: Type.ARRAY,
                description: "A list of key terms and their definitions.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        term: { type: Type.STRING, description: "The key term or concept." },
                        definition: { type: Type.STRING, description: "A clear and concise definition." }
                    },
                    required: ['term', 'definition']
                }
            },
            cheatSheet: {
                type: Type.STRING,
                description: "A bulleted list summary of the core concepts for quick revision. Use markdown for formatting (e.g., '- ' for bullets)."
            }
        },
        required: ['terminologies', 'cheatSheet']
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.3,
            },
        });

        const jsonText = response.text.trim();
        const generatedGuide = JSON.parse(jsonText);
        return generatedGuide as StudyGuide;
    } catch (error) {
        console.error("Error generating study guide:", error);
        throw new Error("Failed to generate study guide. The AI model might be unavailable or the response was malformed.");
    }
}

export async function generateQuestions(context: string, mode: QuizMode | 'default'): Promise<Question[]> {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let questionCount = '10-15';
    let modeDescription = 'This should be a standard quiz covering the main points of the text.';
    let modeTitle = 'Question Generation';

    if (mode === 'mock') {
        questionCount = '15-20';
        modeDescription = `This should be a broad mock exam, covering a variety of topics found in the text.`;
        modeTitle = 'Mock Exam Simulator';
    }

    const prompt = `You are an expert ISTQB exam paper setter. Your task is to analyze the provided text about software testing and generate a set of challenging multiple-choice questions (MCQs) that perfectly mimic the style, format, and difficulty of a real ISTQB Foundation Level exam.

    **Mode:** ${modeTitle}
    **Instructions for this mode:** ${modeDescription}

    **Core Requirements:**

    1.  **Question Style & Tone:**
        *   The questions must be standalone and professional.
        *   **CRITICAL:** Do NOT use phrases like "According to the text," "Based on the provided document," "The text states," "In the context of the text," or any similar wording that references the source material. The questions must make sense without the original text, as in a real exam.
        *   Adopt the persona of an official ISTQB examiner. The tone should be formal and precise.

    2.  **Question Content & Depth:**
        *   Generate ${questionCount} high-quality questions. If the text can only support fewer, prioritize quality over quantity.
        *   Create a diverse mix of question types: definition-based, scenario-based, comparison-based, and questions requiring the application of a concept.
        *   "Grill" the text. Go beyond simple recall. Formulate questions that test deep understanding, require analysis of subtle details, and force comparison between concepts.

    3.  **Options (Alternatives):**
        *   Each question must have exactly four distinct options.
        *   One option must be unequivocally correct based on established software testing principles found within the text.
        *   The other three options must be plausible but incorrect distractors. These distractors should be crafted from common industry misconceptions or closely related (but incorrect) concepts from the text.

    4.  **Quality Gate:**
        *   If the provided text is too short, irrelevant, or lacks sufficient substance to create high-quality ISTQB-style questions, you MUST return an empty array.

    Here is the text to analyze:
    ---
    ${context}
    ---
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: 'The full text of the multiple-choice question.'
            },
            options: {
              type: Type.ARRAY,
              description: 'An array of four strings, representing the possible answers.',
              items: { type: Type.STRING }
            },
            answer: {
              type: Type.STRING,
              description: 'The correct answer, which must be exactly one of the strings from the options array.'
            }
          },
          required: ['question', 'options', 'answer']
        }
      };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.5,
            },
        });

        const jsonText = response.text.trim();
        const generatedQuestions = JSON.parse(jsonText);

        if (!Array.isArray(generatedQuestions)) {
            throw new Error("AI response is not in the expected format.");
        }

        return generatedQuestions as Question[];
    } catch (error) {
        console.error("Error generating questions:", error);
        throw new Error("Failed to generate questions. The AI model might be unavailable or the response was malformed.");
    }
}

export async function getTutorExplanation(question: Question, userQuery: string): Promise<string> {
     if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `You are an expert ISTQB Tutor AI. A student is asking for help with a specific exam question.
    Your task is to provide a clear, concise, and encouraging explanation based on their query.

    **The Question:**
    ${question.question}

    **Options:**
    A. ${question.options[0]}
    B. ${question.options[1]}
    C. ${question.options[2]}
    D. ${question.options[3]}

    **Correct Answer:**
    ${question.answer}

    **Student's Question:**
    "${userQuery}"

    **Your Instructions:**
    1.  Directly address the student's question.
    2.  Explain why the correct answer is correct, referencing core ISTQB principles.
    3.  Briefly explain why the other options are incorrect, if relevant to the student's query.
    4.  Maintain a supportive and educational tone. Do not simply give the answer away; explain the concept.
    5.  Format your response clearly using markdown for readability (e.g., bolding, bullet points).
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    // FIX: Added curly braces to the catch block to correctly handle errors.
    } catch (error) {
        console.error("Error getting explanation:", error);
        throw new Error("Failed to get explanation from the AI Tutor.");
    }
}
