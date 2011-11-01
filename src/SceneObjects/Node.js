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
		reverseTransforms = false;
	
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
	
	this.setReverseTransforms = function(reverse) {
		reverseTransforms = reverse;
	};
	
	function rotateByQuaternion(rotationQuat) {
		quat4.multiply(rotation, rotationQuat);
	}
	
	this.rotateByEuler = function(rotationVec) {
		var rotationQuat = CLAIRVOYANCE.MathUtils.eulerToQuaternion(rotationVec);
		rotateByQuaternion(rotationQuat);
	};
	
	this.translate = function(translationVec) {
		var rotatedTranslation = [0, 0, 0];
		quat4.multiplyVec3(rotation, translationVec, rotatedTranslation);
		vec3.add(location, rotatedTranslation);
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
		var locationVec = vec3.create(location);
		
		if(reverseTransforms) {
			vec3.negate(location, locationVec);
		}
		
		mat4.translate(mvMatrix, locationVec);
	}
	
	function rotateTransfrom() {
		var rotationQuat = quat4.create(rotation), 
			rotationMatrix;
			
		if(reverseTransforms) {
			quat4.inverse(rotation, rotationQuat);
		}
		
		rotationMatrix = quat4.toMat4(rotationQuat);
		mat4.multiply(mvMatrix, rotationMatrix);
	}
	
	function applyTransforms() {
		if(reverseTransforms) {
			rotateTransfrom();
			translateTransform();
		}
		else {
			translateTransform();
			rotateTransfrom();
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
	
	(function() {
		if(args.hasOwnProperty('location')) {
			location = args.location;
		}
		
		if(args.hasOwnProperty('rotation')) {
			rotation = args.rotation;
		}
	}());
};