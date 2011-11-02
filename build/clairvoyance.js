// TODO: activate this for debug builds only
"use strict";

var CLAIRVOYANCE = CLAIRVOYANCE || {};
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
};/*
 * Each engine uses a single canvas, each engine maintains an independent scene graph
 *
 * Params:
 * canvasID - the HTML id of a canvas element
 * sceneFilePath - the URL of the JSON file containing the scene
*/
CLAIRVOYANCE.Engine = function Engine(canvasID, sceneFilePath) {
	var controller,
		scene;
		
	this.controller = function() {
		return controller;
	};

	(function() {
		var canvas = document.getElementById(canvasID),
		renderer = new CLAIRVOYANCE.Renderer(canvas);
		
		controller = new CLAIRVOYANCE.Controller(canvas, document);
		scene = new CLAIRVOYANCE.Scene(renderer, controller);
		// TODO: don't load a scene on init; make a method for this and allow the engine to reload scenes
		scene.load(sceneFilePath);
	}());
};/*
 * Params:
 *
 * canvas - the HTML canvas element
*/
CLAIRVOYANCE.Renderer = function Renderer(canvas) {
	var self = this,
		gl,
		basicShaderProgram,
		texturedShaderProgram,
		shaderType = CLAIRVOYANCE.Shader.type.Textured;
	
	this.gl = function() {
		return gl;
	};
	
	function shaderProgramWithType(type) {
		if(type === CLAIRVOYANCE.Shader.type.Basic) {
			return basicShaderProgram;
		}
		if(type === CLAIRVOYANCE.Shader.type.Textured) {
			return texturedShaderProgram;
		}
	}
	
	this.shaderProgram = function() {
		return shaderProgramWithType(shaderType);
	};					  
	
	// TODO: move this on Mesh
	this.createVertexIndexBuffer = function(vertexIndices) {
		var vertexIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
		vertexIndexBuffer.itemSize = 1;
		vertexIndexBuffer.numItems = vertexIndices.length;
		return vertexIndexBuffer;
	};
	
	function initGL() {
		try {
			gl = canvas.getContext("experimental-webgl");
			gl.viewportWidth = canvas.width;
			gl.viewportHeight = canvas.height;
			gl.clearColor(0.0, 0.0, 0.0, 1.0);
			gl.enable(gl.DEPTH_TEST);
		} 
		catch (e) {
			if (!gl) {
				throw CLAIRVOYANCE.Renderer.errors.WebGLNotSupported;
			}
		}
	}

	function createShaderProgram(type) {
		var vertexShaderSource, fragmentShaderSource, vertexShader, fragmentShader,
			shaderProgram = gl.createProgram();
		
		vertexShaderSource = CLAIRVOYANCE.Shader.vertexShaderSource(type);
		fragmentShaderSource = CLAIRVOYANCE.Shader.fragmentShaderSource(type);
		
		vertexShader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
		fragmentShader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
		
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		
		gl.linkProgram(shaderProgram);
		
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}
		
		CLAIRVOYANCE.Shader.bindVariablesLocations(shaderProgram, type, gl);
		
		return shaderProgram;
	}
	
	function createShader(gl, source, type) {
		var shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			// TODO: throw an error instead of raising an alert
			alert(gl.getShaderInfoLog(shader));
		}
		
		return shader;
	}
	
	function switchShaderPrograms(oldType, newType) {
		var oldProgram = shaderProgramWithType(oldType),
			newProgram = shaderProgramWithType(newType),
			pMatrix = gl.getUniform(oldProgram, oldProgram.pMatrixUniform),
			mvMatrix = gl.getUniform(oldProgram, oldProgram.mvMatrixUniform);
		
		CLAIRVOYANCE.Shader.disableVBOs(oldProgram, oldType, gl);
		CLAIRVOYANCE.Shader.enableVBOs(newProgram, newType, gl);
		
		gl.useProgram(newProgram);
		
		gl.uniformMatrix4fv(newProgram.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(newProgram.mvMatrixUniform, false, mvMatrix);
	}
	
	this.setShaderType = function(newType) {
		if(newType !== shaderType) {
			switchShaderPrograms(shaderType, newType);
			shaderType = newType;
		}
	};
	
	this.shaderType = function() {
		return shaderType;
	};
	
	(function() {
		initGL();
		
		basicShaderProgram = createShaderProgram(CLAIRVOYANCE.Shader.type.Basic);
		texturedShaderProgram = createShaderProgram(CLAIRVOYANCE.Shader.type.Textured);
		
		CLAIRVOYANCE.Shader.enableVBOs(self.shaderProgram(), shaderType, gl);
		gl.useProgram(self.shaderProgram());
	}());
};

CLAIRVOYANCE.Renderer.errors = {
	WebGLNotSupported : "Error.Renderer.WebGLNotSupported"
};/**
 * The render loop allows synchronizing a callback method to the refresh rate of the canvas
 *
 * Params
 * callback - the callback function will be called with a delta time parameter each time the canvas is redrawn
*/
CLAIRVOYANCE.RenderLoop = function RenderLoop(callback) {
	var onRenderFrame = callback,
		lastFrameTime = 0;
	
	function renderFrame(frameTime) {
		onRenderFrame(frameTime - lastFrameTime);
		lastFrameTime = frameTime;
		requestAnimFrame(renderFrame);
	}
	
	(function() {
		lastFrameTime = new Date().getTime();
		requestAnimFrame(renderFrame);
	}());
};CLAIRVOYANCE.Shader = {};

CLAIRVOYANCE.Shader.type = {
	Basic : "Shader.type.Basic",
	Textured : "Shader.type.Textured"
};

CLAIRVOYANCE.Shader.vertexShaderSource = function(type) {
	if(type === CLAIRVOYANCE.Shader.type.Basic) {
		return ["attribute vec3 aVertexPosition;",

				"uniform mat4 uMVMatrix;",
				"uniform mat4 uPMatrix;",

				"void main(void) {",
					"gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);",
				"}"].join('\n');
	}
	if(type === CLAIRVOYANCE.Shader.type.Textured) {
		return ["attribute vec3 aVertexPosition;",
				"attribute vec2 aTextureCoord;",

				"uniform mat4 uMVMatrix;",
				"uniform mat4 uPMatrix;",
				
				"varying vec2 vTextureCoord;",

				"void main(void) {",
					"gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);",
					"vTextureCoord = aTextureCoord;",
				"}"].join('\n');
	}
};

CLAIRVOYANCE.Shader.fragmentShaderSource = function(type) {
	if(type === CLAIRVOYANCE.Shader.type.Basic) {
		return ["#ifdef GL_ES",
				"precision highp float;",
				"#endif",
			
				"void main(void) {",
					"gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);",
				"}"].join('\n');
	}
	if(type === CLAIRVOYANCE.Shader.type.Textured) {
		return ["#ifdef GL_ES",
				"precision highp float;",
				"#endif",
				
				"varying vec2 vTextureCoord;",
				
				"uniform sampler2D uSampler;",
			
				"void main(void) {",
					"gl_FragColor = texture2D(uSampler, vTextureCoord.st);",
				"}"].join('\n');
	}
};

CLAIRVOYANCE.Shader.bindVariablesLocations = function(shaderProgram, type, gl) {
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

	if(type === CLAIRVOYANCE.Shader.type.Textured) {
		shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
		shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
	}
};

CLAIRVOYANCE.Shader.enableVBOs = function(shaderProgram, type, gl) {
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	
	if(type === CLAIRVOYANCE.Shader.type.Textured) {
		gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
	}
};

CLAIRVOYANCE.Shader.disableVBOs = function(shaderProgram, type, gl) {
	gl.disableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	
	if(type === CLAIRVOYANCE.Shader.type.Textured) {
		gl.disableVertexAttribArray(shaderProgram.textureCoordAttribute);
	}
};
/*
 * Params:
 * data - an object literal from which to create a Camera
 * scene - a Scene object
*/
CLAIRVOYANCE.Camera = function Camera(data, scene) {
	var self = this,
		node = new CLAIRVOYANCE.Node(data),
		clipStart = data.clipStart,
		clipEnd = data.clipEnd,
		fov = CLAIRVOYANCE.MathUtils.radToDeg(data.fov);
		
	CLAIRVOYANCE.ObjectUtils.exposeProperties(self, node);
	
	this.draw = function() {
		var gl = scene.renderer().gl();
		mat4.perspective(fov, gl.viewportWidth / gl.viewportHeight, clipStart, clipEnd, scene.pMatrix());
		
		node.draw();
	};
	
	(function() {
		self.setReverseTransforms(true);
	}());
};/*
 * Params:
 * args - an object specifier for creating nodes (e.g.: {parent: optional, another Node object,
														renderer: optional, a Renderer object
														location: optional, a coordinates array,
														name: optional,
														rotation: optional, XYZW quaternion})
*/
CLAIRVOYANCE.Node = function Node(args) {
	var self = this,
		parent = args.parent,
		renderer = args.renderer,
		mvMatrix = mat4.create(),
		location = [0, 0, 0],
		rotation = [0, 0, 0, 1],
		children = [],
		reverseTransforms = false;
	
	this.setParent = function(node) {
		parent = node;
	};
	
	this.location = function() {
		return location;
	};
	
	this.setLocation = function(newLocation) {
		location = newLocation;
	};
	
	this.rotation = function() {
		return rotation;
	};
	
	this.setRotation = function(newRotation) {
		rotation = newRotation;
	};
	
	this.setReverseTransforms = function(reverse) {
		reverseTransforms = reverse;
	};
	
	function rotateByQuaternion(rotationQuat) {
		quat4.multiply(rotation, rotationQuat);
	}
	
	this.rotateByEuler = function(rotationVec) {
		var rotationQuat = CLAIRVOYANCE.MathUtils.eulerToQuaternion(rotationVec);
		rotateByQuaternion(rotationQuat);
	};
	
	this.translate = function(translationVec) {
		var rotatedTranslation = [0, 0, 0];
		quat4.multiplyVec3(rotation, translationVec, rotatedTranslation);
		vec3.add(location, rotatedTranslation);
	};

	this.renderer = function() {
		return renderer;
	};
	
	this.addChild = function(child) {
		children.push(child);
		child.setParent(self);
		child.onEnter();
	};
	
	this.mvMatrix = function() {
		return mvMatrix;
	};
	
	function drawChildren() {
		var i;
		for(i = 0;i < children.length;i++) {
			children[i].draw();
		}
	}
	
	function translateTransform() {
		var locationVec = vec3.create(location);
		
		if(reverseTransforms) {
			vec3.negate(location, locationVec);
		}
		
		mat4.translate(mvMatrix, locationVec);
	}
	
	function rotateTransfrom() {
		var rotationQuat = quat4.create(rotation), 
			rotationMatrix;
			
		if(reverseTransforms) {
			quat4.inverse(rotation, rotationQuat);
		}
		
		rotationMatrix = quat4.toMat4(rotationQuat);
		mat4.multiply(mvMatrix, rotationMatrix);
	}
	
	function applyTransforms() {
		if(reverseTransforms) {
			rotateTransfrom();
			translateTransform();
		}
		else {
			translateTransform();
			rotateTransfrom();
		}
	}
	
	this.draw = function() {
		if(typeof parent !== 'undefined') {
			mat4.set(parent.mvMatrix(), mvMatrix);
		}
		
		applyTransforms();
		
		drawChildren();
	};
	
	this.onEnter = function() {
		renderer = args.renderer || parent.renderer();
	};
	
	(function() {
		if(args.hasOwnProperty('location')) {
			location = args.location;
		}
		
		if(args.hasOwnProperty('rotation')) {
			rotation = args.rotation;
		}
	}());
};/*
 * Acts as the root level node
 *
 * Params:
 * renderer - a Renderer object
 * controller - a Controller object
*/
CLAIRVOYANCE.Scene = function Scene(renderer, controller) {
	var self = this,
		node = new CLAIRVOYANCE.Node({renderer: renderer}),
		currentCamera,
		pMatrix = mat4.create(),
		renderLoop;
		
	CLAIRVOYANCE.ObjectUtils.exposeProperties(self, node);
	
	this.pMatrix = function() {
		return pMatrix;
	};
	
	function update(deltaTime) {
		controller.update(deltaTime);
	}

	function draw() {
		var gl = renderer.gl();
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		mat4.identity(self.mvMatrix());
		
		gl.uniformMatrix4fv(renderer.shaderProgram().pMatrixUniform, false, pMatrix);
		
		node.draw();
	}
	
	function onRenderFrame(deltaTime) {
		update(deltaTime);
		draw();
	}
	
	function createMeshes(data) {
		var i, mesh;
		for(i = 0;i < data.meshes.length;i++) {
			mesh = new CLAIRVOYANCE.Mesh(data.meshes[i]);
			currentCamera.addChild(mesh);
		}
	}
	
	function onSceneLoaded(data) {
		// always picking first camera
		currentCamera = new CLAIRVOYANCE.Camera(data.cameras[0], self);
		self.addChild(currentCamera);
		controller.setControlledNode(currentCamera);
		
		createMeshes(data);

		renderLoop = new CLAIRVOYANCE.RenderLoop(onRenderFrame);
	}

	this.load = function(filePath) {
		var request = new XMLHttpRequest();
		request.open("GET", filePath);
		request.onreadystatechange = function() {
		  if (request.readyState === 4) {
			onSceneLoaded(JSON.parse(request.responseText));
		  }
		};
		request.send();
	};
	
	(function() {
		self.onEnter();
	}());
};/*
 * Params:
 * data - an object literal from which to create a Mesh
*/
CLAIRVOYANCE.Mesh = function Mesh(data) {
	var self = this,
		node = new CLAIRVOYANCE.Node(data),
		meshFaceBatches = [];
	
	CLAIRVOYANCE.ObjectUtils.exposeProperties(self, node);
	
	this.onEnter = function() {
		node.onEnter();
		
		batchFaces();
	};
	
	this.draw = function() {
		node.draw();
		
		// TODO: I think this needs to be moved to Node
		setMatrixUniforms();
			
		drawFaceBatches();
	};
	
	function vertexCoordsForVertexIndex(index) {
		var vertices = data.vertices,
			offset = index * 3;
		return [vertices[offset], vertices[offset + 1], vertices[offset + 2]];
	}
	
	function batchFace(meshFaceBatch, face) {
		var i, vertex, vertexIndex, coords, textureCoordsOffset, faceTextureCoords,
			vertices = [];
		for(i = 0;i < face.vertex_indices.length;i++) {
			vertexIndex = face.vertex_indices[i];
			coords = vertexCoordsForVertexIndex(vertexIndex);
			vertex = new CLAIRVOYANCE.MeshVertex(vertexIndex, coords);
			if(face.hasOwnProperty('uv_coords')) {
				faceTextureCoords = face.uv_coords;
				textureCoordsOffset = i * 2;
				vertex.uv_coords = [faceTextureCoords[textureCoordsOffset], faceTextureCoords[textureCoordsOffset + 1]];
			}
			vertices.push(vertex);
		}
		meshFaceBatch.addFace(vertices);
	}
	
	function batchFaces() {
		var i, face, j, meshFaceBatch, batchFound, material, material_index,
			renderer = self.renderer();
		for(i = 0;i < data.faces.length;i++) {
			face = data.faces[i];
			material_index = face.material_index;
			batchFound = false;
			for(j = 0;j < meshFaceBatches.length;j++) {
				meshFaceBatch = meshFaceBatches[j];
				if(meshFaceBatch.materialIndex() === material_index) {
					batchFace(meshFaceBatch, face);
					batchFound = true;
					break;
				}
			}
			if(!batchFound) {
				// create a new batch
				if(data.materials.length > material_index) {
					material = data.materials[material_index];
					material.index = material_index;
					meshFaceBatch = new CLAIRVOYANCE.MeshFaceBatch(renderer, material);
					batchFace(meshFaceBatch, face);
					meshFaceBatches.push(meshFaceBatch);
				}
			}
		}
	}
	
	function setMatrixUniforms() {
		var renderer = self.renderer(),
			shaderProgram = renderer.shaderProgram();
			
		renderer.gl().uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, self.mvMatrix());
	}
	
	function drawFaceBatches() {
		var i;
		for(i = 0;i < meshFaceBatches.length;i++) {
			meshFaceBatches[i].draw();
		}
	}
};/*
 * Params:
 * renderer - the renderer
 * material - a material to apply on the mesh face
*/
CLAIRVOYANCE.MeshFaceBatch = function MeshFaceBatch(renderer, material) {
	var vertices = [],
		vertexPositions = [],
		vertexTextureCoordinates = [],
		vertexIndices = [],
		vertexPositionBuffer,
		vertexTextureCoordBuffer,
		vertexIndexBuffer,
		materialIndex,
		texture,
		textureImage;
		
	this.materialIndex = function() {
		return materialIndex;
	};
	
	this.addFace = function(faceVertices) {
		addFaceVertices(faceVertices);
		rebuildBuffers();
	};
	
	function indexForVertex(vertex) {
		var i;
		for(i = 0;i < vertices.length;i++) {
			if(vertices[i].index === vertex.index) {
				return i;
			}
		}
		return null;
	}
	
	function addFaceVertices(faceVertices) {
		var i, faceVertex, vertexIndex;
		for(i = 0;i < faceVertices.length;i++) {
			faceVertex = faceVertices[i];
			vertexIndex = indexForVertex(faceVertex);
			if(vertexIndex !== null) {
				vertexIndices.push(vertexIndex);
			}
			else {
				vertices.push(faceVertex);
				vertexPositions = vertexPositions.concat(faceVertex.coords);
				vertexTextureCoordinates = vertexTextureCoordinates.concat(faceVertex.uv_coords);
				vertexIndices.push(vertices.length - 1);
			}
		}
	}
	
	function rebuildBuffers() {
		var gl = renderer.gl();
		
		vertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
		vertexPositionBuffer.itemSize = 3;
		vertexPositionBuffer.numItems = vertexPositions.length / 3;
		
		vertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoordinates), gl.STATIC_DRAW);
        vertexTextureCoordBuffer.itemSize = 2;
        vertexTextureCoordBuffer.numItems = vertexTextureCoordinates.length / 2;
		
		vertexIndexBuffer = renderer.createVertexIndexBuffer(vertexIndices);
	}
	
	this.draw = function() {
		var gl = renderer.gl(),
			initialShaderType = renderer.shaderType(),
			shader;
			
		if(isTextured() === false) {
			renderer.setShaderType(CLAIRVOYANCE.Shader.type.Basic);
		}
		
		shader = renderer.shaderProgram();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
		gl.vertexAttribPointer(shader.vertexPositionAttribute, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		if(vertexTextureCoordinates.length > 0) {
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer);
			gl.vertexAttribPointer(shader.textureCoordAttribute, vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
			
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.uniform1i(shader.samplerUniform, 0);
		}
			
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
		gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		
		renderer.setShaderType(initialShaderType);
	};
	
	function isPowerOfTwo(x) {
		return (x & (x - 1)) === 0;
	}
	 
	function nextHighestPowerOfTwo(x) {
		--x;
		for (var i = 1; i < 32; i <<= 1) {
			x = x | x >> i;
		}
		return x + 1;
	}
	
	// TODO: this needs to be moved to a new Texture object
	function onTextureImageLoad() {
		var gl = renderer.gl();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		if (!isPowerOfTwo(textureImage.width) || !isPowerOfTwo(textureImage.height)) {
			// Scale up the texture to the next highest power of two dimensions.
			var canvas = document.createElement("canvas");
			canvas.width = nextHighestPowerOfTwo(textureImage.width);
			canvas.height = nextHighestPowerOfTwo(textureImage.height);
			var ctx = canvas.getContext("2d");
			ctx.drawImage(textureImage,
						  0, 0, textureImage.width, textureImage.height,
						  0, 0, canvas.width, canvas.height);
			textureImage = canvas;
		}
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	
	function isTextured() {
		return material.hasOwnProperty('texture');
	}

	(function() {
		if(isTextured()) {
			texture = renderer.gl().createTexture();
			textureImage = new Image();
			textureImage.onload = function() {
				onTextureImageLoad();
			};
			textureImage.src = material.texture.path;
		}
		
		materialIndex = material.index;
	}());
};CLAIRVOYANCE.MeshVertex = function MeshVertex(index, coords, uv_coords) {
	this.index = index;
	this.coords = coords;
	this.uv_coords = uv_coords || [];
};
CLAIRVOYANCE.MathUtils = {
	degToRad : function(degrees) {
		return degrees * Math.PI / 180;
	},
	
	radToDeg : function(radians) {
		return radians * 180 / Math.PI;
	},
	
	/*
	* Params:
	*
	* vector - a vector of Euler XYZ angles in radians
	*
	* Returns:
	* a quaternion array
	*/
	eulerToQuaternion : function(vector) {
		var quat, x, y, z, sinX, sinY, sinZ, cosX, cosY, cosZ;
		
		x = vector[1] / 2.0;
		y = vector[2] / 2.0;
		z = vector[0] / 2.0;
		
		sinX = Math.sin(x);
		sinY = Math.sin(y);
		sinZ = Math.sin(z);
		cosX = Math.cos(x);
		cosY = Math.cos(y);
		cosZ = Math.cos(z);
		
		quat = [0, 0, 0, 1];
		
		quat[0] = sinZ * cosX * cosY - cosZ * sinX * sinY;
		quat[1] = cosZ * sinX * cosY + sinZ * cosX * sinY;
		quat[2] = cosZ * cosX * sinY - sinZ * sinX * cosY;
		quat[3] = cosZ * cosX * cosY + sinZ * sinX * sinY;
		
		quat4.normalize(quat);
		
		return quat;
	}
};CLAIRVOYANCE.ObjectUtils = {
	/*
	 * Shallow copies all public properties from the source to the target. The target object will then become a wrapper over the source object
	*/
	exposeProperties : function(target, source) {
		var property;
		target = target || {};
		for(property in source) {
			if(source.hasOwnProperty(property)) {
				target[property] = source[property];
			}
		}
		return target;
	},

	/*
	 * Set an event handler as an annonymous function that wraps the old handler and the new one;
	 * useful for out of library events where you can't be sure if someone registered a handler before or not
	*/
	addEventHandler : function(targetObj, eventName, eventHandler) {
		var oldHandler = targetObj[eventName] || function (){};
		targetObj[eventName] = function () {
			oldHandler.apply(targetObj, arguments);
			eventHandler.apply(targetObj, arguments);
		};
	}
};