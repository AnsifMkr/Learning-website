require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const prompt = "Please write a simple quiz JSON: {\"questions\":[{\"question\":\"test\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"correctAnswer\":\"a\"}]}";

(async () => {
  const ai = new GoogleGenAI({});
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    console.log("Raw Response:");
    console.log(response);

    const text = response.text;
    console.log("Extracted text:");
    console.log(text);
  } catch (error) {
    console.error("API error:", error);
  }
})();
