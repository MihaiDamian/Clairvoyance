CLAIRVOYANCE.WebglRenderer = function (canvas) {
	var gl;
	
	function initGL() {
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
	};
	
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

	var shaderProgram;

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

		shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
		gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

		shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	};
	
	var mvMatrix = mat4.create();
	var mvMatrixStack = [];
	var pMatrix = mat4.create();

	function mvPushMatrix() {
		var copy = mat4.create();
		mat4.set(mvMatrix, copy);
		mvMatrixStack.push(copy);
	};

	function mvPopMatrix() {
		if (mvMatrixStack.length == 0) {
			throw "Invalid popMatrix!";
		}
		mvMatrix = mvMatrixStack.pop();
	};
	
	var sceneRotationMatrix = mat4.create();
	mat4.identity(sceneRotationMatrix);
	
	function setMatrixUniforms() {
		gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
	};
	
	var dummyObjectPositionBuffer;
	
	this.onSceneLoaded = function(sceneData) {
		var dummyVertexPositions = sceneData.meshes[0].vertices;
		dummyObjectPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, dummyObjectPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dummyVertexPositions), gl.STATIC_DRAW);
		dummyObjectPositionBuffer.itemSize = 3;
		dummyObjectPositionBuffer.numItems = dummyVertexPositions.length / 3;
	};
	
	this.drawScene = function() {
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

		mat4.identity(mvMatrix);

		mat4.translate(mvMatrix, [0, 0, -20]);
		
		mat4.multiply(mvMatrix, sceneRotationMatrix);
		
		mvPushMatrix();

		gl.bindBuffer(gl.ARRAY_BUFFER, dummyObjectPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, dummyObjectPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, dummyObjectPositionBuffer.numItems);

		mvPopMatrix();
	};
	
	this.rotate = function(rotationMatrix) {
		mat4.multiply(rotationMatrix, sceneRotationMatrix, sceneRotationMatrix);
	};
	
	initGL();
	initShaders();
};