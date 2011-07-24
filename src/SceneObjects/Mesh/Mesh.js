/*
 * Params:
 * data - an object literal from which to create a Mesh
*/
CLAIRVOYANCE.Mesh = function Mesh(data) {
	var self = this,
		node = new CLAIRVOYANCE.Node(data),
		vertexPositionBuffer,
		meshFaceBatches = [],
		vertexIndexBuffer = null;
	
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
		}
	}
	
	function batchFaces() {
		var i, face, j, meshFaceBatch, batchFound, material, material_index, 
			vertexIndices = [],
			renderer = self.renderer(),
			gl = renderer.gl();
		for(i = 0;i < data.faces.length;i++) {
			face = data.faces[i];
			material_index = face.material_index;
			batchFound = false;
			for(j = 0;j < meshFaceBatches.length;j++) {
				meshFaceBatch = meshFaceBatches[j];
				if(meshFaceBatch.materialIndex() === material_index) {
					meshFaceBatch.addFace(face);
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
					meshFaceBatch.addFace(face);
					meshFaceBatches.push(meshFaceBatch);
				}
				// this face has no material so we're not batching it
				else {
					vertexIndices = vertexIndices.concat(face.vertex_indices);
					vertexIndexBuffer = renderer.createVertexIndexBuffer(vertexIndices);
				}
			}
		}
	}
	
	this.onEnter = function() {
		node.onEnter();
		
		setupVertexData();
		batchFaces();
	};
	
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
	
	this.draw = function() {
		var gl = self.renderer().gl();
		node.draw();
		
		if(typeof vertexPositionBuffer !== 'undefined') {
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
			gl.vertexAttribPointer(self.renderer().shaderProgram().vertexPositionAttribute, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
			
			setMatrixUniforms();
			
			if(vertexIndexBuffer !== null) {
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
				gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
			}
			
			drawFaceBatches();
		}
	};
};