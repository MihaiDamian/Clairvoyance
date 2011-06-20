/*
 * Params:
 * args - an object specifier for creating nodes (e.g.: {parent: optional, another Node object,
														renderer: optional, a Renderer object
														location: optional, a coordinates array,
														name: optional,
														rotation: optional, XYZW quaternion})
*/
CLAIRVOYANCE.Node = function Node(args) {
	var self = this,
		parent = args.parent,
		renderer = args.renderer,
		mvMatrix = mat4.create(),
		location = [0, 0, 0],
		rotation = [0, 0, 0, 1],
		children = [],
		transforms = [];
	
	this.setParent = function(node) {
		parent = node;
	};
	
	this.location = function() {
		return location;
	};
	
	this.setLocation = function(newLocation) {
		location = newLocation;
	};
	
	this.rotation = function() {
		return rotation;
	};
	
	this.setRotation = function(newRotation) {
		rotation = newRotation;
	};
	
	function rotateByQuaternion(rotationQuat) {
		quat4.multiply(rotation, rotationQuat);
	}
	
	this.rotateByEuler = function(rotationVec) {
		var rotationQuat = CLAIRVOYANCE.MathUtils.eulerToQuaternion(rotationVec);
		rotateByQuaternion(rotationQuat);
	};
	
	this.translate = function(translationVec) {
		quat4.multiplyVec3(rotation, translationVec);
		vec3.add(location, translationVec);
	};

	this.renderer = function() {
		return renderer;
	};
	
	this.addChild = function(child) {
		children.push(child);
		child.setParent(self);
		child.onEnter();
	};
	
	this.mvMatrix = function() {
		return mvMatrix;
	};
	
	function drawChildren() {
		var i;
		for(i = 0;i < children.length;i++) {
			children[i].draw();
		}
	}
	
	function translateTransform() {
		mat4.translate(mvMatrix, location);
	}
	
	function rotateTransfrom() {
		var rotationMatrix = quat4.toMat4(rotation);
		mat4.multiply(mvMatrix, rotationMatrix);
	}
	
	function applyTransforms() {
		var i;
		for(i = 0;i < transforms.length;i++) {
			transforms[i]();
		}
	}
	
	this.draw = function() {
		if(typeof parent !== 'undefined') {
			mat4.set(parent.mvMatrix(), mvMatrix);
		}
		
		applyTransforms();
		
		drawChildren();
	};
	
	this.onEnter = function() {
		renderer = args.renderer || parent.renderer();
	};
	
	this.useTranslateRotateScaleTransforms = function() {
		transforms = [translateTransform, rotateTransfrom];
	};
	
	this.useScaleRotateTranslateTransforms = function() {
		transforms = [rotateTransfrom, translateTransform];
	};
	
	(function() {
		if(args.hasOwnProperty('location')) {
			location = args.location;
		}
		
		if(args.hasOwnProperty('rotation')) {
			rotation = args.rotation;
		}
		
		self.useTranslateRotateScaleTransforms();
	}());
};