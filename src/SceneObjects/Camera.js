/*
 * Params:
 * data - an object literal from which to create a Camera
 * scene - a Scene object
*/
CLAIRVOYANCE.Camera = function Camera(data, scene) {
	var node = new CLAIRVOYANCE.Node(data),
		clipStart = data.clipStart,
		clipEnd = data.clipEnd,
		fov = CLAIRVOYANCE.MathUtils.radToDeg(data.fov);
		
	exposeProperties(this, node);
	
	this.draw = function() {
		var gl = scene.gl();
		mat4.perspective(fov, gl.viewportWidth / gl.viewportHeight, clipStart, clipEnd, scene.pMatrix());
		//TODO: use translation and rotation from data
		mat4.translate(scene.mvMatrix(), [0, 0, -20]);
		
		node.draw();
	};
};