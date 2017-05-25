const
	React = require("preact"),

	Bind = require("../bind.js"),

	HexButton = require("./HexButton.js"),
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
			<HexButton text="R" selected="true" fg={Sonar.ColorForQuadrant("R")} bg="#ffffff"/>
			<NumberList list={draw.R} />
		</Card>
	);

	if (draw.P.length) cards.push(
		<Card color={Sonar.ColorForQuadrant("P")}>
			<HexButton text="P" selected="true" fg={Sonar.ColorForQuadrant("P")} bg="#ffffff"/>
			<NumberList list={draw.P} />
		</Card>
	);

	if (draw.O.length) cards.push(
		<Card color={Sonar.ColorForQuadrant("O")}>
			<HexButton text="O" selected="true" fg={Sonar.ColorForQuadrant("O")} bg="#ffffff"/>
			<NumberList list={draw.O} />
		</Card>
	);

	if (draw.G.length) cards.push(
		<Card color={Sonar.ColorForQuadrant("G")}>
			<HexButton text="G" selected="true" fg={Sonar.ColorForQuadrant("G")} bg="#ffffff"/>
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