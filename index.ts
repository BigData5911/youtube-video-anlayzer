import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
dotenv.config();

import { processVideo } from "./src/deepgram.helpers";
import { extractLegalRules } from "./src/article.helper";
import { analyzeTranscriptsInChunks } from "./src/llm";

async function main(videoUrl: string, articleUrl: string): Promise<void> {
  try {
    const { paragraphs } = await processVideo(videoUrl);
    console.log("All videos processed successfully!");

    const extractedRules = await extractLegalRules(articleUrl);
    console.log("Extracted Legal Rules:", extractedRules);
    await analyzeTranscriptsInChunks(paragraphs, extractedRules);

    const analysisResults = await analyzeTranscriptsInChunks(paragraphs, extractedRules);
    console.log("Analysis Results:", analysisResults);
    // Save results to JSON file
    const outputPath = path.join(__dirname, "data", "violated_paragraphs.json");
    await fs.promises.writeFile(outputPath, JSON.stringify(analysisResults, null, 2));

    console.log(`Analysis results saved to ${outputPath}`);

  } catch (error) {
    console.error("Error in main process:", error);
  }
}

const videoUrl = "https://www.youtube.com/watch?v=nW6JEbEG7c4";
const articleUrl = "https://www.cnb.cz/cs/dohled-financni-trh/legislativni-zakladna/stanoviska-k-regulaci-financniho-trhu/RS2018-08";

main(videoUrl, articleUrl);