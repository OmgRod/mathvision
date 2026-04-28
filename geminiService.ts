
import { GoogleGenAI, Type } from "@google/genai";
import { MathResult, QuizQuestion, QuizFeedback, Lesson } from "./types";

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

    BONUS: ONLY if a visual diagram (geometry shape, coordinate graph, number line) is STRICTLY NECESSARY to understand a specific step, generate a clean, minimal SVG string for it under 'diagramSvg' within that step. Do NOT generate diagrams unless they provide critical clarity that text cannot.
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
            }
          },
          required: ["parts"]
        }
      }
    });

    const jsonStr = response.text?.trim() || "{}";
    const result = JSON.parse(jsonStr);
    
    return {
      parts: result.parts || []
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process the math problem. Please try again.");
  }
};

export const generateQuizQuestion = async (topic: string): Promise<QuizQuestion> => {
  const prompt = `
    Generate a challenging but solvable math question related to the topic: "${topic}".
    ONLY if a visual diagram (geometry shape, coordinate graph, number line) is STRICTLY NECESSARY to understand the question, include a 'diagramSvg' (minimal SVG string).
    
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

export const generateLesson = async (topic: string): Promise<Lesson> => {
  const prompt = `
    You are a master math teacher who makes learning FUN and SIMPLE. Create a lesson on: "${topic}".
    
    TONE: Super friendly, encouraging, and clear. Avoid heavy jargon. Use real-world analogies (e.g., "Think of an equation like a balanced playground seesaw").
    
    STRUCTURE:
    1. Hook: Start with a "Why does this matter?" or a fun fact.
    2. The "Secret Sauce": Explain the concept in the simplest possible way.
    3. Practice Lap: Walk through one easy example.
    4. Pro Tip: A clever shortcut or common mistake to avoid.

    For each section, provide a title and Markdown content. Use LaTeX for math ($$formula$$). 
    
    CRITICAL: 
    - Keep it simple enough for someone seeing it for the first time.
    - Use LaTeX for ALL math expressions.
    - If a simple diagram (like a sketch of a graph or a shape) helps, include 'diagramSvg'.
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
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  diagramSvg: { type: Type.STRING }
                },
                required: ["title", "content"]
              }
            },
            checkpoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "correctAnswer", "explanation"]
              }
            }
          },
          required: ["sections", "checkpoints"]
        }
      }
    });

    const jsonStr = response.text?.trim() || "{}";
    const data = JSON.parse(jsonStr);
    return {
      topic,
      sections: data.sections,
      checkpoints: data.checkpoints
    };
  } catch (error) {
    console.error("Gemini Lesson Error:", error);
    throw error;
  }
};

export const evaluateLessonAnswer = async (topic: string, question: string, userAnswer: string, correctAnswer: string): Promise<QuizFeedback> => {
  const prompt = `
    A student is taking a lesson on "${topic}".
    Question: "${question}"
    Expected Answer (Reference): "${correctAnswer}"
    Student's Answer: "${userAnswer}"
    
    Evaluate if the student's answer is conceptually correct, even if not phrased exactly like the reference.
    Provide constructive feedback. Use LaTeX for math ($$formula$$).
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

    const jsonStr = response.text?.trim() || "{}";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Evaluation Error:", error);
    return { isCorrect: false, message: "I couldn't evaluate your answer right now. Check the reference answer to see if you were right!" };
  }
};

export const askLessonClarification = async (topic: string, question: string, context: string): Promise<string> => {
  const prompt = `
    A student is learning about "${topic}". 
    They just read the following lesson content:
    ---
    ${context}
    ---
    
    They have a question or need clarification: "${question}".
    
    As a helpful tutor, explain it simply. Use Markdown and LaTeX for math ($$formula$$). 
    Be encouraging and clear. Keep the answer concise (under 150 words).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] }
    });
    return response.text?.trim() || "I'm sorry, I'm having trouble connecting to my brain right now. Please try again!";
  } catch (error) {
    console.error("Clarification Error:", error);
    return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again!";
  }
};
