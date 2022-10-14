const fs = require("fs");

class Map {
	orbits = {};

	constructor() {}

	addOrbit(mainBody, orbitingBody) {
		if (orbitingBody === "COM") {
			throw "Universal centre of mass cannot orbit a body";
		}
		if (this.orbits.hasOwnProperty(orbitingBody)) {
			throw "Bodies may only be on a single orbit";
		}
	
		this.orbits[orbitingBody] = mainBody;
	}

	parse(data) {
		const orbitPattern = /([a-zA-Z0-9]+)\)([a-zA-Z0-9]+)/g;

		const matches = data.toString().matchAll(orbitPattern);
		for (const match of matches) {
			const mainBody = match[1];
			const orbitingBody = match[2];

			this.addOrbit(mainBody, orbitingBody);
		}
	}

	computeOrbitsForBody(body) {
		let total = 0;

		while (body !== "COM") {
			if (!this.orbits.hasOwnProperty(body)) {
				throw "Chain of orbits from body to universal centre of mass is broken";
			}

			body = this.orbits[body];
			total++;
		}

		return total;
	}

	checksum() {
		let totalOrbits = 0;

		Object.keys(this.orbits).forEach(body => {
			totalOrbits += this.computeOrbitsForBody(body);
		});

		return totalOrbits;
	}
}

function runTests() {
	const rawTestJson = fs.readFileSync("./tests.json");
	const tests = JSON.parse(rawTestJson);

	console.log(`Running ${tests.length} tests...`);

	let numPasses = 0;

	tests.forEach(test => {
		const map = new Map();

		const rawMapData = fs.readFileSync(`./tests/${test.name}.txt`);
		map.parse(rawMapData);

		let passed = false;

		let checksum;
		try {
			checksum = map.checksum();
			passed = checksum === test.checksum;
		} catch {
			checksum = -1;
			passed = test.checksum === -1;
		}

		if (passed) {
			numPasses++;
		}

		console.log(`Name: ${test.name} | Expected Output: ${test.checksum} | Actual Output: ${checksum} => ${passed ? "Passed!" : "Failed"}`);
	});

	console.log(`${numPasses}/${tests.length} tests passed (${Math.round(numPasses / tests.length * 100)}%)`);
}

//runTests();

const map = new Map();

const rawMapData = fs.readFileSync(`./tests/question.txt`);
map.parse(rawMapData);

console.log(map.checksum());
