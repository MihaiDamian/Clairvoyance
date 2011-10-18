/*
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
};