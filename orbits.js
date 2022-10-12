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
		const orbitPattern = /([a-zA-Z]+)\)([a-zA-Z]+)/g;

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

const map = new Map();

const rawMapData = fs.readFileSync("./tests/invalid.txt");
map.parse(rawMapData);

console.log(map.checksum());
