const
	React = require("preact"),
	Style = require("../style.js");

module.exports = function(props) {
	var i = props.from,
		buttons = [],
		callback = (e) => props.onClick(Number(e.target.dataset.id));

	while (i <= props.to) buttons.push(
		<button
			style={Object.assign({}, Style.NumberButton, { color: (props.selected.indexOf(i) === -1) ? "rgba(255, 255, 255, 0.3)" : "#ffffff" })}
			data-id={i}
			onClick={callback}
		>{("" + i++)}</button>
	);

	return (
		<div style={Style.NumberBox}>
			{buttons}
		</div>
	);
};