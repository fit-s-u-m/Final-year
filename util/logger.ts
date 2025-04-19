import { logType } from 'interfaces/types';

const Logger = require("@ptkdev/logger");

const options = {
	language: "en",
	colors: true,
	debug: true,
	info: true,
	warning: true,
	error: true,
	sponsor: true,
	write: true,
	type: "log",
	rotate: {
		size: "10M",
		encoding: "utf8",
	},
	path: {
		// remember: add string *.log to .gitignore
		debug_log: "./debug.log",
		error_log: "./errors.log",
	},
};
const loggest = new Logger(options);

export function logger(logData: logType) {

	const bgRed = "\x1b[41m"
	const bgOrange = "\x1b[48;5;214m"
	const bgBlue = "\x1b[44m"
	const bgGreen = "\x1b[42m"
	const textBold = "\x1b[1m"

	const textBlack = "\x1b[30m"
	const textRed = "\x1b[31m"
	const textGreen = "\x1b[32m"
	const textYellow = "\x1b[33m"
	const textBlue = "\x1b[34m"

	const reset = "\x1b[0m"

	const error = `${bgRed}${textBlack}${textBold}🔴 %s${reset}`
	const errorMessage = `${textRed}%s${reset}`
	const warning = `${bgOrange}${textBlack}${textBold}⚠️ %s${reset}`
	const warningMessage = `${textYellow}%s${reset}`
	const success = `${bgGreen}${textBlack}${textBold}✅ %s${reset}`
	const successMessage = `${textBlue}%s${reset}`
	const neutral = `${textBold}⚪ %s${reset}`
	const neutralMessage = `%s${reset}`

	switch (logData.type) {
		case "error":
			console.group();
			loggest.error(logData.desc);
			loggest.error(logData.message, "");
			// console.log(errorMessage, logData.message);
			console.groupEnd();
			break;
		case "success":
			console.group();
			loggest.info(logData.desc, "Success");
			loggest.info(logData.message, "");
			// console.log(successMessage, logData.message);
			console.groupEnd();
			break;
		case "warning":
			console.group();
			loggest.warning(logData.desc);
			loggest.warning(logData.message, "");
			// console.log(warningMessage, logData.message);
			console.groupEnd();
			break;
		case "neutral":
			console.group();
			console.log(neutralMessage, logData.message);
			console.groupEnd();
			break;
		case "debug":
			console.group();
			loggest.debug(logData.desc);
			loggest.debug(logData.message, "");
			// console.log(neutralMessage, logData.message);
			console.groupEnd();
			break;
	}
}

