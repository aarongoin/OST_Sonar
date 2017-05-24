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

// create svg hex with given height and background color
function svgHex(height, bgColor) {
	var width = sqrt3DivdedBy2 * height,
		svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
		scope = svg;

	scope.setAttributeNS(null, "viewBox", "0 0 1 1");
    scope.setAttributeNS(null, "width", width);
    scope.setAttributeNS(null, "height", height);
    scope.style.display = "block";

    scope.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "g"));
    scope = scope.lastElementChild;

    scope.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "polygon"));
    scope = scope.lastElementChild;

    scope.style.fill = bgColor;
    scope.setAttributeNS(null, "points", "0,0.75 0,0.25 0.5,0 1,0.25 1,0.75 0.5,1"); // points: sw nw n ne se s

    return svg;
};

function hexWithText(height, text, fgColor, bgColor) {
	var svg = svgHex(height, bgColor),
		scope = svg.firstElementChild;

	scope.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "text"));
    scope = scope.lastElementChild;

    scope.setAttributeNS(null, "x", "0.5");
    scope.setAttributeNS(null, "y", "0.5");
    scope.setAttributeNS(null, "text-anchor", "middle");
    scope.style.fill = fgColor;

    scope.appendChild(document.createTextNode(text));

    return svg;
}