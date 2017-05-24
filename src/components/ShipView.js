const
	React = require("preact"),

	Bind = require("../bind.js"),

	NumberSelector = require("./NumberSelector.js"),
	Card = require("./Card.js"),
	Style = require("../style.js");

class ShipView extends React.Component {
	constructor(props, context) {
		super(props);
		this.state = {
			detection: 0
		};

		Bind(this);
	}

	render(props, state) {
		return (
			<section style={Style.MainLayout}>
				<Card color="#cccccc">
					<h2>Detection</h2>
					<NumberSelector selected={[state.detection]} from={0} to={12} onClick={this.selectDetection} />
				</Card>
				<button
					style={Style.SegueButton}
					onClick={this.viewSonar}
				>{(this.state.detection === 0) ? "Done" : "View Data"}</button>
			</section>
		);
	}

	selectDetection(s) {
		if (this.state.detection !== s) this.setState({detection: s});
	}

	viewSonar() {
		this.props.segue(
			this.props.payload(this.state.detection, (this.state.detection === 0)) // ship sonar function
		);
	}
}

module.exports = ShipView;