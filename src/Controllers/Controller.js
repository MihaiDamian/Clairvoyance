/*
 * Params:
 * canvas - the HTML canvas element
 * document - the HTML document
*/
CLAIRVOYANCE.Controller = function Controller(canvas, document) {
	var mouseDown = false,
		lastMouseX,
		lastMouseY,
		controlledNode,
		currentlyPressedKeys = {},
		translationSpeed = 0.02;
		
	function registerForEvents() {
		CLAIRVOYANCE.ObjectUtils.addEventHandler(canvas, "onmousedown", handleMouseDown);
		CLAIRVOYANCE.ObjectUtils.addEventHandler(document, "onmouseup", handleMouseUp);
		CLAIRVOYANCE.ObjectUtils.addEventHandler(document, "onmousemove", handleMouseMove);
		CLAIRVOYANCE.ObjectUtils.addEventHandler(document, "onkeydown", handleKeyDown);
		CLAIRVOYANCE.ObjectUtils.addEventHandler(document, "onkeyup", handleKeyUp);
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
	
	function handleKeyDown(event) {
		currentlyPressedKeys[event.keyCode] = true;
	}
	
	function handleKeyUp(event) {
		currentlyPressedKeys[event.keyCode] = false;
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

		rotationVec = [-rotationAngle(newY, lastMouseY), -rotationAngle(newX, lastMouseX), 0];

		controlledNode.rotateByEuler(rotationVec);

		lastMouseX = newX;
		lastMouseY = newY;
	}
	
	function translation(deltaTime) {
		var translation = [0, 0, 0],
			distance = deltaTime * translationSpeed;
	
		if(currentlyPressedKeys[65]) {
            // Left key or A
			vec3.add(translation, [-distance, 0, 0]);
        } 
		else if(currentlyPressedKeys[68]) {
            // Right key or D
			vec3.add(translation, [distance, 0, 0]);
        }

        if(currentlyPressedKeys[87]) {
            // Up key or W
			vec3.add(translation, [0, 0, -distance]);
        } 
		else if(currentlyPressedKeys[83]) {
            // Down key or S
			vec3.add(translation, [0, 0, distance]);
        }
		
		return translation;
	}
	
	/*
	* speed - in units per milisecond
	*/
	this.setTranslationSpeed = function(speed) {
		translationSpeed = speed;
	};
	
	this.update = function(deltaTime) {
		controlledNode.translate(translation(deltaTime));
	};
};