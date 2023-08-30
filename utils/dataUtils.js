module.exports = {
	getRandomElementsFromArray: (array, count) => {
		const randomIndices = [];
		const result = [];

		while (randomIndices.length < count) {
			const randomIndex = Math.floor(Math.random() * array.length);
			if (!randomIndices.includes(randomIndex)) {
				randomIndices.push(randomIndex);
				result.push(array[randomIndex]);
			}
		}

		return result;
	},
};
