
import { GoogleGenAI, Type } from "@google/genai";
import { APIExtractionResult, Sex } from "../types";

// Always use a named parameter for apiKey and obtain it exclusively from process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractStudentData = async (text: string): Promise<APIExtractionResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract student registration details from this text: "${text}". 
      Current Date context: ${new Date().toLocaleDateString()}.
      If fields are missing, leave them null.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studentId: { type: Type.STRING, description: "Student's identification number" },
            name: { type: Type.STRING, description: "Full name of the student" },
            sex: { type: Type.STRING, enum: Object.values(Sex), description: "Gender identity" },
            course: { type: Type.STRING, description: "Name of the course/class" },
            date: { type: Type.STRING, description: "Date of registration in YYYY-MM-DD format" },
            time: { type: Type.STRING, description: "Time of registration in HH:mm format" }
          },
          propertyOrdering: ["studentId", "name", "sex", "course", "date", "time"]
        }
      }
    });

    // Accessing text as a property on the response object.
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};
