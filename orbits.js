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

	transfers(start, end) {
		if (!this.orbits.hasOwnProperty(start)) {
			throw "Start point doesn't exist";
		}
		if (!this.orbits.hasOwnProperty(end)) {
			throw "End point doesn't exist";
		}

		const startHopsToCOM = this.computeOrbitsForBody(start);
		const endHopsToCOM = this.computeOrbitsForBody(end);

		const startIsCloser = startHopsToCOM < endHopsToCOM;
		const extraHops = Math.abs(startHopsToCOM - endHopsToCOM);

		let nearest = startIsCloser ? start : end;
		let furthest = startIsCloser ? end : start;
		let hops = 0;

		for (let hop = 0; hop < extraHops; hop++) {
			furthest = this.orbits[furthest];
			hops++;
		}

		while (this.orbits[nearest] !== this.orbits[furthest]) {
			nearest = this.orbits[nearest];
			furthest = this.orbits[furthest];
			hops += 2;
		}

		return hops;
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
		} catch {
			checksum = -1;
		}

		let transfers;
		try {
			transfers = map.transfers("YOU", "SAN");
		} catch {
			transfers = -1;
		}

		passed = checksum === test.checksum && transfers === test.transfers;

		if (passed) {
			numPasses++;
		}

		console.log(`Name: ${test.name} => ${passed ? "Passed!" : "Failed"}
Expected Checksum: ${test.checksum} | Checksum: ${checksum}
Expected Transfers: ${test.transfers} | Transfers: ${transfers}`);
	});

	console.log(`${numPasses}/${tests.length} tests passed (${Math.round(numPasses / tests.length * 100)}%)`);
}

//runTests();

const map = new Map();

const rawMapData = fs.readFileSync(`./question.txt`);
map.parse(rawMapData);

console.log(map.checksum());
console.log(map.transfers("YOU", "SAN"));
