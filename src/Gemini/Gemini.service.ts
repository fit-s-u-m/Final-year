import { Injectable, Logger } from "@nestjs/common";
import { GenerateContentResponse, GoogleGenAI, Type } from "@google/genai";
import { ok, err, ResultAsync, fromPromise } from 'neverthrow';
import { matchContactsErrType, text2CommandErrType } from "interfaces/types";
import { getDate, getHours, getMinutes, getMonth, getYear } from "date-fns";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  async changeTextToCommand(text: string): Promise<ResultAsync<GenerateContentResponse, text2CommandErrType>> {
    const now = Date.now()
    const dateMonth = getMonth(now)
    const dateDate = getDate(now)
    const date = `${getDate(now)}:${getMonth(now) + 1}:${getYear(now)}`
    const time = `${getHours(now)}:${getMinutes(now)}`
    console.log("Date:", date)
    const response = await fromPromise(ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `
          Amharic Input: "${text}"
          Current Date: "${date}"
          Time(EAT):"${time}"
          JSON Output:
      `,
      config: {
        systemInstruction: `
        You are an Amharic to English command converter.Your task is to convert Amharic text into a structured English command in JSON format.

        Key Definitions:
object: The target of the action.This can be a person, place, or thing.

  action: The verb or command being performed on the object.

        Formatting Rules:
        JSON Output Only:
        You MUST respond with valid JSON.Do not include any other text or explanations.

        Predefined Keys:
        Use the predefined keys: "object" and "action".

        Free Format Keys:
        Any additional information found in the text that does not match a predefined key should be included as a separate key using camelCase formatting.

  Amharic Language Handling:
    If any names (person names, places) appear in Amharic, retain them in Amharic within the JSON and do not translate them into English.

        Error Handling:
        If the input text is ambiguous or does not contain a clear command, return an empty JSON object { }.
        If a property value is null or doesn't exist, return empty string.

        English Output:
        The action and any free format keys must be in English.The object value can be in Amharic.

        Special Handling:
        If the input includes "call" followed by a set of numbers:
        Format the number to match 0912345678 format.
        If the number starts with "9" or is missing "09", automatically prepend "0" to make it "09xxxxxxx".
        make this in the object key
        the input might be mistaken and send 'አለር' to mean 'አላርም' so convert it to set alarm

        Time Normalization:
        If the object is a time expression(e.g., setting an set appointment or set alarm), convert it into this normalized format:
HH: MM: DD: MM: YYYY
 (Use 24-hour format with leading zeroes for hour, minute, day, and month.)

          Things to consider while time normalization
            - Default date: If no date (year, month, day) is provided in the Amharic input, use the day, month, and year derived from the "Current Date" provided in the input (which is in the format DD:MM:YYYY).
            - Current time context: The current time in Ethiopian time (EAT) is provided as time in the input. Use this as a reference for interpreting relative time expressions like "አሁን" (now), "በቅርቡ" (soon), or when the Amharic input only provides a time of day (e.g., "ጠዋት").
            - use ethiopian time zone
          - **Ethiopian Time Interpretation:**

        Room Location Normalization:
        When the input involves a light - related command, extract the room location from the voice and normalize it to one of the following values:
        if it is said ሁሉም -> means all room in the location

        "bed room"
        "living room"(normalize inputs like "salon" or "ሳሎን" to this)
        "bath room"(normalize inputs like "toilet" to this)

        Include the room as a separate field called "location" in camelCase.

        If the input text is exactly or contains "abe" or "selam abe"(in English or Amharic like "አቤ" or "ሰላም አቤ"):
        Set "action" to "wakeword" and "object" to an empty string.
        Ignore any other parts of the text.
        

Examples:
        Amharic Input: ለአበበ ደውል
        JSON Output: { "object": "አበበ", "action": "call" }

        Amharic Input: መብራቱን አጥፋ
        JSON Output: { "object": "መብራት", "action": "turn off" }

        Amharic Input: call 12345678
        JSON Output: { "object": "0912345678", "action": "call" }

        Amharic Input: ለ912345678 ደውል
        JSON Output: { "object": "0912345678", "action": "call" }

        Amharic Input: አቤ
        JSON Output: { "object": "", "action": "wakeword" }

        Amharic Input: selam abe
        JSON Output: { "object": "", "action": "wakeword" }

        Amharic Input: ሰላም አቤ
        JSON Output: { "object": "", "action": "wakeword" },

        Amharic Input: መብራቱን ሳሎን አብራ
        JSON Output: { "object": "light", "action": "turn on", "location": "living room" }
        Amharic Input: መኝታ መብራትን አጥፋ
        JSON Output: { "object": "light", "action": "turn off", "location": "bed room" }

        Amharic Input: መታጠቢያ ቤት መብራትን አጥፋ
        JSON Output: { "object": "light", "action": "turn off", "location": "bath room" }

        Amharic Input:  ሸንት ቤት መብራትን አጥፋ
        JSON Output: { "object": "light", "action": "turn off", "location": "bath room" }

        Amharic Input:  ሁሉንም መብራት አጥፋ
        JSON Output: { "object": "light", "action": "turn off", "location": "all" }

        Amharic Input: ሁሉንም መብራት አብራ
        JSON Output: { "object": "light", "action": "turn on", "location": "all" }

        Amharic Input: በርዝጋ
        JSON Output: { "object": "door", "action": "close"}
        Amharic Input: በር ክፈት
        JSON Output: { "object": "door", "action": "open"}


        if you find this action try to match it exactly
                call
                turn on
                turn off
                open
                close
                wakework
                set alarm
                set appointment 
                remind

        Amharic Input: ለእሁድ ማታ 3 ሰዓት 30 ደቂቃ ያስታውስ
        JSON Output: { "object": "21:30:18:05:2025", "action": "remind" }

        Amharic Input: set alarm for 12 in the morning, Ethiopian time, tomorrow
        JSON Output: { "object": "06:00:${dateDate}:${dateMonth}:2025", "action": "set alarm" }

        Amharic Input: ለማታ አስራ ሁለት ሰአት አላርም ሙላ
        JSON Output: { "object": "18:00:${dateDate}:${dateMonth}:2025", "action": "set alarm" }

        Amharic Input: set appointment for 10am today
        JSON Output: { "object": "16:00:18:05:2025", "action": "set appointment" }

        Amharic Input: set reminder for 5pm 12 / 12
        JSON Output: { "object": "23:00:12:12:2025", "action": "remind" }
        `,

        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            'object': {
              type: Type.STRING,
              description: 'Object of the command that can be passed to the action function',
            },
            'location': {
              type: Type.STRING,
              description: 'Location of the action taken place',
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
      this.logger.error(response.error)
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
            2. Translate it to the opposite language(Amharic ↔ English).
            3. Perform fuzzy matching between both the original and translated name against the contact list.
            4. Match even if the names have minor spelling errors or variations but if the searched name makes a name and trying to sear.
            5. ** However, if the input name and the contact name are both actual personal names(e.g., recognized Ethiopian or international names) and they are different names, do NOT match them — even if they differ by only one letter.**
  - Example: "Abebe" and "Abeba" are different Ethiopian names.Do NOT match them.
            6. Return the best matching contact name as it appears in the list.

            ### Example:
            Input Name: "አበበ"
Contacts: ["Abe Tesfaye", "Abebe", "ተስፋዬ"]
Output: "Abebe"

            Input Name: "Abebe"
Contacts: ["Abeba", "ተስፋዬ", "አበበ", "Tesfaye"]
Output: "አበበ"(Do NOT match "Abeba" even though it's close.)

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
      // logger({ message: response.error, desc: "Error at Matching name to a list of contact", type: "error" })
      this.logger.error(response.error)
      const error: matchContactsErrType = "matchName2ContactsGeminiError"
      return err(error)
    }

    return ok(response.value)
  }

}
