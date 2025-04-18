import { logType } from 'interfaces/types';

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
			console.log(error, logData.desc);
			console.log(errorMessage, logData.message);
			console.groupEnd();
			break;
		case "success":
			console.group();
			console.log(success, logData.desc);
			console.log(successMessage, logData.message);
			console.groupEnd();
			break;
		case "warning":
			console.group();
			console.log(warning, logData.desc);
			console.log(warningMessage, logData.message);
			console.groupEnd();
			break;
		case "neutral":
			console.group();
			console.log(neutral, logData.desc);
			console.log(neutralMessage, logData.message);
			console.groupEnd();
			break;
	}
}

