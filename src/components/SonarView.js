const
	React = require("preact"),

	Bind = require("../bind.js"),

	NumberList = require("./NumberList.js"),
	Card = require("./Card.js"),
	Sonar = require("../sonar.js"),
	Style = require("../style.js");

function parseDraw(cards) {
	var draw = {
			R: [],
			P: [],
			O: [],
			G: [],
			S: [],
			D: []
		},
		c;

	while (c = cards.pop()) draw[c[0]].push(Number(c[1]));

	draw.R.sort();
	draw.P.sort();
	draw.O.sort();
	draw.G.sort();
	draw.S.sort();
	draw.D.sort();

	return draw;
}

module.exports = function(props, state) {
	var draw = parseDraw(props.payload),
		cards = [];

	if (draw.R.length) cards.push(
		<Card color={Sonar.ColorForQuadrant("R")}>
			<h2>Red</h2>
			<NumberList list={draw.R} />
		</Card>
	);

	if (draw.P.length) cards.push(
		<Card color={Sonar.ColorForQuadrant("P")}>
			<h2>Purple</h2>
			<NumberList list={draw.P} />
		</Card>
	);

	if (draw.O.length) cards.push(
		<Card color={Sonar.ColorForQuadrant("O")}>
			<h2>Orange</h2>
			<NumberList list={draw.O} />
		</Card>
	);

	if (draw.G.length) cards.push(
		<Card color={Sonar.ColorForQuadrant("G")}>
			<h2>Green</h2>
			<NumberList list={draw.G} />
		</Card>
	);

	if (draw.S.length) cards.push(
		<Card color="#0139a4">
			<h2>Speed</h2>
			<NumberList list={draw.S} />
		</Card>
	);

	if (draw.D.length) cards.push(
		<Card color="#333333">
			<h2>Depth</h2>
			<NumberList list={draw.D} />
		</Card>
	);

	return (
		<section style={Style.MainLayout}>
			{cards}
			<button style={Style.SegueButton} onClick={() => props.segue()}>Done</button>
		</section>
	);
};