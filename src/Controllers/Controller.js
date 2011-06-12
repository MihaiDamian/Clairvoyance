/*
 * Params:
 * canvas - the HTML canvas element
 * document - the HTML document
 * scene - a Scene object
*/
CLAIRVOYANCE.Controller = function Controller(canvas, document, scene) {
	var mouseDown = false,
		lastMouseX,
		lastMouseY;
	
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
		var newX, newY, newRotationMatrix;
		
		if (!mouseDown) {
			return;
		}
		
		newX = event.clientX;
		newY = event.clientY;
		
		newRotationMatrix = mat4.create();
		mat4.identity(newRotationMatrix);

		mat4.rotate(newRotationMatrix, rotationAngle(newX, lastMouseX), [0, 1, 0]);
		mat4.rotate(newRotationMatrix, rotationAngle(newY, lastMouseY), [1, 0, 0]);

		scene.rotate(newRotationMatrix);

		lastMouseX = newX;
		lastMouseY = newY;
	}
	
	canvas.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;
};