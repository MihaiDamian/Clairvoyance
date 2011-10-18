/*
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
};