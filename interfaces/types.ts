export type logType = {
	desc: string,
	message: any,
	type: "error" | "warning" | "success" | "neutral" | "debug"
}
export type s2tErrType = "Speech2TextError"
export type t2sErrType = "Text2SpeechError" | "TextNotCorrectFormatError" | "EmptyStreamError"

export type text2CommandErrType = "Text2CommandGeminiError"
export type matchContactsErrType = "matchName2ContactsGeminiError"
