
import { GoogleGenAI, Type, FunctionDeclaration, Schema } from "@google/genai";
import { UploadedFile, AnalysisResult, CalendarEvent, AnalysisGoal } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const createCalendarEventFunctionDeclaration: FunctionDeclaration = {
  name: 'createCalendarEvent',
  parameters: {
    type: Type.OBJECT,
    description: 'Creates a calendar event with a title, description, date, and time.',
    properties: {
      title: {
        type: Type.STRING,
        description: 'The title of the calendar event.',
      },
      description: {
        type: Type.STRING,
        description: 'A detailed description of the event.',
      },
      date: {
        type: Type.STRING,
        description: 'The date of the event in YYYY-MM-DD format.',
      },
      time: {
        type: Type.STRING,
        description: 'The time of the event in HH:MM format (24-hour).',
      },
    },
    required: ['title', 'description', 'date', 'time'],
  },
};

const getPromptForGoal = (goal: AnalysisGoal, fileContents: string): string => {
    const commonInstructions = `
        You are an expert assistant. Analyze the provided file contents and generate a structured JSON response.
        The JSON object must have three keys: "title" (a string), "sections" (an array of objects), and "nextSteps" (an array of strings).
        Each object in the "sections" array must have a "title" (a string) and "content" (an array of strings).
        For content that is a paragraph, return it as a single-element array. For lists, return each item as a separate string in the array.
    `;

    const prompts: Record<AnalysisGoal, string> = {
        'general-organization': `
            ${commonInstructions}
            Your goal is to provide a general organization plan.
            - "title": A suitable title, like "File Organization Plan".
            - "sections": Create two sections. The first, titled "File Summary", should summarize the content of all files. The second, titled "Suggested Organization", should propose a logical folder structure.
            - "nextSteps": List actionable follow-up tasks based on the file content.
        `,
        'project-kickstart': `
            ${commonInstructions}
            Your goal is to kickstart a new project from the provided files.
            - "title": A suitable project title, like "Project Kickstart: [Project Name]".
            - "sections": Create three sections:
                1. "Project Summary": A concise overview of the project's purpose and goals.
                2. "Proposed Architecture & Stack": If code is present, suggest a technical stack and architecture. If not, suggest a high-level plan.
                3. "Initial Feature Roadmap": A high-level roadmap of features to build.
            - "nextSteps": Create a detailed task list for the initial project setup and first development sprint.
        `,
        'code-review': `
            ${commonInstructions}
            Your goal is to perform a detailed code review.
            - "title": A title for the review, like "Code Review for [Project/File Name]".
            - "sections": Create three sections:
                1. "Functionality Overview": Describe what the code does, its language, and main functionalities.
                2. "Quality Analysis & Potential Bugs": Identify code smells, potential bugs, and areas that don't follow best practices. Be specific.
                3. "Refactoring & Improvement Suggestions": Provide concrete suggestions for improving the code's structure, readability, and performance.
            - "nextSteps": List specific, actionable tasks for the developer to address the review findings.
        `,
        'meeting-summary': `
            ${commonInstructions}
            Your goal is to summarize meeting notes or transcripts.
            - "title": A title for the summary, like "Meeting Summary: [Meeting Topic]".
            - "sections": Create three sections:
                1. "Key Discussion Points": Summarize the main topics that were discussed.
                2. "Decisions & Outcomes": List all the concrete decisions that were made during the meeting.
                3. "Action Items": List the action items, specifying who is responsible if the information is available.
            - "nextSteps": Formulate tasks for scheduling follow-ups, sending summary emails, or acting on the decisions made.
        `,
    };
    return prompts[goal] + `\n\nFile Contents:\n${fileContents}`;
};

const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        sections: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    content: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                },
                required: ['title', 'content']
            }
        },
        nextSteps: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    },
    required: ['title', 'sections', 'nextSteps']
};


export async function analyzeFiles(files: UploadedFile[], goal: AnalysisGoal): Promise<AnalysisResult> {
    const fileContents = files.map(file => `--- FILE: ${file.name} ---\n\n${file.content}`).join('\n\n');
    const prompt = getPromptForGoal(goal, fileContents);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result as AnalysisResult;

    } catch (error) {
        console.error("Error analyzing files with Gemini:", error);
        throw new Error("Failed to analyze files. The model may have returned an unexpected format. Please check the console.");
    }
}

export async function generateCalendarEvents(nextSteps: string[]): Promise<CalendarEvent[]> {
    if (nextSteps.length === 0) {
        return [];
    }

    const nextStepsText = nextSteps.join('\n- ');
    const prompt = `
        Based on the following to-do list, create calendar events for any items that have a specific date, deadline, or can be reasonably scheduled. If no specific date is mentioned for an item, do not create an event for it.

        To-do list:
        - ${nextStepsText}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                tools: [{ functionDeclarations: [createCalendarEventFunctionDeclaration] }],
            },
        });

        if (!response.functionCalls || response.functionCalls.length === 0) {
            return [];
        }

        const events: CalendarEvent[] = response.functionCalls.map(fc => {
            return {
                title: fc.args.title,
                description: fc.args.description,
                date: fc.args.date,
                time: fc.args.time,
            } as CalendarEvent;
        });

        return events;

    } catch (error) {
        console.error("Error generating calendar events with Gemini:", error);
        throw new Error("Failed to generate calendar events. Please check the console for details.");
    }
}
