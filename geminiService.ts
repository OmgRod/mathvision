
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

    BONUS: ONLY if a visual diagram (geometry shape, coordinate graph, number line) is STRICTLY NECESSARY to understand a specific step, generate a clean, minimal SVG string for it under 'diagramSvg' within that step. Do NOT generate diagrams unless they provide critical clarity that text cannot. CRITICAL: Diagrams must NOT spoil the final answer or include solution values; they should only represent the problem logic visually.
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
    
    TONE: Professional, academic, exam-like. 
    
    LANGUAGE: Adapt the linguistic complexity to the topic. For elementary school topics (e.g., 'Addition', 'Subtraction', 'Place Value'), use clear, simple vocabulary appropriate for children. For advanced or university-level topics, use formal academic language. Avoid being overly simplistic or patronizing; match the tone to the target audience of the topic.
    
    STEPS: Provide a logical breakdown of 1-4 steps. Each step must be a significant progression. Do NOT create trivial steps (e.g. "Step 2: Conclusion"). The last step should always represent the final answer.
    
    Use LaTeX for all expressions. Wrap ANY mathematical expression (numbers, variables, formulas) in double dollar signs (e.g. $$x = 5$$).
    
    DIAGRAMS: For ANY question involving geometry, trigonometry, coordinates, or spatial relationships, you MUST provide a 'diagramSvg'. 
    
    CRITICAL DIAGRAM SAFETY: The 'diagramSvg' must ONLY represent the initial problem state. You are STRICTLY FORBIDDEN from including the final answer, solution values, or the 'target' value (N) in the diagram if it would spoil the question. For example, on a number line, you may mark the reference points, but do NOT mark the exact answer point.
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

export const evaluateStep = async (question: string, expectedMath: string, userMath: string, finalAnswer?: string): Promise<QuizFeedback> => {
  const prompt = `
    The math question is: "${question}"
    ${finalAnswer ? `The FINAL intended answer to the entire question is: "${finalAnswer}"` : ''}
    The expected NEXT STEP expression is: "${expectedMath}"
    
    The user provided: "${userMath}"
    
    Evaluate two things:
    1. Is the user's expression mathematically equivalent to the expected NEXT STEP?
    2. Is the user's expression (or its direct result) already the FINAL intended answer for the entire question?
    
    TONE: Ensure the message matches the linguistic complexity of the topic. Encourage younger students with simpler praise; use technical confirmation for advanced topics.
    
    Provide your evaluation in JSON:
    - isCorrect (boolean): true if it matches the next step OR if it's the final answer.
    - isFinalAnswer (boolean): true ONLY if the user provided the final answer to the entire question.
    - message (string): Feedback for the user. If they reached the final answer, congratulate them.
    - improvement (string): Optional tip.
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
            isFinalAnswer: { type: Type.BOOLEAN },
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

export const generateLesson = async (topic: string, level: number = 1): Promise<Lesson> => {
  const prompt = `
    You are a master math teacher. Create a structured interactive lesson on: "${topic}".
    This is Level ${level} of the topic. ${level > 1 ? 'Focus on more advanced concepts, complex applications, and deeper theoretical understanding than the basic level.' : 'Start with fundamental concepts and clear explanations.'}
    
    LANGUAGE: Match the vocabulary and complexity to the difficulty of the topic. Use simpler words for elementary topics and academic terminology only for advanced subjects.
    
    STRUCTURE:
    1. Introduction: The core concept and its significance.
    2. Theoretical Foundation: Clear explanation of the rules/formulas.
    3. Worked Example: An exam-style problem with a step-by-step solution.
    4. Pro Tips & Common Pitfalls.

    For each section, provide a title and Markdown content. Use LaTeX ($$formula$$) for all math. 
    Use \\n for intentional line breaks in markdown content.
    
    DIAGRAMS: For geometric or visual concepts, provide a 'diagramSvg'. CRITICAL: Do NOT include final answers or spoilers in diagrams.
    
    Provide a 'description' (short engaging summary) and 'outline' (list of key takeaways).

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
            description: { type: Type.STRING },
            outline: { type: Type.ARRAY, items: { type: Type.STRING } },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  diagramSvg: { type: Type.STRING, description: "SVG string for geometric concepts" }
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
          required: ["description", "outline", "sections", "checkpoints"]
        }
      }
    });

    const jsonStr = response.text?.trim() || "{}";
    const data = JSON.parse(jsonStr);
    return {
      topic,
      description: data.description,
      outline: data.outline,
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

export const generateTopicOutline = async (topic: string, level: number): Promise<string[]> => {
  const prompt = `
    Generate a 4-item list of key learning objectives for Level ${level} of "${topic}".
    The items should be short (max 8 words each) and focus on advanced progression.
    Return ONLY a JSON array of strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text?.trim() || "[]");
  } catch (error) {
    console.error("Error generating outline:", error);
    return ["Concept Review", "Practical Application", "Problem Solving", "Final Mastery"];
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
