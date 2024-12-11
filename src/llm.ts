import OpenAI from "openai";  

interface Paragraph {  
  sentences: Sentence[];  
  speaker: number;  
  num_words: number;  
  start: number;  
  end: number;  
}  

interface Sentence {  
  text: string;  
  start: number;  
  end: number;  
}  

interface AnalysisResult {  
  transcript: string;  
  violationCheck: "Violation"; // Restricting to only "Violation" because we only need violated sentences  
  start: number;  
  end: number;  
}  

const openai = new OpenAI({  
  apiKey: process.env.OPENAI_API_KEY,  
});  

// Function to analyze transcripts in paragraphs  
export async function analyzeTranscriptsInChunks(paragraphs: Paragraph[], legalRules: string[]): Promise<AnalysisResult[]> {  
  const results: AnalysisResult[] = [];  

  for (const paragraph of paragraphs) {  
    const { sentences } = paragraph;  

    if (sentences.length === 0) continue; // Skip if no sentences  

    for (const sentence of sentences) {  
      const { text } = sentence;  

      // Create a focused prompt  
      const prompt = `  
      You are a legal assistant specialized in Czech law. Please analyze the following statement, written in Czech, for potential legal violations.  
      **Statement:** "${text}"  
      **Legal Rules to Consider (also in Czech):** ${legalRules.join(", ")}  
      Respond only with "Violation" if the statement violates any legal rules and explain briefly why the sentence is violated. Do not provide any additional information.  
  `;   

      try {  
        const response = await openai.chat.completions.create({  
          model: "gpt-4",  
          messages: [  
            { role: "system", content: "You are a legal assistant." },  
            { role: "user", content: prompt },  
          ],  
        });  

        // Validate the response structure  
        if (response.choices && response.choices.length > 0) {  
          const violationCheckResponse = response.choices[0]?.message?.content?.trim() || "";  
          console.log("Violation Check Response:", violationCheckResponse);  

          // Check if the response indicates a violation  
          if (violationCheckResponse.startsWith("Violation")) {  
            results.push({  
              transcript: text,  
              violationCheck: "Violation",  // Only store violations  
              start: paragraph.start,  
              end: paragraph.end,  
            });  
          }  
        } else {  
          console.error("No choices returned in the response for sentence:", text);  
        }  
      } catch (error) {  
        console.error("Error checking violation for sentence:", text, "Error:", error);  
      }  
    }  
  }  

  return results; // This will only contain violations  
}