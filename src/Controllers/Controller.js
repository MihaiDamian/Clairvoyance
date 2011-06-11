/*
 * Params:
 * canvas - the HTML canvas element
 * document - the HTML document
 * scene - a Scene object
*/
CLAIRVOYANCE.Controller = function Controller(canvas, document, scene) {
	var mouseDown = false;
	var lastMouseX = null;
	var lastMouseY = null;
	
	function handleMouseDown(event) {
		mouseDown = true;
		lastMouseX = event.clientX;
		lastMouseY = event.clientY;
	};

	function handleMouseUp(event) {
		mouseDown = false;
	};

	function handleMouseMove(event) {
		if (!mouseDown) {
			return;
		}
		var newX = event.clientX;
		var newY = event.clientY;

		var deltaX = newX - lastMouseX;
		var newRotationMatrix = mat4.create();
		mat4.identity(newRotationMatrix);
		var yAngle = CLAIRVOYANCE.MathUtils.degToRad(deltaX / 10);
		mat4.rotate(newRotationMatrix, yAngle, [0, 1, 0]);

		var deltaY = newY - lastMouseY;
		var xAngle = CLAIRVOYANCE.MathUtils.degToRad(deltaY / 10);
		mat4.rotate(newRotationMatrix, xAngle, [1, 0, 0]);

		scene.rotate(newRotationMatrix);

		lastMouseX = newX
		lastMouseY = newY;
	}
	
	canvas.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;
};