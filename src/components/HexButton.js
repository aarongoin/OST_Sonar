const
	React = require("preact"),
	Hex = require("./Hex.js"),
	Style = require("../style.js"),
	sqrt3DivdedBy2 = Math.sqrt(3) / 2;

class HexButton extends React.Component {
	render(props) {
		var margin = (1 - sqrt3DivdedBy2) / 2;
		return (
			<svg viewBox="0 0 1 1" width={sqrt3DivdedBy2 * 100} height={100} style={Style.HexButton}>
				<g onClick={(props.onClick ? () => props.onClick(props.text) : undefined)}>
					<polygon
						points={margin + ",0.75 " + margin + ",0.25 0.5,0 " + (1-margin) + ",0.25 " + (1-margin) + ",0.75 0.5,1"}
						style={{
							fill: props.bg,
							fillOpacity:(props.selected ? "1" : "0.4")
						}}
					></polygon>
					<text
						x="0.5"
						y="0.78"
						text-anchor="middle"
						style={(props.selected ? {
							fontFamily: "Open Sans",
							fontSize: "4.8%",
							fill: props.fg,
							fillOpacity: "1"
						} : {
							fontFamily: "Open Sans",
							fontSize: "4.8%",
							fill: "#111111",
							fillOpacity: "0.5"
						})}
					>{props.text}</text>
				</g>
			</svg>
		);
	}
}

module.exports = HexButton;