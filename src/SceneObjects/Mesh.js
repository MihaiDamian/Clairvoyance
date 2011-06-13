/*
 * Params:
 * data - an object literal from which to create a Mesh
*/
CLAIRVOYANCE.Mesh = function Mesh(data) {
	var self = this,
		node = new CLAIRVOYANCE.Node(data),
		vertexPositionBuffer;
	
	exposeProperties(self, node);
	
	function setupVertexData() {
		var gl = self.renderer().gl();
		if(data.hasOwnProperty('vertices')) {
			vertexPositionBuffer = gl.createBuffer();
			var vertexPositions = data.vertices;
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
			vertexPositionBuffer.itemSize = 3;
			vertexPositionBuffer.numItems = vertexPositions.length / 3;
		}
	}
	
	this.onEnter = function() {
		node.onEnter();
		
		setupVertexData();
	};
	
	function setMatrixUniforms() {
		var renderer = self.renderer(),
			shaderProgram = renderer.shaderProgram();
			
		renderer.gl().uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, self.mvMatrix());
	}
	
	this.draw = function() {
		var gl = self.renderer().gl();
		node.draw();
		
		if(typeof vertexPositionBuffer !== 'undefined') {
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
			gl.vertexAttribPointer(self.renderer().shaderProgram().vertexPositionAttribute, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

			setMatrixUniforms();
			gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems);
		}
	};
};