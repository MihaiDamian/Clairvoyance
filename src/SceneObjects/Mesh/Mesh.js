/*
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
};