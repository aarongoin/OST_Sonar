const
	React = require("preact"),
	Style = require("../style.js");

module.exports = function(props) {
	return (
		<div style={Object.assign({}, Style.Card, { background:"radial-gradient(circle, " + props.color + " 15%, #111111 100%)" })}>
			{ props.children }
		</div>
	);
}
