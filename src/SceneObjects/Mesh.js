/*
 * Params:
 * data - an object literal from which to create a Mesh
*/
CLAIRVOYANCE.Mesh = function Mesh(data) {
	var self = this,
		node = new CLAIRVOYANCE.Node(data),
		vertexPositionBuffer,
		vertexIndexBuffer;
	
	CLAIRVOYANCE.ObjectUtils.exposeProperties(self, node);
	
	function setupVertexData() {
		var gl = self.renderer().gl();
		if(data.hasOwnProperty('vertices')) {
			vertexPositionBuffer = gl.createBuffer();
			var vertexPositions = data.vertices;
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
			vertexPositionBuffer.itemSize = 3;
			vertexPositionBuffer.numItems = vertexPositions.length / 3;
			
			vertexIndexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
			var vertexIndices = data.vertex_indices;
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
			vertexIndexBuffer.itemSize = 1;
			vertexIndexBuffer.numItems = vertexIndices.length;
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

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
			
			setMatrixUniforms();
			
			gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		}
	};
};