import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, DrugAnalysis, SafetyStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Helper: OpenFDA Fetcher ---
async function fetchOpenFdaData(genericName: string): Promise<string> {
  if (!genericName || genericName === "Unknown") return "";
  
  try {
    // Search by generic name
    const query = encodeURIComponent(`openfda.generic_name:"${genericName}"`);
    const response = await fetch(`https://api.fda.gov/drug/label.json?search=${query}&limit=1`);
    
    if (!response.ok) return "";
    
    const data = await response.json();
    const result = data.results?.[0];

    if (!result) return "";

    // Extract key safety sections
    const boxedWarning = result.boxed_warning ? `BOXED WARNING: ${result.boxed_warning.join(' ')}` : '';
    const contraindications = result.contraindications ? `CONTRAINDICATIONS: ${result.contraindications.join(' ')}` : '';
    const warnings = result.warnings ? `WARNINGS: ${result.warnings.join(' ')}` : '';
    
    return [boxedWarning, contraindications, warnings].filter(Boolean).join('\n\n').substring(0, 5000); // Limit text length
  } catch (e) {
    console.warn("OpenFDA fetch failed", e);
    return "";
  }
}

// --- Schemas ---

// Stage 1: Identification
const identitySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    brandName: { type: Type.STRING, description: "Commercial name of the drug" },
    activeIngredient: { type: Type.STRING, description: "Generic chemical name (e.g. Paracetamol, Ibuprofen)" },
    strength: { type: Type.STRING, description: "Dosage strength if visible (e.g. 500mg)" }
  },
  required: ["brandName", "activeIngredient"]
};

// Stage 3: Safety Analysis
const safetySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    purpose: { type: Type.STRING, description: "What this drug treats" },
    status: { 
      type: Type.STRING, 
      enum: ["SAFE", "CAUTION", "DANGER", "UNKNOWN"],
      description: "Safety verdict based on profile" 
    },
    headline: { type: Type.STRING, description: "Short, punchy verdict (e.g., 'Do Not Take!', 'Safe')" },
    reasoning: { type: Type.STRING, description: "Clinical explanation referencing specific profile matches" },
    simpleExplanation: { type: Type.STRING, description: "A reassuring, jargon-free explanation (max 2 sentences) as if spoken by a friendly family doctor." },
    interactionScore: { type: Type.INTEGER, description: "Risk level 0-100, where 0 is safe and 100 is lethal." },
    sideEffects: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top 3 side effects" },
    safeAlternatives: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "List 1-2 generic alternatives if verdict is DANGER/CAUTION. Empty if SAFE." 
    },
    contraindicationsDetected: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of user conditions that conflict" }
  },
  required: ["purpose", "status", "headline", "reasoning", "simpleExplanation", "sideEffects"]
};

async function runAnalysis(drugName: string, activeIngredient: string, strength: string | undefined, userProfile: UserProfile): Promise<DrugAnalysis> {
    // --- STEP 2: DATA (OpenFDA) ---
    // Fetch official government data
    const fdaData = await fetchOpenFdaData(activeIngredient);
    const hasFdaData = fdaData.length > 0;

    // --- STEP 3: REASONING (Analysis) ---
    const userContext = `
      USER PROFILE:
      - Age: ${userProfile.age}
      - Gender: ${userProfile.gender}
      - Conditions: ${userProfile.conditions.join(", ")}
      - Allergies: ${userProfile.allergies.join(", ")}
      - Current Meds: ${userProfile.currentMeds.join(", ")}
    `;

    const prompt = `
      You are a specialized Medical Safety AI.
      
      Task: Analyze safety for the user.
      
      DRUG: ${drugName} (${activeIngredient})
      ${strength ? `Strength: ${strength}` : ''}
      
      OFFICIAL FDA LABEL DATA (Source of Truth for Risks):
      ${hasFdaData ? fdaData : "No official FDA data found, rely on internal medical knowledge."}
      
      ${userContext}
      
      INSTRUCTIONS:
      1. Cross-reference User Conditions with FDA Contraindications.
      2. Check for Drug-Drug interactions with Current Meds.
      3. Check for Allergies.
      4. Check for Age/Gender specific risks (e.g. pregnancy categories if applicable).
      5. Alternatives Logic:
         - If Verdict is DANGER or CAUTION: Suggest 1-2 generic alternatives that are safer for this specific profile.
         - If Verdict is SAFE: Return an empty array.
      6. Verdict:
         - DANGER: Direct contraindication or allergy (e.g., NSAID + High BP/Kidney disease).
         - CAUTION: Potential interaction or age/gender warning.
         - SAFE: No known conflicts.
      7. Interaction Score:
         - Calculate a risk score (0-100). High BP + NSAID = ~75.
      8. Simple Explanation:
         - Write a "Explain Like a Doctor" version. Warm, personal, non-technical.
    `;

    const safetyResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: safetySchema,
        temperature: 0.1 // Very low for strict reasoning
      }
    });

    const safetyData = JSON.parse(safetyResponse.text || "{}");

    return {
      drugName,
      activeIngredient,
      purpose: safetyData.purpose,
      status: safetyData.status as SafetyStatus,
      headline: safetyData.headline,
      reasoning: safetyData.reasoning,
      simpleExplanation: safetyData.simpleExplanation,
      interactionScore: safetyData.interactionScore || 0,
      sideEffects: safetyData.sideEffects,
      safeAlternatives: safetyData.safeAlternatives || [],
      timestamp: Date.now(),
      fdaSource: hasFdaData,
      contraindicationsDetected: safetyData.contraindicationsDetected || []
    };
}

export const analyzeDrugText = async (
  text: string,
  userProfile: UserProfile
): Promise<DrugAnalysis> => {
  try {
      // Direct analysis assuming text is the drug name
      // We do a quick check to see if we can identify generic name from it
      const idResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [{ text: `Extract the brand name, active ingredient, and strength from this search query: "${text}". If it's just a generic name, use it for both.` }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: identitySchema
        }
      });
      
      const idData = JSON.parse(idResponse.text || "{}");
      return runAnalysis(idData.brandName || text, idData.activeIngredient || text, idData.strength, userProfile);

  } catch (error) {
    console.error("Text Analysis Failed:", error);
    return {
        drugName: text,
        activeIngredient: "Unknown",
        purpose: "N/A",
        status: SafetyStatus.UNKNOWN,
        headline: "Analysis Failed",
        reasoning: "Could not process the text input.",
        sideEffects: [],
        timestamp: Date.now()
    };
  }
};

export const analyzeDrugImage = async (
  base64Image: string,
  userProfile: UserProfile
): Promise<DrugAnalysis> => {
  
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  try {
    // --- STEP 1: VISION (Identify) ---
    // We use a high temperature for creativity in reading, but strict schema for output
    const idResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: "Identify the drug brand name and active ingredient strictly from the packaging. If illegible, mark as Unknown." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: identitySchema
      }
    });

    const idData = JSON.parse(idResponse.text || "{}");
    const drugName = idData.brandName || "Unknown Drug";
    const activeIngredient = idData.activeIngredient || "Unknown";

    if (activeIngredient === "Unknown") {
      throw new Error("Could not identify drug");
    }

    return runAnalysis(drugName, activeIngredient, idData.strength, userProfile);

  } catch (error) {
    console.error("Pipeline Failed:", error);
    return {
      drugName: "Scan Failed",
      activeIngredient: "Unknown",
      purpose: "N/A",
      status: SafetyStatus.UNKNOWN,
      headline: "Could Not Identify",
      reasoning: "Please try scanning again with better lighting and a clear view of the text.",
      sideEffects: [],
      timestamp: Date.now()
    };
  }
};