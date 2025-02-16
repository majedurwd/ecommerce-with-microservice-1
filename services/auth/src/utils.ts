export const generateVerificationCode = () => {
	// get current timestamp in milliseconds
	const timestamp = new Date().getTime().toString();

	// generate a random 2-digit number
	const randomNum = Math.floor(10 + Math.random() * 90); // Ensure 2-digit random number

	// combine timestamp and random number and extract last 5 digit
	let code = (timestamp + randomNum).slice(-5);
	return code;
};
