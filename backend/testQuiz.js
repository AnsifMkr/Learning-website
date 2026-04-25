require('dotenv').config();
const mongoose = require('mongoose');
const fetch = require('node-fetch') || global.fetch;

async function test() {
  const prompt = `
You are an expert educational AI. 
Create 5 multiple-choice questions (with 4 options each, one correct) based strictly on this distribution:
- Questions 1, 2, 3: Core comprehension directly from the lesson content provided below.
- Question 4: A practical, real-world scenario/application question enforcing critical thinking based on the lesson's concepts.
- Question 5: An "Out-of-Syllabus" or advanced stretch question that tests external industry knowledge highly related to the topic of the lesson, but not explicitly stated in the text.

Return strictly a JSON object with this shape:
{
  "questions": [
    {
      "question": "...",
      "options": ["opt1", "opt2", "opt3", "opt4"],
      "correctAnswer": "opt2"
    }
  ]
}

Lesson content:
React is a declarative, efficient, and flexible JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called components.
`;

  console.log("Fetching from Gemini...");
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) {
    const errData = await response.text();
    throw new Error(`Gemini API Error: ${errData}`);
  }

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
  
  const text = data.candidates[0].content.parts[0].text;
  const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  console.log("CLEANED TEXT:", cleanedText);
  const parsed = JSON.parse(cleanedText);
  console.log("Successfully parsed JSON!", parsed);
}

test().catch(console.error);
