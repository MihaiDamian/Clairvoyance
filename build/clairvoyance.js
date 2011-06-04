var CLAIRVOYANCE = CLAIRVOYANCE || function(canvasID, sceneFilePath) {
		var canvas = document.getElementById(canvasID);
		var renderer = new CLAIRVOYANCE.Renderer(canvas);
		var scene = new CLAIRVOYANCE.Scene(renderer);
		scene.load(sceneFilePath);
		var controller = new CLAIRVOYANCE.Controller(canvas, document, scene);
};


CLAIRVOYANCE.Controller = function(canvas, document, scene) {
	function degToRad(degrees) {
		return degrees * Math.PI / 180;
	};

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
		mat4.rotate(newRotationMatrix, degToRad(deltaX / 10), [0, 1, 0]);

		var deltaY = newY - lastMouseY;
		mat4.rotate(newRotationMatrix, degToRad(deltaY / 10), [1, 0, 0]);

		scene.rotate(newRotationMatrix);

		lastMouseX = newX
		lastMouseY = newY;
	}
	
	canvas.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;
};

CLAIRVOYANCE.Node = function(data, renderer, parent) {
	var gl = renderer.gl();
	
	var mvMatrix = mat4.create();

	var vertexPositionBuffer = gl.createBuffer();
	
	function setMatrixUniforms() {
		var shaderProgram = renderer.shaderProgram();
		gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
	};
	
	this.draw = function() {
		mat4.set(parent.mvMatrix(), mvMatrix);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
		gl.vertexAttribPointer(renderer.shaderProgram().vertexPositionAttribute, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems);
	};
	
	var vertexPositions = data.vertices;
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
	vertexPositionBuffer.itemSize = 3;
	vertexPositionBuffer.numItems = vertexPositions.length / 3;
};

CLAIRVOYANCE.Renderer = function (canvas) {
	var gl = (function() {
		var gl;
		try {
			gl = canvas.getContext("experimental-webgl");
			gl.viewportWidth = canvas.width;
			gl.viewportHeight = canvas.height;
			gl.clearColor(0.0, 0.0, 0.0, 1.0);
			gl.enable(gl.DEPTH_TEST);
		} catch (e) {
		}
		if (!gl) {
			alert("Could not initialise WebGL");
		}
		return gl;
	}());
	
	this.gl = function() {
		return gl;
	};
	
	var shaderProgram;
	
	this.shaderProgram = function() {
		return shaderProgram;
	}
	
	var vertexShaderSource = ["attribute vec3 aVertexPosition;",
						
						    "uniform mat4 uMVMatrix;",
						    "uniform mat4 uPMatrix;",
						
						    "void main(void) {",
						        "gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);",
						    "}"].join('\n');

	var fragmentShaderSource = ["#ifdef GL_ES",
								"precision highp float;",
								"#endif",
							
								"void main(void) {",
									"gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);",
								"}"].join('\n');					   

	function createShader(gl, source, type) {
		var shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(shader));
			return null;
		}

		return shader;
	};

	function initShaders() {
		var vertexShader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
		var fragmentShader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

		shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}

		gl.useProgram(shaderProgram);

		shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
		gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

		shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	};

	initShaders();
};

CLAIRVOYANCE.Scene = function(renderer){
	var self = this;

	var nodes = new Array();
	
	var mvMatrix = mat4.create();
	
	this.mvMatrix = function() {
		return mvMatrix;
	};
	
	var pMatrix = mat4.create();
	
	var rotationMatrix = mat4.create();
	mat4.identity(rotationMatrix);

	function draw() {
		var gl = renderer.gl();
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

		mat4.identity(mvMatrix);

		mat4.translate(mvMatrix, [0, 0, -20]);
		
		mat4.multiply(mvMatrix, rotationMatrix);
		
		gl.uniformMatrix4fv(renderer.shaderProgram().pMatrixUniform, false, pMatrix);
		
		for(var i = 0;i < nodes.length;i++) {
			nodes[i].draw();
		}
	};
	
	function tick() {
		requestAnimFrame(tick);
		draw();
	};
	
	function onSceneLoaded(data) {
		for(var i = 0;i < data.meshes.length;i++) {
			var node = new CLAIRVOYANCE.Node(data.meshes[i], renderer, self);
			nodes.push(node);
		}

		tick();
	};

	this.load = function(filePath){
		var request = new XMLHttpRequest();
		request.open("GET", filePath);
		request.onreadystatechange = function() {
		  if (request.readyState == 4) {
			onSceneLoaded(JSON.parse(request.responseText));
		  }
		}
		request.send();
	};
	
	this.rotate = function(rotationM) {
		mat4.multiply(rotationM, rotationMatrix, rotationMatrix);
	};
};

