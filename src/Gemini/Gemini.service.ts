import { Injectable } from "@nestjs/common";
import { GenerateContentResponse, GoogleGenAI, Type } from "@google/genai";
import { ok, err, ResultAsync, fromPromise } from 'neverthrow';
import { logger } from "util/logger";
import { matchContactsErrType, text2CommandErrType } from "interfaces/types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

@Injectable()
export class GeminiService {
  async changeTextToCommand(text: string): Promise<ResultAsync<GenerateContentResponse, text2CommandErrType>> {
    const response = await fromPromise(ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `
          Amharic Input: "${text}"
          JSON Output:
       `,
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
          "other": string
        }
        if you found call and it's followed by number try to match it with 0912345678 this pattern may be people don't mention 09 this is the object if the action is call followed by a set of numbers
        use this format for phone numbers "number": "0912345678" put it as a object

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
            'other': {
              type: Type.STRING,
              description: 'Other things you have got',
              nullable: true,
            },
          },
          required: ['action', 'object'],
        },
      },
    }), e => e);
    if (response.isErr()) {
      logger({ message: response.error, desc: "Error in gemini trying to change text to command", type: "error" })
      const error: text2CommandErrType = "Text2CommandGeminiError"
      return err(error)
    }
    return ok(response.value)
  }
  async matchContact(name: string, contacts: string[]): Promise<ResultAsync<GenerateContentResponse, matchContactsErrType>> {
    const response = await fromPromise(ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `
          ### Input:
          Input Name: "${name}"
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
            4. Match even if the names have minor spelling errors or variations but if the searched name makes a name and trying to sear .
            5. **However, if the input name and the contact name are both actual personal names (e.g., recognized Ethiopian or international names) and they are different names, do NOT match them — even if they differ by only one letter.**
                - Example: "Abebe" and "Abeba" are different Ethiopian names. Do NOT match them.
            6. Return the best matching contact name as it appears in the list.
            7. If no good match is found, return an empty string.
            8. Output only the matched contact name.
            9. Only apply fuzzy matching when the names are not actual distinct personal names.

            ### Example:
            Input Name: "አበበ"
            Contacts: ["Abe Tesfaye", "Abebe", "ተስፋዬ"]
            Output: "Abebe"

            Input Name: "Abebe"
            Contacts: ["Abeba", "ተስፋዬ", "አበበ", "Tesfaye"]
            Output: "አበበ"  (Do NOT match "Abeba" even though it's close.)

            Input Name: "mom"
            Contacts: ["mamy", "ተስፋዬ", "አበበ", "dad"]
            Output: "mamy"

            Input Name: "እናቱ"
            Contacts: ["mamy", "ተስፋዬ", "አበበ", "dad"]
            Output: "mamy"
        
        `
      },
    }), e => e);
    if (response.isErr()) {
      logger({ message: response.error, desc: "Error at Matching name to a list of contact", type: "error" })
      const error: matchContactsErrType = "matchName2ContactsGeminiError"
      return err(error)
    }

    return ok(response.value)
  }

}
