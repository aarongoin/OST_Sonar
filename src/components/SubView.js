const
	React = require("preact"),

	Bind = require("../bind.js"),

	Card = require("./Card.js"),
	QuadrantSelector = require("./QuadrantSelector.js"),
	NumberSelector = require("./NumberSelector.js"),
	Sonar = require("../sonar.js"),

	Style = require ("../style.js");

class SubView extends React.Component {
	constructor(props, context) {
		super(props);

		this.state = {
			quadrant: "R",
			quadrantColor: "#ff0000",
			posA: undefined,
			posB: undefined,
			speed: undefined,
			depth: undefined,
			stealth: undefined
		};

		Bind(this);
	}

	render(props, state) {
		var noSegue = (state.posA    === undefined
					|| state.posB    === undefined
					|| state.speed   === undefined
					|| state.depth   === undefined
					|| state.stealth === undefined)
		return (
			<section style={Style.MainLayout}>
				<Card color={state.quadrantColor}>
					<h2>Position</h2>
					<QuadrantSelector selected={state.quadrant} onSelect={this.selectQuadrant} />
					<NumberSelector fg={state.quadrantColor} selected={[this.state.posA, this.state.posB]} from={0} to={9} onClick={this.selectPosition} />
				</Card>
				<Card color="#333333">
					<h2>Speed</h2>
					<NumberSelector selected={[state.speed]} from={0} to={4} onClick={this.selectSpeed} />
				</Card>
				<Card color="#0139a4">
					<h2>Depth</h2>
					<NumberSelector selected={[state.depth]} from={0} to={4} onClick={this.selectDepth} />
				</Card>
				<Card color="#999999">
					<h2>Stealth</h2>
					<NumberSelector selected={[state.stealth]} from={0} to={12} onClick={this.selectStealth} />
				</Card>
				<button
					style={(noSegue ? Style.DisabledButton : Style.SegueButton)}
					onClick={this.stackDeck}
					disabled={noSegue}
				>Done</button>
			</section>
		);
	}

	selectQuadrant(q) {
		this.setState({
			quadrant: q,
			quadrantColor: Sonar.ColorForQuadrant(q)
		});
	}

	selectPosition(p) {
		var state = {
			posA: this.state.posA,
			posB: this.state.posB
		};

		if (state.posA === p) state.posA = undefined;
		else if (state.posB === p) state.posB = undefined;
		else if (state.posA === undefined) state.posA = p;
		else if (state.posB == undefined) state.posB = p;
		
		this.setState(state);
	}

	selectSpeed(s) {
		if (this.state.speed !== s) this.setState({speed: s});
	}

	selectDepth(s) {
		if (this.state.depth !== s) this.setState({depth: s});
	}

	selectStealth(s) {
		if (this.state.stealth !== s) this.setState({stealth: s});
	}

	stackDeck() {
		this.props.segue(
			Sonar.SubSonar(this.state.quadrant + this.state.posA, this.state.quadrant + this.state.posB, "S" + this.state.speed, "D" + this.state.depth, this.state.stealth)
		);
	}
}

module.exports = SubView;