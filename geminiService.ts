
import { GoogleGenAI, Type } from "@google/genai";
import { MathResult, QuizQuestion, QuizFeedback } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const solveMathEquation = async (input: { image?: string; text?: string; mimeType?: string }): Promise<MathResult> => {
  const prompt = `
    Analyze the mathematical problem provided below.
    ${input.text ? `Problem description: ${input.text}` : 'Analyze the attached image.'}
    Extract the core equation and provide:
    1. The final answer formatted in clean LaTeX.
    2. A detailed, step-by-step explanation of how to arrive at that answer in Markdown format (the "essay" way).
    3. A simplified list of steps for a carousel view (the "easy" way). Each step should have a short title/instruction and the mathematical expression for that step in LaTeX.
  `;

  try {
    const parts: any[] = [{ text: prompt }];
    if (input.image && input.mimeType) {
      parts.push({
        inlineData: {
          mimeType: input.mimeType,
          data: input.image.split(',')[1] || input.image,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            finalAnswer: {
              type: Type.STRING,
              description: "The final mathematical result in LaTeX (e.g., x = 5 or \\frac{1}{2}). Do not include delimiters like $$ here."
            },
            explanation: {
              type: Type.STRING,
              description: "Detailed step-by-step solution in Markdown (Essay mode)."
            },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Short instruction for this step (e.g., 'Subtract 5 from both sides')" },
                  math: { type: Type.STRING, description: "The mathematical expression for this step in LaTeX." }
                },
                required: ["title", "math"]
              },
              description: "Simplified steps for carousel view (Easy mode)."
            }
          },
          required: ["finalAnswer", "explanation", "steps"]
        }
      }
    });

    const jsonStr = response.text?.trim() || "{}";
    const result = JSON.parse(jsonStr);
    
    return {
      finalAnswer: result.finalAnswer || "Unable to determine answer",
      explanation: result.explanation || "No explanation provided.",
      steps: result.steps || []
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process the math problem. Please try again.");
  }
};

export const generateQuizQuestion = async (topic: string): Promise<QuizQuestion> => {
  const prompt = `
    Generate a challenging but solvable math question related to the topic: "${topic}".
    Provide the question, the final answer (LaTeX), and the correct steps (list of instructions and LaTeX expressions).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            finalAnswer: { type: Type.STRING },
            correctSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  math: { type: Type.STRING }
                },
                required: ["title", "math"]
              }
            }
          },
          required: ["question", "finalAnswer", "correctSteps"]
        }
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...result
    };
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    throw new Error("Failed to generate a practice question.");
  }
};

export const evaluateStep = async (question: string, expectedMath: string, userMath: string): Promise<QuizFeedback> => {
  const prompt = `
    The math question is: "${question}"
    The expected next step expression is: "${expectedMath}"
    The user provided: "${userMath}"
    Evaluate if the user's expression is mathematically equivalent to the expected step or represents a correct progression.
    Provide your evaluation in JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            message: { type: Type.STRING },
            improvement: { type: Type.STRING }
          },
          required: ["isCorrect", "message"]
        }
      }
    });

    return JSON.parse(response.text?.trim() || "{}");
  } catch (error) {
    console.error("Step Evaluation Error:", error);
    return { isCorrect: false, message: "Error evaluating step. Please try again." };
  }
};
