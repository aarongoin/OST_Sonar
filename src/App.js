require('./polyfills.js');

const
	React = require('preact'),

	Bind = require("./bind.js"),

	Pass = require('./components/Pass.js'),
	SubView = require('./components/SubView.js'),
	ShipView = require('./components/ShipView.js'),
	SonarView = require('./components/SonarView.js'),

	Style = {
		app: 'width: 100vw;'
	};


class App extends React.Component {
	constructor(props, context) {
		super(props);
		this.state = {
			view: 0,
			payload: undefined
		}

		Bind(this);
	}

	render(props, state) {
		switch (state.view) {
			case 0: return <SubView segue={this.segueWithPayload}/>;
			case 1: return <Pass segue={this.segue}/>;
			case 2: return <ShipView payload={state.payload} segue={this.segueWithPayload}/>;
			case 3: return <SonarView payload={state.payload} segue={this.segueWithPayload}/>;
			//case 4: return <Pass to="Sub" segue={this.segue}/>;
		}
	}

	segue() {
		this.setState({
			view: (this.state.view === 3) ? 0 : this.state.view + 1
		});
	}

	segueWithPayload(payload) {
		this.setState({
			view: (this.state.view === 3 || payload === undefined) ? 0 : this.state.view + 1,
			payload: payload
		});
	}
}

React.render(<App/>, document.body);