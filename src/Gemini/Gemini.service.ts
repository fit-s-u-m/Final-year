import { Injectable } from "@nestjs/common";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

@Injectable()
export class GeminiService {
  async changeTextToCommand(text: string) {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: text,
      config: {
        systemInstruction: `
          You are an Amharic to English command converter. Your task is to convert Amharic text into a structured English command in JSON format.

        ### Key Definitions:
        - object: The target of the action. This can be a person, place, or thing.
        - action: The verb or command being performed on the object.

        ### Formatting Rules:
        1.  **JSON Output Only:**
            * You MUST respond with valid JSON. Do not include any other text or explanations.
        2.  **Predefined Keys:**
            * Use the predefined keys: "object" and "action".
        3.  **Free Format Keys:**
            * Any additional information found in the text that does not match a predefined key should be included as a separate key using camelCase formatting.
        4.  **Amharic Language Handling:**
            * If any names (person names, places) appear in Amharic, retain them in Amharic within the JSON and do not translate them into English.
        5.  **Error Handling:**
            * If the input text is ambiguous or does not contain a clear command, return an empty JSON object {}.
            * If a property value is null or doesn't exist return empty string.
        6.  **English output:**
            * The action and any free format keys must be in english. The object value can be in amharic.

        ### JSON Output Structure:
        {
          "object": string,
          "action": string,
          "additionalKey": string
        }
        use this format for phone numbers "number": "0912345678"

        ### Examples:
        Amharic Input: ለአበበ ደውል
        JSON Output: { "object": "አበበ", "action": "call" }

        Amharic Input: መብራቱን አጥፋ
        JSON Output: { "object": "መብራት", "action": "turn off" }

        Amharic Input: ወደ ገበያ እንሂድ
        JSON Output: { "object": "ገበያ", "action": "go to" }

        Amharic Input: 
        JSON Output: {},`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            'object': {
              type: Type.STRING,
              description: 'Object of the command that can be passed to the action function',
            },
            'action': {
              type: Type.STRING,
              description: 'Action of the command',
              nullable: false,
            },
          },
          required: ['action'],
        },
      },
    });
    return response
  }
  async matchContact(name: string, contacts: string[]) {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `
          ### Input:
          Name: "${name}"
          Contacts: ${JSON.stringify(contacts)}

          Output:
       `,
      config: {
        responseMimeType: 'text/plain',
        systemInstruction: `
            You are a multilingual contact matcher and translator.

            ### Instructions:
            1. Detect if the input name is in Amharic or English.
            2. Translate it to the opposite language (Amharic ↔ English).
            3. Perform fuzzy matching between both the original and translated name against the contact list.
            4. Match even if the names have minor spelling errors or variations.
            5. Return the best matching contact name as it appears in the list.
            6. If no good match is found, return an empty string.
            7. Output only the matched contact name.

            ### Example:
            Input Name: "አበበ"
            Contacts: ["Abe Tesfaye", "Abebe", "ተስፋዬ"]
            Output: "Abebe"

            Input Name: "Abebe"
            Contacts: ["Abeba", "ተስፋዬ", "አበበ", "Abebe Tesfaye"]
            Output: "Abebe Tesfaye"

            Input Name: "mom"
            Contacts: ["mamy", "ተስፋዬ", "አበበ", "dad"]
            Output: "mamy"

            Input Name: "እናቱ"
            Contacts: ["mamy", "ተስፋዬ", "አበበ", "dad"]
            Output: "mamy"
        
        `
      },
    });
    return response
  }

}
