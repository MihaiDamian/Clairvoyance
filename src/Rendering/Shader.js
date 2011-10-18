CLAIRVOYANCE.Shader = {};

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
