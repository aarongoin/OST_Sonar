const
	React = require("preact"),
	sqrt3DivdedBy2 = Math.sqrt(3) / 2;

class Hex extends React.Component {
	render(props) {
		return (
			<svg viewBox="0 0 1 1" width={sqrt3DivdedBy2 * 88} height={88} style="display:block">
				<g onClick={(props.onClick) ? props.onClick : undefined }>
					<polygon
						points="0,0.75 0,0.25 0.5,0 1,0.25 1,0.75 0.5,1"
						style={{
							fill: props.bg,
							fillOpacity:(props.selected ? "1" : "0.4")
						}}
					></polygon>
					{props.children}
				</g>
			</svg>
		);
	}
}

module.exports = Hex;