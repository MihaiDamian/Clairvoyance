/**
 * The render loop allows synchronizing a callback method to the refresh rate of the canvas
 *
 * Params
 * callback - the callback function will be called with a delta time parameter each time the canvas is redrawn
*/
CLAIRVOYANCE.RenderLoop = function RenderLoop(callback) {
	var onRenderFrame = callback,
		lastFrameTime = 0;
	
	function renderFrame(frameTime) {
		onRenderFrame(frameTime - lastFrameTime);
		lastFrameTime = frameTime;
		requestAnimFrame(renderFrame);
	}
	
	(function() {
		lastFrameTime = new Date().getTime();
		requestAnimFrame(renderFrame);
	}());
};