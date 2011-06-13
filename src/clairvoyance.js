// TODO: activate this for debug builds only
"use strict";

var CLAIRVOYANCE = CLAIRVOYANCE || function(canvasID, sceneFilePath) {
		var canvas = document.getElementById(canvasID),
			renderer = new CLAIRVOYANCE.Renderer(canvas),
			controller = new CLAIRVOYANCE.Controller(canvas, document),
			scene = new CLAIRVOYANCE.Scene(renderer, controller);
			
		scene.load(sceneFilePath); 
};
