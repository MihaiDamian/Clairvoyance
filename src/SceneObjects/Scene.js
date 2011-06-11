/*
 * Acts as the root level node
 *
 * Params:
 * renderer - a Renderer object
*/

CLAIRVOYANCE.Scene = function(renderer) {
	var self = this;
	
	var node = new CLAIRVOYANCE.Node({renderer: renderer});
	exposeProperties(this, node);
	
	var currentCamera = null;
	
	var pMatrix = mat4.create();
	
	var rotationMatrix = mat4.create();
	mat4.identity(rotationMatrix);
	
	this.pMatrix = function() {
		return pMatrix;
	};

	function draw() {
		var gl = renderer.gl();
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		mat4.identity(self.mvMatrix());
		
		currentCamera.draw();
		
		//TODO: apply the rotation to the camera
		mat4.multiply(self.mvMatrix(), rotationMatrix);
		
		gl.uniformMatrix4fv(renderer.shaderProgram().pMatrixUniform, false, pMatrix);
		
		node.draw();
	};
	
	function tick() {
		requestAnimFrame(tick);
		draw();
	};
	
	function onSceneLoaded(data) {
		// always picking first camera
		currentCamera = new CLAIRVOYANCE.Camera(data.cameras[0], self);
		
		for(var i = 0;i < data.meshes.length;i++) {
			var meshData = data.meshes[i];
			var mesh = new CLAIRVOYANCE.Node({parent: self,
											renderer: renderer,
											location: meshData.location,
											rotation: meshData.rotation,
											vertices: meshData.vertices});
			self.addChild(mesh);
		}

		tick();
	};

	this.load = function(filePath){
		var request = new XMLHttpRequest();
		request.open("GET", filePath);
		request.onreadystatechange = function() {
		  if (request.readyState == 4) {
			onSceneLoaded(JSON.parse(request.responseText));
		  }
		}
		request.send();
	};
	
	this.rotate = function(rotationM) {
		mat4.multiply(rotationM, rotationMatrix, rotationMatrix);
	};
};