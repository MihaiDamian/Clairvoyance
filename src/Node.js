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