const
	React = require("preact"),
	Style = require("../style.js");

module.exports = function(props) {
	setTimeout(() => props.segue(), 2000);
	return (
		<div style={Style.MainLayout}>
			<img src="./dist/img/BACK.png" style={Style.img}/>
			<h2>{"Pass this to your opponent."}</h2>
		</div>
	);
}