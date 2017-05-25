const
	React = require("preact"),
	Style = require("../style.js");

function ButtonRow(index, props, callback) {
	var buttons = [],
		width = 3;

	while (width-- && index <= props.to) buttons.push(
		<button
			style={Object.assign({}, Style.NumberButton, { color: (props.selected.indexOf(index) === -1) ? "rgba(255, 255, 255, 0.3)" : "#ffffff" })}
			data-id={index}
			onClick={callback}
		>{("" + index++)}</button>
	);

	return (<div style={Style.FlexRow}>{buttons}</div>);
}

module.exports = function(props) {
	var i = props.from,
		rows = [],
		callback = (e) => props.onClick(Number(e.target.dataset.id));
		
	while (i <= props.to) {
		rows.push(ButtonRow(i, props, callback));
		i += 3;
	}

	return (
		<div style={Style.NumberBox}>
			{rows}
		</div>
	);
};