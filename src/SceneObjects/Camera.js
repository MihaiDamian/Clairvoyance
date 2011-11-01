/*
 * Params:
 * data - an object literal from which to create a Camera
 * scene - a Scene object
*/
CLAIRVOYANCE.Camera = function Camera(data, scene) {
	var self = this,
		node = new CLAIRVOYANCE.Node(data),
		clipStart = data.clipStart,
		clipEnd = data.clipEnd,
		fov = CLAIRVOYANCE.MathUtils.radToDeg(data.fov);
		
	CLAIRVOYANCE.ObjectUtils.exposeProperties(self, node);
	
	this.draw = function() {
		var gl = scene.renderer().gl();
		mat4.perspective(fov, gl.viewportWidth / gl.viewportHeight, clipStart, clipEnd, scene.pMatrix());
		
		node.draw();
	};
	
	(function() {
		self.setReverseTransforms(true);
	}());
};