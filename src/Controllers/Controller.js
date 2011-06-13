/*
 * Params:
 * canvas - the HTML canvas element
 * document - the HTML document
*/
CLAIRVOYANCE.Controller = function Controller(canvas, document) {
	var mouseDown = false,
		lastMouseX,
		lastMouseY,
		controlledNode;
		
	function registerForEvents() {
		addEventHandler(canvas, "onmousedown", handleMouseDown);
		addEventHandler(document, "onmouseup", handleMouseUp);
		addEventHandler(document, "onmousemove", handleMouseMove);
	}
		
	this.setControlledNode = function(node) {
		if(typeof controlledNode === 'undefined') {
			registerForEvents();
		}
		
		controlledNode = node;
	};
	
	function handleMouseDown(event) {
		mouseDown = true;
		lastMouseX = event.clientX;
		lastMouseY = event.clientY;
	}

	function handleMouseUp(event) {
		mouseDown = false;
	}
	
	function rotationAngle(newPos, lastPos) {
		var delta = newPos - lastPos;
		return CLAIRVOYANCE.MathUtils.degToRad(delta / 10);
	}

	function handleMouseMove(event) {
		var newX, newY, rotationVec;
		
		if (!mouseDown) {
			return;
		}
		
		newX = event.clientX;
		newY = event.clientY;

		rotationVec = [rotationAngle(newY, lastMouseY), rotationAngle(newX, lastMouseX), 0];

		controlledNode.rotate(rotationVec);

		lastMouseX = newX;
		lastMouseY = newY;
	}
};