/*
 * Params:
 * renderer - the renderer
 * material - a material to apply on the mesh face
*/
CLAIRVOYANCE.MeshFaceBatch = function MeshFaceBatch(renderer, material) {
	var vertexIndexBuffer,
		vertexIndices = [],
		materialIndex;
		
	this.materialIndex = function() {
		return materialIndex;
	};
	
	this.addFace = function(face) {
		if(face.material_index !== materialIndex) {
			throw CLAIRVOYANCE.MeshFaceBatch.errors.MeshFaceUsesDifferentMaterial;
		}
		
		vertexIndices = vertexIndices.concat(face.vertex_indices);
		
		vertexIndexBuffer = renderer.createVertexIndexBuffer(vertexIndices);
	};
	
	this.draw = function() {
		var gl = renderer.gl();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
		gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	};

	(function() {
		materialIndex = material.index;
	}());
};

CLAIRVOYANCE.MeshFaceBatch.errors = {
	MeshFaceUsesDifferentMaterial : "Error.MeshFaceBatch.MeshFaceUsesDifferentMaterial"
};