exports.getRandomElementsFromArray = (array, count) => {
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
};

exports.getObjectValueByName = (objectContainValue, nameAry) => {
	let result = {};
	nameAry.forEach((name) => {
		if (objectContainValue[name] !== undefined) {
			result[name] = Array.isArray(objectContainValue[name])
				? objectContainValue[name].join(",")
				: objectContainValue[name];
		}
	});
	return result;
};
