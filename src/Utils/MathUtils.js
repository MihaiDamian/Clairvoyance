CLAIRVOYANCE.MathUtils = {
	degToRad : function(degrees) {
		return degrees * Math.PI / 180;
	},
	
	radToDeg : function(radians) {
		return radians * 180 / Math.PI;
	},
	
	/*
	* Params:
	*
	* vector - a vector of Euler XYZ angles in radians
	*
	* Returns:
	* a quaternion array
	*/
	eulerToQuaternion : function(vector) {
		var quat, x, y, z, sinX, sinY, sinZ, cosX, cosY, cosZ;
		
		x = vector[1] / 2.0;
		y = vector[2] / 2.0;
		z = vector[0] / 2.0;
		
		sinX = Math.sin(x);
		sinY = Math.sin(y);
		sinZ = Math.sin(z);
		cosX = Math.cos(x);
		cosY = Math.cos(y);
		cosZ = Math.cos(z);
		
		quat = [0, 0, 0, 1];
		
		quat[0] = sinZ * cosX * cosY - cosZ * sinX * sinY;
		quat[1] = cosZ * sinX * cosY + sinZ * cosX * sinY;
		quat[2] = cosZ * cosX * sinY - sinZ * sinX * cosY;
		quat[3] = cosZ * cosX * cosY + sinZ * sinX * sinY;
		
		quat4.normalize(quat);
		
		return quat;
	}
};