
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
    Generate a professional EXAM-STYLE math question related to "${topic}".
    
    STRUCTURE:
    1. A concise problem statement.
    2. Given values/constraints as a bulleted list (if multiple).
    3. A direct instruction like "Find the value of..." or "Prove that...".
    
    TONE: Professional, academic, exam-like. Avoid patronizing language.
    
    Use LaTeX for all expressions. Wrap ANY mathematical expression (numbers, variables, formulas) in double dollar signs (e.g. $$x = 5$$).
    
    DIAGRAMS: For ANY question involving geometry, trigonometry, coordinates, or spatial relationships, you MUST provide a 'diagramSvg'. The diagram should be minimal, clean, and use <text> elements for labels.
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
    You are a master math teacher. Create a structured lesson on: "${topic}".
    
    STRUCTURE:
    1. Introduction: The core concept and its significance.
    2. Theoretical Foundation: Clear explanation of the rules/formulas.
    3. Worked Example: An exam-style problem with a step-by-step solution.
    4. Pro Tips & Common Pitfalls.

    For each section, provide a title and Markdown content. Use LaTeX ($$formula$$) for all math. 
    
    In Checkpoints, use standard exam-style phrasing.
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
