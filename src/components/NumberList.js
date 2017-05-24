const
	React = require("preact"),
	Style = {
		div: {
			width: "66%",
			display: "flex",
			justifyContent: "flex-start",
			flexWrap: "wrap",
			marginBottom: "2rem"
		},
		text: {
			webkitFontSmoothing: "antialiased",
			display: "inline",
			fontSize: "3rem",
			fontWeight: "200",
			margin: "0.75rem",
			backgroundColor: "rgba(0,0,0,0)",
			color: "#ffffff"
		}
	};

module.exports = function(props) {
	var list = [],
		i = -1;

	while (++i < props.list.length) list.push(
		<p
			style={Style.text}
		>{props.list[i]}</p>
	);

	return (
		<div style={Style.div}>
			{list}
		</div>
	);
};