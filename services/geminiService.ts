import { GoogleGenAI } from "@google/genai";
import { Expense, Category } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateFinancialInsights = async (
  expenses: Expense[],
  categories: Category[],
  currency: string
): Promise<string> => {
  try {
    const ai = getAIClient();
    
    // Prepare a summary to minimize token usage and protect privacy (no raw PII)
    const categoryTotals = expenses.reduce((acc, curr) => {
      const cat = categories.find(c => c.id === curr.categoryId)?.name || 'Unknown';
      acc[cat] = (acc[cat] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    const prompt = `
      Act as a financial advisor. Here is a monthly expense summary:
      Total Spent: ${currency}${totalSpent.toFixed(2)}
      Breakdown by Category:
      ${Object.entries(categoryTotals).map(([cat, amount]) => `- ${cat}: ${currency}${amount.toFixed(2)}`).join('\n')}

      Please provide:
      1. A brief 2-sentence analysis of the spending habits.
      2. Three actionable bullet points to save money based on these specific categories.
      3. A motivating closing sentence.
      Keep the tone professional yet encouraging.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't generate insights. Please ensure your API key is valid and try again.";
  }
};
