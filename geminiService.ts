
import { GoogleGenAI, Type } from "@google/genai";
import { MathResult, QuizQuestion, QuizFeedback } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const solveMathEquation = async (input: { image?: string; text?: string; mimeType?: string }): Promise<MathResult> => {
  const prompt = `
    Analyze the mathematical problem provided below.
    ${input.text ? `Problem description: ${input.text}` : 'Analyze the attached image.'}
    
    CRITICAL: Detect if the problem has multiple parts (e.g., Question 1, 2, 3 or parts a, b, c).
    Provide a detailed breakdown for each part.
    
    For each part, provide:
    1. partId: The identifier (e.g., "1", "2a", "Part B").
    2. finalAnswer: The result in clean LaTeX.
    3. explanation: A detailed Markdown explanation (Essay mode).
    4. steps: A list of simplified steps for a carousel (Easy mode).

    BONUS: If a visual diagram (geometry shape, coordinate graph, number line) would help explain a step or the overall problem, generate a clean, minimal SVG string for it under 'diagramSvg' (step-level) or 'mainDiagramSvg' (overall). Use simple shapes and text.
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
            parts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  partId: { type: Type.STRING, description: "Identifier like '1' or '2a'" },
                  title: { type: Type.STRING },
                  finalAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  steps: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        math: { type: Type.STRING },
                        diagramSvg: { type: Type.STRING, description: "Minimal SVG string if applicable" }
                      },
                      required: ["title", "math"]
                    }
                  }
                },
                required: ["partId", "finalAnswer", "explanation", "steps"]
              }
            },
            overallExplanation: { type: Type.STRING },
            mainDiagramSvg: { type: Type.STRING }
          },
          required: ["parts"]
        }
      }
    });

    const jsonStr = response.text?.trim() || "{}";
    const result = JSON.parse(jsonStr);
    
    return {
      parts: result.parts || [],
      overallExplanation: result.overallExplanation,
      mainDiagramSvg: result.mainDiagramSvg
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process the math problem. Please try again.");
  }
};

export const generateQuizQuestion = async (topic: string): Promise<QuizQuestion> => {
  const prompt = `
    Generate a challenging but solvable math question related to the topic: "${topic}".
    If appropriate for the topic (e.g., geometry, coordinates, sets), include a 'diagramSvg' (minimal SVG string) to illustrate the question.
    
    IMPORTANT: Wrap any mathematical expressions within the question text AND the step instructions (titles) using double dollar signs (e.g., $$x^2 + 5x = 0$$) so they can be rendered with KaTeX.
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
            diagramSvg: { type: Type.STRING },
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
