// UI View Constructors
// hydrate template with state and handle dom insertion/replacement

const
	sqrt3DivdedBy2 = Math.sqrt(3) / 2;


function stringHex(height, bgColor) {
	return (
		'<svg viewBox="0 0 1 1" width="' + (sqrt3DivdedBy2 * height) + '" height=" ' + height + '" style="display:block">'+
			'<g><polygon points="0,0.75 0,0.25 0.5,0 1,0.25 1,0.75 0.5,1" style="fill:' + bgColor + '"></polygon></g>'
		'</svg>'
	);
}

function stringHexWithText(height, text, fgColor, bgColor) {
    return (
    	'<svg viewBox="0 0 1 1" width="' + (sqrt3DivdedBy2 * height) + '" height=" ' + height + '" style="display:block">'+
			'<g><polygon points="0,0.75 0,0.25 0.5,0 1,0.25 1,0.75 0.5,1" style="fill:' + bgColor + '"></polygon>'+
			'<text x="0.5" y="0.5" text-anchor="middle" style="fill:' + fgColor + '">' + text + '</text></g>'
		'</svg>'
    );
}

function subView(state) {

	var div = document.createElement("div");

	div.innerHTML = (
		'<div class="card">'Position</div>
    		<div class="card">Speed</div>
    		<div class="card">Depth</div>
    		<div class="card">Stealth</div>
    		<button>Done</button>''
	);

	// state.quadrant = "g"
	// state.posA = "0"
	// state.posB = "9"
	// state.speed = "s3"
	// state.depth = "d3"
	// state.stealth = 5
	// state.done = true


}

function shipView() {
	
}

function sonarView(state) {
	// state.cards = ["g0", "r1", "d4", "p7", "g3"]
}