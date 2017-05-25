const
	React = require("preact"),
	HexButton = require("./HexButton.js");

module.exports = function(props, state) {
	return (
		<div style="display: flex; justify-content: center;">
			<HexButton text="R" fg="#ff0000" bg="#ffffff" selected={(props.selected === "R")} onClick={props.onSelect} height="4rem"/>
			<HexButton text="P" fg="#cc00cc" bg="#ffffff" selected={(props.selected === "P")} onClick={props.onSelect} height="4rem"/>
			<HexButton text="O" fg="#ff9900" bg="#ffffff" selected={(props.selected === "O")} onClick={props.onSelect} height="4rem"/>
			<HexButton text="G" fg="#00cc33" bg="#ffffff" selected={(props.selected === "G")} onClick={props.onSelect} height="4rem"/>
		</div>
	);
};