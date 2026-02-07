
import { GoogleGenAI } from "@google/genai";

export const getPipelineInsights = async (pipelineState: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-3-flash-preview';
  
  const prompt = `
    Analyze this current Data Pipeline state and provide 3 actionable insights or observations as a Senior Data Engineer.
    Keep it concise and technical.
    
    Current Tasks State: ${JSON.stringify(pipelineState.tasks.map((t: any) => ({ name: t.name, status: t.status })))}
    Latest Logs: ${JSON.stringify(pipelineState.logs.slice(-5))}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return "Unable to generate insights at this time. Check your pipeline connectivity.";
  }
};
