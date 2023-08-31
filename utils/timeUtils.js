exports.getCurrentTimeFormatted = () => {
	const now = new Date();
	const hours = now.getHours();
	const minutes = now.getMinutes();
	const period = hours >= 12 ? "pm" : "am";
	const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
	const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

	const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`;
	return formattedTime;
};
