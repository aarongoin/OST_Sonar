function sonarDeck() {
	return [
		"G0",
		"G1",
		"G2",
		"G3",
		"G4",
		"G5",
		"G6",
		"G7",
		"G8",
		"G9",
		"P0",
		"P1",
		"P2",
		"P3",
		"P4",
		"P5",
		"P6",
		"P7",
		"P8",
		"P9",
		"O0",
		"O1",
		"O2",
		"O3",
		"O4",
		"O5",
		"O6",
		"O7",
		"O8",
		"O9",
		"R0",
		"R1",
		"R2",
		"R3",
		"R4",
		"R5",
		"R6",
		"R7",
		"R8",
		"R9",
		"D0",
		"D1",
		"D2",
		"D3",
		"D4",
		"S0",
		"S1",
		"S2",
		"S3",
		"S4"
	];
}

function FisherYatesShuffle(deck) {
	var  temp, i, j;

	i = deck.length;
	while(i) {
		j = (Math.random() * i--) >> 0; 

		temp = deck[i];
		deck[i] = deck[j];
		deck[j] = temp;
	}
}

function shuffle(deck, times) {
	while (times--) FisherYatesShuffle(deck);
}

function ShipSonar(detection) {
	while (detection < this.length) this.pop();
	return this;
}

function SubSonar(posA, posB, speed, depth, stealth) {
	var deck = sonarDeck(),
		sonar = [],
		i;

	i = deck.indexOf(posA);
	if (i !== -1) sonar.push(deck.splice(i, 1)[0]);
	else throw "Position: " + posA + " not in Sonar!";

	i = deck.indexOf(posB);
	if (i !== -1) sonar.push(deck.splice(i, 1)[0]);
	else throw "Position: " + posB + " not in Sonar!";

	i = deck.indexOf(speed);
	if (i !== -1) sonar.push(deck.splice(i, 1)[0]);
	else throw "Speed: " + speed + " not in Sonar!";

	i = deck.indexOf(depth);
	if (i !== -1) sonar.push(deck.splice(i, 1)[0]);
	else throw "Speed: " + depth + " not in Sonar!";

	shuffle(deck, 2);

	while (stealth--) {
		i = (Math.random() * deck.length) >> 0;
		sonar.push(deck.splice(i, 1)[0]);
	}

	shuffle(sonar, 2);

	return ShipSonar.bind(sonar);
}

function ColorForQuadrant(q) {
	switch (q) {
		case "R": return "#ff0000";
		case "P": return "#cc00cc";
		case "O": return "#ff9900";
		case "G": return "#00cc33";
	}
}

module.exports = { SubSonar: SubSonar, ColorForQuadrant: ColorForQuadrant };