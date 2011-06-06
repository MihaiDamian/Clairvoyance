CLAIRVOYANCE.Node = function(data, renderer, parent) {
	var gl = renderer.gl();
	
	var mvMatrix = mat4.create();

	var vertexPositionBuffer = gl.createBuffer();
	
	var location = new Array();
	var rotation = new Array();
	
	function setMatrixUniforms() {
		var shaderProgram = renderer.shaderProgram();
		gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
	};
	
	this.draw = function() {
		mat4.set(parent.mvMatrix(), mvMatrix);
		mat4.translate(mvMatrix, location);
		mat4.rotateX(mvMatrix, rotation[0]);
		mat4.rotateY(mvMatrix, rotation[1]);
		mat4.rotateZ(mvMatrix, rotation[2]);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
		gl.vertexAttribPointer(renderer.shaderProgram().vertexPositionAttribute, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems);
	};
	
	(function() {
		location = data.location;
		rotation = data.rotation;
	
		var vertexPositions = data.vertices;
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
		vertexPositionBuffer.itemSize = 3;
		vertexPositionBuffer.numItems = vertexPositions.length / 3;
	}());
};