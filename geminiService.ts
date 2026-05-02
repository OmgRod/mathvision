
import { GoogleGenAI, Type } from "@google/genai";
import { MathResult, QuizQuestion, QuizFeedback, Lesson } from "./types";
import { findBestMatchingTopic } from './constants';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// List of models to try in order of preference
const MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.1-pro-preview',
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-flash',

];

// Helper function to try models in sequence
async function tryModels(contents: any, config: any): Promise<any> {
  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config
      });
      return response;
    } catch (error: any) {
      console.warn(`Model ${model} failed:`, error.message);
      // If it's a 429 (rate limit), try next model
      if (error.status === 429 || error.message?.includes('429') || error.message?.includes('rate limit')) {
        continue;
      }
      // For other errors, still try next model as fallback
      continue;
    }
  }
  // If all models fail, throw the last error
  throw new Error("All models failed. Please try again later.");
}

export const solveMathEquation = async (input: { image?: string; text?: string; mimeType?: string }, socraticMode: boolean = false): Promise<MathResult> => {
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
    
    CRITICAL: Use LaTeX ($$formula$$) for ALL mathematical expressions in 'finalAnswer', 'explanation', and 'steps'. This includes individual numbers (e.g. $$5$$), variables (e.g. $$x$$), and formulas.
    
    ${socraticMode ? `
    STRICT SOCRATIC MODE ENABLED:
    - YOUR GOAL IS TO NEVER GIVE AWAY THE FINAL ANSWER.
    - In 'finalAnswer', write "Socratic Mode: Discover the answer below."
    - In 'explanation', identify the mathematical concept and ask the user 2-3 leading questions that would help them start solving it. Identify potential pitfalls they should watch out for.
    - In 'steps', instead of providing the solution steps, provide 1-3 "Discovery Steps". Each step title should be a guiding question (e.g., "Step 1: What is the first operation?"). The 'math' field should be a hint or a starting formula without the specific values plugged in yet.
    - Be a supportive mentor, not a calculator.
    ` : `
    BONUS: ONLY if a visual diagram (geometry shape, coordinate graph, number line) is STRICTLY NECESSARY to understand a specific step, generate a clean, minimal SVG string for it under 'diagramSvg' within that step. Do NOT generate diagrams unless they provide critical clarity that text cannot. CRITICAL: Diagrams must NOT spoil the final answer or include solution values; they should only represent the problem logic visually.
    `}
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

    const response = await tryModels({ parts }, {
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
    
    CALCULATOR ALLOWED: Determine if a calculator is typically allowed or necessary for this problem (e.g., complex decimals, advanced graphing, trigonometry without special angles). Set 'calculatorAllowed' to true if so, otherwise false.
    
    QUESTION TYPE: You must choose one of the following types:
    - FREE_RESPONSE: The user types their answer. Use this for standard step-by-step math problems.
    - MCQ: Multiple Choice Question. Provide exactly 4 'options'. One must match the final answer.
    - TRUE_FALSE: A question with only two options: "True" and "False". One must be the 'finalAnswer'.
    Set the 'type' field to one of these strings.
    
    CRITICAL: Use LaTeX ($$formula$$) for ALL mathematical expressions, including individual numbers, variables, and equations. This applies to 'question', 'finalAnswer', 'options', and ESPECIALLY the 'title' of each step.
  `;

  try {
    const response = await tryModels({ parts: [{ text: prompt }] }, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["FREE_RESPONSE", "MCQ", "TRUE_FALSE"] },
          calculatorAllowed: { type: Type.BOOLEAN },
          diagramSvg: { type: Type.STRING },
          finalAnswer: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Required if type is MCQ (4 options) or TRUE_FALSE ([\"True\", \"False\"])." },
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
        required: ["question", "finalAnswer", "correctSteps", "calculatorAllowed"]
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

export const inferBestLearningTopic = (text: string, result?: MathResult): string | null => {
  const candidateText = [text, result ? result.parts.map((part) => {
    const stepMath = part.steps?.map((step) => step.math).join(' ') || '';
    return [part.title || '', part.explanation || '', part.finalAnswer || '', stepMath].join(' ');
  }).join(' '): ''].filter(Boolean).join(' ');
  return findBestMatchingTopic(candidateText);
};

export const evaluateStep = async (question: string, expectedMath: string, userMath: string, finalAnswer?: string, socraticMode: boolean = false): Promise<QuizFeedback> => {
  const prompt = `
    The math question is: "${question}"
    ${finalAnswer ? `The FINAL intended answer to the entire question is: "${finalAnswer}"` : ''}
    The expected NEXT STEP expression is: "${expectedMath}"
    
    The user provided: "${userMath}"
    
    Evaluate two things:
    1. Is the user's expression mathematically equivalent to the expected NEXT STEP?
    2. Is the user's expression (or its direct result) already the FINAL intended answer for the entire question?
    
    TONE: Ensure the message matches the linguistic complexity of the topic. Encourage younger students with simpler praise; use technical confirmation for advanced topics.
    
    ${socraticMode ? `
    STRICT SOCRATIC MODE ENABLED:
    - NEVER provide the final answer, even if the user is close.
    - NEVER provide the expected next step.
    - If the user is WRONG: Identify exactly where they tripped up (e.g., "It looks like you subtracted instead of adding in that second term").
    - Ask a leading question that guides them to fix their own mistake.
    - If the user is CORRECT but not finished: Acknowledge their progress and ask "What do you think is the next logical step to get closer to [Goal]?"
    - Use a guiding, encouraging, but firm "tutor" persona.
    ` : `
    IMPORTANT: Under no circumstances should you provide the exact final answer, the expected next step expression, or the complete solution. If the user is wrong, give guidance or a conceptual hint instead of the answer.
    `}
    
    CRITICAL: Use LaTeX ($$formula$$) for ALL mathematical expressions in your feedback 'message' and 'improvement'. This includes individual numbers (e.g. $$5$$), variables (e.g. $$x$$), and formulas.
    
    Provide your evaluation in JSON:
    - isCorrect (boolean): true if it matches the next step OR if it's the final answer.
    - isFinalAnswer (boolean): true ONLY if the user provided the final answer to the entire question.
    - message (string): Feedback for the user. If they reached the final answer, congratulate them.
    - improvement (string): Optional tip.
  `;

  try {
    const response = await tryModels({ parts: [{ text: prompt }] }, {
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

    In Checkpoints, use standard exam-style phrasing. Use LaTeX ($$formula$$) for ALL mathematical expressions, including individual numbers (e.g. $$5$$), variables (e.g. $$x$$), and equations. This applies to the 'topic', 'title', 'question', 'correctAnswer', and 'options' fields. 
    
    For each checkpoint, determine if a calculator is typically allowed or necessary (e.g. complex decimals, advanced graphing, trigonometry). Set 'calculatorAllowed' to true if so, otherwise false.
    
    CHECKPOINT TYPE: For each checkpoint, choose one:
    - FREE_RESPONSE: The student types the answer.
    - MCQ: Provide exactly 4 'options'.
    - TRUE_FALSE: Provide "True" and "False" as 'options'.
    Set 'type' accordingly.
  `;

  try {
    const response = await tryModels({ parts: [{ text: prompt }] }, {
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
                type: { type: Type.STRING, enum: ["FREE_RESPONSE", "MCQ", "TRUE_FALSE"] },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                calculatorAllowed: { type: Type.BOOLEAN },
                options: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["question", "correctAnswer", "explanation", "calculatorAllowed"]
            }
          }
        },
        required: ["description", "outline", "sections", "checkpoints"]
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

export const evaluateLessonAnswer = async (topic: string, question: string, userAnswer: string, correctAnswer: string, socraticMode: boolean = false): Promise<QuizFeedback> => {
  const prompt = `
    A student is taking a lesson on "${topic}".
    Question: "${question}"
    Expected Answer (Reference): "${correctAnswer}"
    Student's Answer: "${userAnswer}"
    
    Evaluate if the student's answer is conceptually correct, even if not phrased exactly like the reference.
    Provide constructive feedback. 
    
    CRITICAL: Use LaTeX ($$formula$$) for ALL mathematical expressions in 'message' and 'improvement'. This includes individual numbers (e.g. $$5$$), variables (e.g. $$x$$), and formulas.
    
    ${socraticMode ? `
    STRICT SOCRATIC MODE ENABLED:
    - NEVER provide the correct answer or solution.
    - If the user is WRONG: Do not just say "Incorrect". Analyze their answer and ask a question that helps them spot their own conceptual gap.
    - Use leading questions (e.g., "If we apply the rule of [X], what happens to [Y]?").
    - Be a supportive but strict mentor who wants the student to discover the answer.
    ` : `
    IMPORTANT: Do not reveal the exact correct answer or solution. If the answer is wrong, offer a hint or explanation that helps the student understand the concept without giving it away.
    `}
  `;

  try {
    const response = await tryModels({ parts: [{ text: prompt }] }, {
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
    const response = await tryModels({ parts: [{ text: prompt }] }, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    });
    return JSON.parse(response.text?.trim() || "[]");
  } catch (error) {
    console.error("Error generating outline:", error);
    return ["Concept Review", "Practical Application", "Problem Solving", "Final Mastery"];
  }
};

export const askLessonClarification = async (topic: string, question: string, context: string, checkpointQuestions?: string[], socraticMode: boolean = false): Promise<string> => {
  const prompt = `
    A student is learning about "${topic}". 
    They just read the following lesson content:
    ---
    ${context}
    ---
    ${checkpointQuestions && checkpointQuestions.length > 0 ? `
    IMPORTANT ANTI-CHEAT RULE:
    The following are upcoming or current checkpoint questions in the student's lesson:
    ${checkpointQuestions.map((q, i) => `${i + 1}. ${q}`).join('\\n')}
    
    If the student's question asks for the answer, solution, or specific steps to ANY of these checkpoint questions, YOU MUST REFUSE TO ANSWER. Call them out playfully for trying to cheat and make them do it themselves, offering only to explain the underlying concept instead without giving away the direct answer to the checkpoint.
    ` : ''}
    
    They have a question or need clarification: "${question}".
    
    ${socraticMode ? `
    STRICT SOCRATIC MODE ENABLED:
    - As a Socratic Tutor, your goal is to NEVER give direct answers to conceptual questions if you can guide the student to the answer instead.
    - Respond to their question with another question that makes them think or look at the lesson content again.
    - Example: Instead of "The area of a circle is pi r squared", say "If you look at the formula for area, which variable represents the distance from the center to the edge?"
    - Keep them on the path of discovery.
    ` : `
    As a helpful tutor, explain it simply (unless refusing due to the anti-cheat rule). Use Markdown.
    Be encouraging and clear. Keep the answer concise (under 150 words).
    `}
    
    CRITICAL: Use LaTeX ($$formula$$) for ALL mathematical expressions in your response. This includes individual numbers (e.g. $$5$$), variables (e.g. $$x$$), and formulas.
  `;

  try {
    const response = await tryModels({ parts: [{ text: prompt }] }, {});
    return response.text?.trim() || "I'm sorry, I'm having trouble connecting to my brain right now. Please try again!";
  } catch (error) {
    console.error("Clarification Error:", error);
    return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again!";
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  // Clean text from LaTeX and Markdown for better speech
  const cleanLaTeX = (str: string) => {
    return str
      .replace(/\\text\{(.*?)\}/g, '$1')
      .replace(/\\mathrm\{(.*?)\}/g, '$1')
      .replace(/\\mathbf\{(.*?)\}/g, '$1')
      .replace(/\\mathit\{(.*?)\}/g, '$1')
      .replace(/\\mathtt\{(.*?)\}/g, '$1')
      .replace(/\\mathsf\{(.*?)\}/g, '$1')
      .replace(/\\frac\{(.*?)\}\{(.*?)\}/g, '$1 divided by $2')
      .replace(/\\sqrt\{(.*?)\}/g, 'square root of $1')
      .replace(/\\sqrt\[(.*?)\]\{(.*?)\}/g, '$1 root of $2')
      // Power operations - check for squared/cubed first
      .replace(/\^\{2\}/g, ' squared ')
      .replace(/\^2/g, ' squared ')
      .replace(/\^\{3\}/g, ' cubed ')
      .replace(/\^3/g, ' cubed ')
      .replace(/\^\{(.*?)\}/g, ' to the power of $1')
      .replace(/\^\\circ/g, ' degrees ')
      .replace(/\^circ/g, ' degrees ')
      .replace(/\^/g, ' to the power of ')
      .replace(/_\{(.*?)\}/g, ' sub $1')
      .replace(/_(.)/g, ' sub $1')
      // Advanced operations
      .replace(/\\sum/g, ' sum ')
      .replace(/\\prod/g, ' product ')
      .replace(/\\int/g, ' integral ')
      .replace(/\\iint/g, ' double integral ')
      .replace(/\\iiint/g, ' triple integral ')
      .replace(/\\oint/g, ' contour integral ')
      .replace(/\\nabla/g, ' del ')
      .replace(/\\partial/g, ' partial derivative of ')
      .replace(/\\lim/g, ' limit ')
      // Trigonometry
      .replace(/\\sin/g, ' sine ')
      .replace(/\\cos/g, ' cosine ')
      .replace(/\\tan/g, ' tangent ')
      .replace(/\\csc/g, ' cosecant ')
      .replace(/\\sec/g, ' secant ')
      .replace(/\\cot/g, ' cotangent ')
      .replace(/\\arcsin/g, ' inverse sine ')
      .replace(/\\arccos/g, ' inverse cosine ')
      .replace(/\\arctan/g, ' inverse tangent ')
      .replace(/\\log/g, ' log ')
      .replace(/\\ln/g, ' natural log ')
      .replace(/\\exp/g, ' exponential ')
      .replace(/\\max/g, ' max ')
      .replace(/\\min/g, ' min ')
      // Math operators
      .replace(/\\pm/g, ' plus or minus ')
      .replace(/\\mp/g, ' minus or plus ')
      .replace(/\\times/g, ' times ')
      .replace(/\\cdot/g, ' dot ')
      .replace(/\\div/g, ' divided by ')
      .replace(/\\approx/g, ' approximately ')
      .replace(/\\neq/g, ' is not equal to ')
      .replace(/\\ne/g, ' is not equal to ')
      .replace(/\\leq/g, ' is less than or equal to ')
      .replace(/\\le/g, ' is less than or equal to ')
      .replace(/\\geq/g, ' is greater than or equal to ')
      .replace(/\\ge/g, ' is greater than or equal to ')
      .replace(/\\equiv/g, ' is equivalent to ')
      .replace(/\\dots/g, ' and so on ')
      .replace(/\\ldots/g, ' and so on ')
      .replace(/\\propto/g, ' is proportional to ')
      .replace(/\\sim/g, ' is similar to ')
      .replace(/\\cong/g, ' is congruent to ')
      .replace(/\\parallel/g, ' is parallel to ')
      .replace(/\\perp/g, ' is perpendicular to ')
      // Logic and Sets
      .replace(/\\subset/g, ' is a subset of ')
      .replace(/\\subseteq/g, ' is a subset of or equal to ')
      .replace(/\\in/g, ' is an element of ')
      .replace(/\\notin/g, ' is not an element of ')
      .replace(/\\forall/g, ' for all ')
      .replace(/\\exists/g, ' there exists ')
      .replace(/\\Rightarrow/g, ' implies ')
      .replace(/\\implies/g, ' implies ')
      .replace(/\\Leftrightarrow/g, ' if and only if ')
      .replace(/\\iff/g, ' if and only if ')
      .replace(/\\to/g, ' approaches ')
      .replace(/\\rightarrow/g, ' approaches ')
      .replace(/\\gets/g, ' is approached from ')
      .replace(/\\leftarrow/g, ' is approached from ')
      .replace(/\\infty/g, ' infinity ')
      .replace(/\\cup/g, ' union ')
      .replace(/\\cap/g, ' intersection ')
      .replace(/\\emptyset/g, ' empty set ')
      .replace(/\\varnothing/g, ' empty set ')
      // Greek alphabet
      .replace(/\\alpha/g, ' alpha ')
      .replace(/\\beta/g, ' beta ')
      .replace(/\\gamma/g, ' gamma ')
      .replace(/\\Gamma/g, ' Gamma ')
      .replace(/\\delta/g, ' delta ')
      .replace(/\\Delta/g, ' Delta ')
      .replace(/\\epsilon/g, ' epsilon ')
      .replace(/\\varepsilon/g, ' epsilon ')
      .replace(/\\zeta/g, ' zeta ')
      .replace(/\\eta/g, ' eta ')
      .replace(/\\theta/g, ' theta ')
      .replace(/\\vartheta/g, ' theta ')
      .replace(/\\Theta/g, ' Theta ')
      .replace(/\\iota/g, ' iota ')
      .replace(/\\kappa/g, ' kappa ')
      .replace(/\\lambda/g, ' lambda ')
      .replace(/\\Lambda/g, ' Lambda ')
      .replace(/\\mu/g, ' mu ')
      .replace(/\\nu/g, ' nu ')
      .replace(/\\xi/g, ' xi ')
      .replace(/\\pi/g, ' pi ')
      .replace(/\\Pi/g, ' Pi ')
      .replace(/\\rho/g, ' rho ')
      .replace(/\\sigma/g, ' sigma ')
      .replace(/\\Sigma/g, ' Sigma ')
      .replace(/\\tau/g, ' tau ')
      .replace(/\\upsilon/g, ' upsilon ')
      .replace(/\\phi/g, ' phi ')
      .replace(/\\varphi/g, ' phi ')
      .replace(/\\Phi/g, ' Phi ')
      .replace(/\\chi/g, ' chi ')
      .replace(/\\psi/g, ' psi ')
      .replace(/\\Psi/g, ' Psi ')
      .replace(/\\omega/g, ' omega ')
      .replace(/\\Omega/g, ' Omega ')
      // Vectors and accents
      .replace(/\\vec\{(.*?)\}/g, 'vector $1')
      .replace(/\\hat\{(.*?)\}/g, '$1 hat')
      .replace(/\\bar\{(.*?)\}/g, '$1 bar')
      .replace(/\\dot\{(.*?)\}/g, '$1 dot')
      .replace(/\\ddot\{(.*?)\}/g, '$1 double dot')
      // Basic math characters
      .replace(/\+/g, ' plus ')
      .replace(/\-/g, ' minus ')
      .replace(/=/g, ' equals ')
      .replace(/</g, ' is less than ')
      .replace(/>/g, ' is greater than ')
      .replace(/%/g, ' percent ')
      .replace(/\|/g, ' given ')
      // Clean up common LaTeX formatting garbage
      .replace(/\\(?:left|right)/g, '')
      .replace(/\\,/g, ' ')
      .replace(/\\;/g, ' ')
      .replace(/\\!/g, '')
      .replace(/\\ /g, ' ')
      .replace(/\\/g, '')
      .replace(/\{/g, '')
      .replace(/\}/g, '')
      .replace(/\$/g, '');
  };

  const cleanText = text
    .replace(/\$\$(.*?)\$\$/g, (_, match) => cleanLaTeX(match))
    .replace(/\$(.*?)\$/g, (_, match) => cleanLaTeX(match))
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[#*`_]/g, '');

  // Helper functions for audio conversion
  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const l16ToWav = (audioBuffer: ArrayBuffer, sampleRate: number, channels: number): ArrayBuffer => {
    const audioData = new Int16Array(audioBuffer);
    const wavBuffer = new ArrayBuffer(44 + audioData.length * 2);
    const view = new DataView(wavBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + audioData.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * 2, true);
    view.setUint16(32, channels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, audioData.length * 2, true);

    // Audio data
    for (let i = 0; i < audioData.length; i++) {
      view.setInt16(44 + i * 2, audioData[i], true);
    }

    return wavBuffer;
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: { parts: [{ text: cleanText }] },
      config: {
        responseModalities: ["audio"],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: {} }
        }
      }
    });

    // Return the audio data as base64
    const audioPart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    if (audioPart?.inlineData) {
      // Convert L16 to WAV format if needed
      const mimeType = audioPart.inlineData.mimeType;
      if (mimeType?.toLowerCase().startsWith('audio/l16')) {
        // Convert L16 to WAV
        const audioBuffer = base64ToArrayBuffer(audioPart.inlineData.data);
        const wavData = l16ToWav(audioBuffer, 24000, 1); // 24kHz, mono
        const wavBase64 = arrayBufferToBase64(wavData);
        return `data:audio/wav;base64,${wavBase64}`;
      } else {
        return `data:${mimeType};base64,${audioPart.inlineData.data}`;
      }
    }
    
    throw new Error("No audio generated");
  } catch (error) {
    console.warn("Gemini TTS failed, falling back to browser speech synthesis:", error);
    // Fallback to browser speech synthesis
    throw new Error("USE_BROWSER_SYNTHESIS");
  }
};
