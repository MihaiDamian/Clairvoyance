/*
 * Acts as the root level node
 *
 * Params:
 * renderer - a Renderer object
 * controller - a Controller object
*/
CLAIRVOYANCE.Scene = function Scene(renderer, controller) {
	var self = this,
		node = new CLAIRVOYANCE.Node({renderer: renderer}),
		currentCamera,
		pMatrix = mat4.create(),
		renderLoop;
		
	CLAIRVOYANCE.ObjectUtils.exposeProperties(self, node);
	
	this.pMatrix = function() {
		return pMatrix;
	};
	
	function update(deltaTime) {
		controller.update(deltaTime);
	}

	function draw() {
		var gl = renderer.gl();
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		mat4.identity(self.mvMatrix());
		
		gl.uniformMatrix4fv(renderer.shaderProgram().pMatrixUniform, false, pMatrix);
		
		node.draw();
	}
	
	function onRenderFrame(deltaTime) {
		update(deltaTime);
		draw();
	}
	
	function createMeshes(data) {
		var i, mesh;
		for(i = 0;i < data.meshes.length;i++) {
			mesh = new CLAIRVOYANCE.Mesh(data.meshes[i]);
			currentCamera.addChild(mesh);
		}
	}
	
	function onSceneLoaded(data) {
		// always picking first camera
		currentCamera = new CLAIRVOYANCE.Camera(data.cameras[0], self);
		self.addChild(currentCamera);
		controller.setControlledNode(currentCamera);
		
		createMeshes(data);

		renderLoop = new CLAIRVOYANCE.RenderLoop(onRenderFrame);
	}

	this.load = function(filePath) {
		var request = new XMLHttpRequest();
		request.open("GET", filePath);
		request.onreadystatechange = function() {
		  if (request.readyState === 4) {
			onSceneLoaded(JSON.parse(request.responseText));
		  }
		};
		request.send();
	};
	
	(function() {
		self.onEnter();
	}());
};