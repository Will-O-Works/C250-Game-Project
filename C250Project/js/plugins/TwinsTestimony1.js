var BHell = (function (my) {

/**
 * Bullet class. Represents a single bullet moving straight on the map.
 * @constructor
 * @memberOf BHell
 * @extends BHell.BHell_Sprite
 */
var BHell_Marching_Bullet = my.BHell_Marching_Bullet = function() {
    this.initialize.apply(this, arguments);
};

BHell_Marching_Bullet.prototype = Object.create(my.BHell_Sprite.prototype);
BHell_Marching_Bullet.prototype.constructor = BHell_Marching_Bullet;

BHell_Marching_Bullet.prototype.initialize = function (x, y, angle, params, bulletList) {
    var speed = 3;
    var sprite = "$TwinsBulletsBlack";
    var index = 0;
    var direction = 2;
    var frame = 0;
    var animated = false;
    var animationSpeed = 15;
    var grazed = false;
	var shoot_x = my.player.x;  // restore variable for sine shaped bullets by V.L.
	var count = 0;  // restore variable for sine shaped bullets by V.L.
	var type = "n"; 
	var timer = 60; 
	var a = 0; 
	
	//variable added to allow adjustable hitboxs YA 2020/10/26
    var hitboxshape = "dot";
    var hitboxheight = 0;
    var hitboxwidth = 0;
    var hitboxradius = 0;

    if (params != null) {
        speed = params.speed || speed;
        sprite = params.sprite || sprite;
        index = params.index || index;
        direction = params.direction || direction;
        frame = params.frame || frame;
        if (params.animated !== false) {
            animated = true;
        }
        animationSpeed = params.animation_speed || animationSpeed;
		shoot_x = params.shoot_x || my.player.x;   // restore variable for sine shaped bullets by V.L.
		count = params.count || count;   // restore variable for sine shaped bullets by V.L.
		type = params.type || type; 
		timer = params.timer || timer; 
		a = params.a || a; 
    }

    my.BHell_Sprite.prototype.initialize.call(this, sprite, index, direction, frame, animated, animationSpeed);

    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    this.rotation = angle + Math.PI / 2;

	this.sprite = sprite; 
	this.index = index; 
    this.x = x;
    this.y = y;
    this.z = 15;
    this.angle = angle;
    this.speed = speed;
    this.bulletList = bulletList;
    this.outsideMap = false;
	this.type = type; 
	this.timer = timer; 
	this.count = 0; 
	this.a = a; 
	
	this.hitboxshape = hitboxshape;
    this.hitboxradius = hitboxradius;
    this.hitboxheight = hitboxheight;
    this.hitboxwidth = hitboxwidth;
};

/**
 * Updates the bullet's position. If it leaves the screen, it's destroyed.
 */
BHell_Marching_Bullet.prototype.update = function () {
    my.BHell_Sprite.prototype.update.call(this);
	
	if (this.type == "s") {
		if (this.count < 50) {
			this.count += 1; 
			this.speed = 0; 
		} else {
			if (this.timer == 1) {
				this.angle = -Math.PI/2; 
			} else {
				this.angle = Math.PI/2; 
			}
			
			this.speed += 0.01; 
		}
		
	}

    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
	
	if (this.type == "h") {
		 if (this.x < -this.width || this.x > Graphics.width + this.width) { // V.L.
			this.outsideMap = true;
		}
	} else if (this.type == "v") {
		 if (this.y < -this.height || this.y > Graphics.height + this.height) { // V.L.
			this.outsideMap = true;
		}
	} else {
		if (this.y < -this.height || this.y > Graphics.height + this.height || this.x < -this.width || this.x > Graphics.width + this.width) {
			this.outsideMap = true;
		}
	}

	if (this.type == "d") {  // for emitter drop heart 
		if (this.count < 40) {
			this.count += 1; 
		}
		else {
			this.angle = Math.PI/2; 
			this.speed += 0.1; 
		}
	}
	
	if (this.type == "l") {  // for emitter linear
		if (this.count < this.timer) {
			this.count += 1; 
			this.speed = 0.98 * this.speed; 
		} else {
			this.destroy(); 
		}
	}
	
	if (this.type == "a") {  // for emitter linear
		this.speed += this.a; 
	}
	
	if (this.type == "t") {
		this.angle += 0.015; 
	}
};

BHell_Marching_Bullet.prototype.isOutsideMap = function () {
    return this.outsideMap;
};

// Add effects on bullet hit by V.L.
BHell_Marching_Bullet.prototype.hit_effect = function() {
	my.effects.push(new my.BHell_Hit_Effect(this.x, this.y, this.sprite, this.index, this.parent, my.effects));
};

/**
 * Removes the bullet from the screen and from its container.
 */
BHell_Marching_Bullet.prototype.destroy = function() {

	/*var bullet_effect = new my.BHell_Marching_Bullet(this.x, this.y, -Math.PI * Math.random(), this.bulletParams, this.bulletList);
    this.bulletList.push(bullet_effect); 
    this.parent.addChild(bullet_effect); */
	
    if (this.parent != null) {
        this.parent.removeChild(this);
    }
    this.bulletList.splice(this.bulletList.indexOf(this), 1); 
};

return my;
} (BHell || {}));


//=============================================================================
// Linear Bullet Emitters
//=============================================================================

var BHell = (function (my) {
	
	var BHell_Emitter_Linear = my.BHell_Emitter_Linear = function () {
        this.initialize.apply(this, arguments);
    };
	
	BHell_Emitter_Linear.prototype = Object.create(my.BHell_Emitter_Base.prototype);
    BHell_Emitter_Linear.prototype.constructor = BHell_Emitter_Linear;
	
    BHell_Emitter_Linear.prototype.initialize = function (x, y, params, parent, bulletList) {
        my.BHell_Emitter_Base.prototype.initialize.call(this, x, y, params, parent, bulletList);
		
		this.i = 0;
        this.parent = parent;
        this.params = params;
		
        this.bulletParams = {};
        this.bulletParams.sprite = this.params.sprite;
        this.bulletParams.index = this.params.index;
        this.bulletParams.direction = 6; //this.params.direction;
		
		this.num_bullet = 7; // number of bullets in a Testimony
		this.baseSpeed = 2.8; 
		this.angle = Math.PI / 2; 
		this.aim_type = 0; 
		this.b_x = this.x; 
		this.b_y = this.y; 
		this.count = 0; 
		
		if (params != null) {
			this.num_bullet = params.num_bullet || this.num_bullet;
			this.baseSpeed = params.baseSpeed || this.baseSpeed; 
			this.aim_type = params.aim_type || this.aim_type; 
        }

		this.shooting = false; // Every emitter is a finite-state machine, this parameter switches between shooting and non-shooting states.
        this.oldShooting = false; // Previous shooting state.
        this.j = 0; // Frame counter. Used for state switching.
    };

    BHell_Emitter_Linear.prototype.shoot = function () {
		
		if (this.count % 4 == 1) {
				
			if (this.aim_type == 1) {  // Shoot from top down
				
				this.b_x = my.player.x; 
				this.b_y = 0; 
				this.angle = Math.PI / 2; 

			} else if (this.aim_type == 2) {  // shoot from left or right
				
				if (this.b_x == 1) {
					this.b_x = Graphics.width - 1; 
					this.angle = Math.PI; 
				} else {
					this.b_x = 1; 
					this.angle = 0; 
				}
				this.b_y = my.player.y; 
				
			} else { // Shoot towards the player from the line
				
				var dx = my.player.x - this.x;
				var dy = my.player.y - this.y;
				this.angle = Math.atan2(dy, dx);
				this.b_x = this.x; 
				this.b_y = this.y; 
					
			} 
			
			for (var j = 1; j < this.num_bullet; j++) {
				this.bulletParams.speed = this.baseSpeed * j; 
				this.bulletParams.type = "l"; 
				this.bulletParams.timer = this.period; 

				var bullet = new my.BHell_Marching_Bullet(this.b_x, this.b_y, this.angle, this.bulletParams, this.bulletList);
				// console.log(bullet.type);
				this.parent.addChild(bullet);
				this.bulletList.push(bullet);
			}
			
		}
 		
		if (this.count % 4 == 2) {
			for (var b = 0; b < this.bulletList.length; b ++) {
				
				if (this.bulletList[b].type == "l") {
					var bp = {}; 
					bp.direction = 8; 
					bp.sprite = "$TwinsBulletsBlack"; 
				
					for (var j = 0; j < 6; j++) {
						bp.speed = 1 + j; 
						
						var bullet = new my.BHell_Bullet(this.bulletList[b].x, this.bulletList[b].y, this.bulletList[b].angle + Math.PI/2, bp, this.bulletList);
						this.parent.addChild(bullet);
						this.bulletList.push(bullet);
						
						var bullet = new my.BHell_Bullet(this.bulletList[b].x, this.bulletList[b].y, this.bulletList[b].angle - Math.PI/2, bp, this.bulletList);
						this.parent.addChild(bullet);
						this.bulletList.push(bullet);
					}

				}
			}
		}
		
		this.count += 1; 
		// console.log("shooting...");
    };


    return my;
} (BHell || {}));


//=============================================================================
// Marching Bullet Emitters
//=============================================================================

var BHell = (function (my) {
	
	var BHell_Emitter_Marching = my.BHell_Emitter_Marching = function () {
        this.initialize.apply(this, arguments);
    };
	
	BHell_Emitter_Marching.prototype = Object.create(my.BHell_Emitter_Base.prototype);
    BHell_Emitter_Marching.prototype.constructor = BHell_Emitter_Marching;
	
    BHell_Emitter_Marching.prototype.initialize = function (x, y, params, parent, bulletList) {
        my.BHell_Emitter_Base.prototype.initialize.call(this, x, y, params, parent, bulletList);
		
		this.i = 0;
        this.parent = parent;
        this.params = params;
		
        this.bulletParams = {};
        this.bulletParams.sprite = "$TwinsBulletsBlack";
        this.bulletParams.index = this.params.index;
        this.bulletParams.direction = this.params.direction;
		
		this.num_bullet = 12; // number of bullets in a Testimony
				
		this.baseSpeed = 3; 
		this.angle = 3 * Math.PI / 4; 
		
		if (params != null) {
            this.num_waves = params.num_waves || this.num_waves;
			this.num_bullet = params.num_bullet || this.num_bullet;
			this.attack_between = params.attack_between || this.attack_between;
			this.baseSpeed = params.baseSpeed || this.baseSpeed; 
        }

		this.shooting = false; // Every emitter is a finite-state machine, this parameter switches between shooting and non-shooting states.
        this.oldShooting = false; // Previous shooting state.
        this.j = 0; // Frame counter. Used for state switching.
    };

    BHell_Emitter_Marching.prototype.shoot = function () {
		
		this.attack_between = Graphics.width / this.num_bullet; // time between two major attacks
		
		for (var j = -5; j < this.num_bullet + 5; j++) {
			this.bulletParams.speed = this.baseSpeed; 
			this.bulletParams.type = "v"; 
			this.b_x = j * this.attack_between; 
			
			var bullet = new my.BHell_Marching_Bullet(this.b_x, 0, this.angle, this.bulletParams, this.bulletList);
			// console.log(bullet.type);
			this.parent.addChild(bullet);
			this.bulletList.push(bullet);
        }
		
		if (this.angle == 3 * Math.PI / 4) {
			this.angle = Math.PI / 4; 
		} else {
			this.angle = 3 * Math.PI / 4; 
		}
		for (var b = 0; b < this.bulletList.length; b ++) {
			
			if (this.bulletList[b].type == "v") {
				this.bulletList[b].angle = this.angle; 
			}
		}
		// console.log("shooting...");
    };


    return my;
} (BHell || {}));

//=============================================================================
// Opposite marching Bullet Emitters
//=============================================================================

var BHell = (function (my) {
	
	var BHell_Emitter_Opposite = my.BHell_Emitter_Opposite = function () {
        this.initialize.apply(this, arguments);
    };
	
	BHell_Emitter_Opposite.prototype = Object.create(my.BHell_Emitter_Base.prototype);
    BHell_Emitter_Opposite.prototype.constructor = BHell_Emitter_Opposite;
	
    BHell_Emitter_Opposite.prototype.initialize = function (x, y, params, parent, bulletList) {
        my.BHell_Emitter_Base.prototype.initialize.call(this, x, y, params, parent, bulletList);
		
		this.i = 0;
        this.parent = parent;
        this.params = params;
		
        this.bulletParams = {};
        this.bulletParams.sprite = "$TwinsBulletsBlack";
        this.bulletParams.index = this.params.index;
        this.bulletParams.direction = this.params.direction;
		
		this.num_bullet = 25; // number of bullets in a Testimony
		this.add_bullet = 5; 
		this.attack_between = Graphics.height / this.num_bullet; // time between two major attacks

		this.baseSpeed = 2; 
		this.angle = 0; 
		
		if (params != null) {
			this.num_bullet = params.num_bullet || this.num_bullet;
			this.attack_between = params.attack_between || this.attack_between;
			this.baseSpeed = params.baseSpeed || this.baseSpeed; 
        }
		
		this.shooting = false; // Every emitter is a finite-state machine, this parameter switches between shooting and non-shooting states.
        this.oldShooting = false; // Previous shooting state.
        this.j = 0; // Frame counter. Used for state switching.
    };

    BHell_Emitter_Opposite.prototype.shoot = function () {
		
		this.random_y = Math.random() * this.attack_between * this.add_bullet; 
		
		for (var j = -this.add_bullet; j < this.num_bullet; j++) {
			
			if ((j + this.add_bullet) % 10 >= 4) {
				this.angle = 0; 
			
				this.bulletParams.speed = this.baseSpeed; 
				this.bulletParams.type = "h"; 
				this.b_y = j * this.attack_between; 
			
				var bullet = new my.BHell_Marching_Bullet(0, this.random_y + this.b_y, this.angle, this.bulletParams, this.bulletList);
				this.parent.addChild(bullet);
				this.bulletList.push(bullet);
			}

        }
		
		this.random_y = Math.random() * this.attack_between * this.add_bullet; 
		
		for (var j = -this.add_bullet; j < this.num_bullet; j++) {
			
			if ((j + this.add_bullet) % 10 >= 4) {
				this.angle = Math.PI; 
			
				this.bulletParams.speed = this.baseSpeed; 
				this.bulletParams.type = "h"; 
				this.b_y = j * this.attack_between; 
			
				var bullet = new my.BHell_Marching_Bullet(Graphics.width, this.random_y + this.b_y, this.angle, this.bulletParams, this.bulletList);
				this.parent.addChild(bullet);
				this.bulletList.push(bullet);
			}

        }

		// console.log("shooting...");
    };


    return my;
} (BHell || {}));

//=============================================================================
// Crossing marching Bullet Emitters
//=============================================================================

var BHell = (function (my) {
	
	var BHell_Emitter_Cross = my.BHell_Emitter_Cross = function () {
        this.initialize.apply(this, arguments);
    };
	
	BHell_Emitter_Cross.prototype = Object.create(my.BHell_Emitter_Base.prototype);
    BHell_Emitter_Cross.prototype.constructor = BHell_Emitter_Cross;
	
    BHell_Emitter_Cross.prototype.initialize = function (x, y, params, parent, bulletList) {
        my.BHell_Emitter_Base.prototype.initialize.call(this, x, y, params, parent, bulletList);
		
		this.i = 0;
        this.parent = parent;
        this.params = params;
		
        this.bulletParams = {};
        this.bulletParams.sprite = "$TwinsBulletsBlack";
        this.bulletParams.index = this.params.index;
        this.bulletParams.direction = this.params.direction;
		
		this.num_bullet = 6; // number of bullets in a Testimony
		this.add_bullet = 15; 
		this.attack_between = Graphics.height / this.num_bullet; // time between two major attacks

		this.baseSpeed = 2; 
		this.angle = Math.PI / 4; 
		
		this.shooting = false; // Every emitter is a finite-state machine, this parameter switches between shooting and non-shooting states.
        this.oldShooting = false; // Previous shooting state.
        this.j = 0; // Frame counter. Used for state switching.
    };

    BHell_Emitter_Cross.prototype.shoot = function () {
		
		for (var j = -this.add_bullet; j < this.num_bullet + this.add_bullet; j++) {
			this.angle = Math.PI / 4; 
			
			this.bulletParams.speed = this.baseSpeed; 
			this.bulletParams.type = "v"; 
			this.b_x = j * this.attack_between; 
			
			var bullet = new my.BHell_Marching_Bullet(this.b_x, 0, this.angle, this.bulletParams, this.bulletList);
			this.parent.addChild(bullet);
			this.bulletList.push(bullet);
        }
		
		for (var j = -this.add_bullet; j < this.num_bullet + this.add_bullet; j++) {
			this.angle = 3 * Math.PI / 4; 
			
			this.bulletParams.speed = this.baseSpeed; 
			this.bulletParams.type = "v"; 
			this.b_x = j * this.attack_between; 
			
			var bullet = new my.BHell_Marching_Bullet(this.b_x, 0, this.angle, this.bulletParams, this.bulletList);
			this.parent.addChild(bullet);
			this.bulletList.push(bullet);
        }
		
		// console.log("shooting...");
    };


    return my;
} (BHell || {}));

//=============================================================================
// Updown marching Bullet Emitters
//=============================================================================

var BHell = (function (my) {
	
	var BHell_Emitter_Updown = my.BHell_Emitter_Updown = function () {
        this.initialize.apply(this, arguments);
    };
	
	BHell_Emitter_Updown.prototype = Object.create(my.BHell_Emitter_Base.prototype);
    BHell_Emitter_Updown.prototype.constructor = BHell_Emitter_Updown;
	
    BHell_Emitter_Updown.prototype.initialize = function (x, y, params, parent, bulletList) {
        my.BHell_Emitter_Base.prototype.initialize.call(this, x, y, params, parent, bulletList);
		
		this.i = 0;
        this.parent = parent;
        this.params = params;
		
        this.bulletParams = {};
        this.bulletParams.sprite = "$TwinsBulletsBlack";
        this.bulletParams.index = this.params.index;
        this.bulletParams.direction = 8; // this.params.direction;
		
		this.num_bullet = 12; // number of bullets in a Testimony
		this.attack_between = Graphics.width / this.num_bullet; // time between two major attacks

		this.baseSpeed = 1; 
		this.angle = Math.PI / 2; 
		this.count = 1; 
		
		this.shooting = false; // Every emitter is a finite-state machine, this parameter switches between shooting and non-shooting states.
        this.oldShooting = false; // Previous shooting state.
        this.j = 0; // Frame counter. Used for state switching.
    };

    BHell_Emitter_Updown.prototype.shoot = function () {
		
		this.center_x = Graphics.width / 4 + Graphics.width / 2 * Math.random() ; 
		if (this.count == 0) {
			this.b_y = Graphics.height - 1; 
			this.angle = - Math.PI / 2; 
			this.count = 1; 
		} else {
			this.b_y = 0; 
			this.angle = Math.PI / 2; 
			this.count = 0; 
		}
		
		for (var j = 0; j < this.num_bullet; j++) {
			
			for (var k = 0; k < 5; k ++) {
				
				this.bulletParams.speed = this.baseSpeed + k / 2; 
				this.bulletParams.type = "a"; 
				this.bulletParams.a = (this.num_bullet - j) / 150; 
				this.b_x = this.center_x + j * this.attack_between; 
				
				var bullet = new my.BHell_Marching_Bullet(this.b_x, this.b_y, this.angle, this.bulletParams, this.bulletList);
				this.parent.addChild(bullet);
				this.bulletList.push(bullet);
				
				this.b_x = this.center_x - j * this.attack_between; 
				var bullet = new my.BHell_Marching_Bullet(this.b_x, this.b_y, this.angle, this.bulletParams, this.bulletList);
				this.parent.addChild(bullet);
				this.bulletList.push(bullet);
			}

        }
		
		// console.log("shooting...");
    };


    return my;
} (BHell || {}));


//=============================================================================
// Ring Bullet Emitters
//=============================================================================

var BHell = (function (my) {
	
	var BHell_Emitter_Ring = my.BHell_Emitter_Ring = function () {
        this.initialize.apply(this, arguments);
    };
	
	BHell_Emitter_Ring.prototype = Object.create(my.BHell_Emitter_Base.prototype);
    BHell_Emitter_Ring.prototype.constructor = BHell_Emitter_Ring;
	
    BHell_Emitter_Ring.prototype.initialize = function (x, y, params, parent, bulletList) {
        my.BHell_Emitter_Base.prototype.initialize.call(this, x, y, params, parent, bulletList);
		
		this.i = 0;
        this.parent = parent;
        this.params = params;
		
        this.bulletParams = {};
        this.bulletParams.index = this.params.index;
        this.bulletParams.direction = 6;
		this.bulletParams.phase = 1; 
		
		this.num_bullet = 24; 
		this.angle = Math.PI - Math.PI / 4; 
		this.baseSpeed = 0; 
		this.timer = 0; 
		
		this.center_x = Graphics.width / 2; // Graphics.width - 200; 
		this.center_y = Graphics.height - 125; // Graphics.height / 2; 
		
		if (params != null) {
			this.num_bullet = params.num_bullet || this.num_bullet;
			this.attack_between = params.attack_between || this.attack_between;
			this.type = params.type || this.type; 
        }
		
		this.shooting = false; // Every emitter is a finite-state machine, this parameter switches between shooting and non-shooting states.
        this.oldShooting = false; // Previous shooting state.
        this.j = 0; // Frame counter. Used for state switching.
    };

    BHell_Emitter_Ring.prototype.shoot = function () {
		
		for (var n = 0; n < this.num_bullet; n++) {
			this.aimingAngle = this.angle + 3/2 * Math.PI / this.num_bullet * n;
				
			var bullet = new my.BHell_Marching_Bullet(this.center_x, this.center_y, this.aimingAngle, this.bulletParams, this.bulletList);
			this.parent.addChild(bullet);
			this.bulletList.push(bullet);
				
		}
			
		this.angle += Math.PI / this.num_bullet; 
		
    };


    return my;
} (BHell || {}));

//=============================================================================
// TwinsTestimony1 Pattern 1
//=============================================================================
var BHell = (function (my) {

    var BHell_Enemy_TwinsTestimony1_p1 = my.BHell_Enemy_TwinsTestimony1_p1 = function() {
        this.initialize.apply(this, arguments);
    };

    BHell_Enemy_TwinsTestimony1_p1.prototype = Object.create(my.BHell_Enemy_Base.prototype);
    BHell_Enemy_TwinsTestimony1_p1.prototype.constructor = BHell_Enemy_TwinsTestimony1_p1;

	BHell_Enemy_TwinsTestimony1_p1.prototype.initialize = function(x, y, image, params, parent, enemyList) {
        params.hp = 75;
        params.speed = 25;
        params.hitbox_w = 364;
        params.hitbox_h = 72;
        params.animated = false;
        my.BHell_Enemy_Base.prototype.initialize.call(this, x, y, image, params, parent, enemyList);
		this.mover = new my.BHell_Mover_Still(Graphics.width / 2, 125, 0, this.hitboxW, this.hitboxH);
		this.bombedWrong = false; 

		var emitterParams = {};
		emitterParams.period = 40; 
		emitterParams.aim = true;
		emitterParams.alwaysAim = true;
		emitterParams.bullet = {};
        emitterParams.bullet.direction = 6;
		emitterParams.bullet.sprite = "$TwinsBulletsBlack";
        emitterParams.bullet.index = 0;

		// set player.can_bomb to true by V.L.
		my.player.can_bomb = true; 
		my.player.currentLine = 0;
		
		this.emitters.push(new my.BHell_Emitter_Marching(this.x, this.y, emitterParams, parent, my.enemyBullets));
		
		emitterParams.period = 60; 
		emitterParams.aim_type = 1; 
		this.emitters.push(new my.BHell_Emitter_Linear(this.x, this.y, emitterParams, parent, my.enemyBullets));
    };

	BHell_Enemy_TwinsTestimony1_p1.prototype.destroy = function() {

		//adding these to the correct line allow it to transition to a different phase
		my.player.PhaseOver = true;
		my.player.nextMap = Number(19);//the 3 here is the map number change this to whatever map number u want to transition there on victory
			
		/* inherit destroy function from BHell_Enemy_Base by V.L. */
		my.BHell_Enemy_Base.prototype.destroy.call(this);
		/* inherit destroy function from BHell_Enemy_Base by V.L. */
	};
	
    return my;
} (BHell || {}));



//=============================================================================
// TwinsTestimony1 Pattern 2
//=============================================================================
var BHell = (function (my) {

    var BHell_Enemy_TwinsTestimony1_p2 = my.BHell_Enemy_TwinsTestimony1_p2 = function() {
        this.initialize.apply(this, arguments);
    };

    BHell_Enemy_TwinsTestimony1_p2.prototype = Object.create(my.BHell_Enemy_Base.prototype);
    BHell_Enemy_TwinsTestimony1_p2.prototype.constructor = BHell_Enemy_TwinsTestimony1_p2;

	BHell_Enemy_TwinsTestimony1_p2.prototype.initialize = function(x, y, image, params, parent, enemyList) {
        params.hp = 75;
        params.speed = 25;
        params.hitbox_w = 394;
        params.hitbox_h = 78;
        params.animated = false;
        my.BHell_Enemy_Base.prototype.initialize.call(this, x, y, image, params, parent, enemyList);
		this.mover = new my.BHell_Mover_Still(Graphics.width / 2, 125, 0, this.hitboxW, this.hitboxH);
		this.bombedWrong = false; 

		var emitterParams = {};
		emitterParams.period = 75; 
		emitterParams.aim = true;
		emitterParams.alwaysAim = true;
		emitterParams.bullet = {};
        emitterParams.bullet.direction = 6;
		emitterParams.bullet.sprite = "$TwinsBulletsBlack";
        emitterParams.bullet.index = 0;

		// set player.can_bomb to true by V.L.
		my.player.can_bomb = false; 
		my.player.currentLine = 1;
		
		this.emitters.push(new my.BHell_Emitter_Opposite(this.x, this.y, emitterParams, parent, my.enemyBullets));
		
		emitterParams.period = 60; 
		emitterParams.aim_type = 2; 
		emitterParams.num_bullet = 10; 
		this.emitters.push(new my.BHell_Emitter_Linear(this.x, this.y, emitterParams, parent, my.enemyBullets));

    };
		
	BHell_Enemy_TwinsTestimony1_p2.prototype.update = function() {
		
		if (this.bombedWrong == true) {
			// Write the bombedWrong penalty in here
			this.emitters[0].baseSpeed = 4; 
			this.emitters[0].period = 50; 
		}
		
		/* inherit update function from BHell_Enemy_Base by V.L. */
		my.BHell_Enemy_Base.prototype.update.call(this);
		/* inherit update function from BHell_Enemy_Base by V.L. */
	} 
	
	
    return my;
} (BHell || {}));


//=============================================================================
// TwinsTestimony1 Pattern 3
//=============================================================================
var BHell = (function (my) {

    var BHell_Enemy_TwinsTestimony1_p3 = my.BHell_Enemy_TwinsTestimony1_p3 = function() {
        this.initialize.apply(this, arguments);
    };

    BHell_Enemy_TwinsTestimony1_p3.prototype = Object.create(my.BHell_Enemy_Base.prototype);
    BHell_Enemy_TwinsTestimony1_p3.prototype.constructor = BHell_Enemy_TwinsTestimony1_p3;

	BHell_Enemy_TwinsTestimony1_p3.prototype.initialize = function(x, y, image, params, parent, enemyList) {
        params.hp = 75;
        params.speed = 25;
        params.hitbox_w = 334;
        params.hitbox_h = 72;
        params.animated = false;
        my.BHell_Enemy_Base.prototype.initialize.call(this, x, y, image, params, parent, enemyList);
		this.mover = new my.BHell_Mover_Still(Graphics.width / 2, 125, 0, this.hitboxW, this.hitboxH);
		this.bombedWrong = false; 

		var emitterParams = {};
		emitterParams.period = 75; 
		emitterParams.aim = true;
		emitterParams.alwaysAim = true;
		emitterParams.bullet = {};
        emitterParams.bullet.direction = 6;
		emitterParams.bullet.sprite = "$TwinsBulletsBlack";
        emitterParams.bullet.index = 0;

		// set player.can_bomb to true by V.L.
		my.player.can_bomb = false; 
		my.player.currentLine = 2;
		
		this.emitters.push(new my.BHell_Emitter_Cross(this.x, this.y, emitterParams, parent, my.enemyBullets));
		
		emitterParams.period = 60; 
		emitterParams.aim_type = 3; 
		this.emitters.push(new my.BHell_Emitter_Linear(this.x, this.y, emitterParams, parent, my.enemyBullets));

    };
	
	BHell_Enemy_TwinsTestimony1_p3.prototype.update = function() {
		
		if (this.bombedWrong == true) {
			// Write the bombedWrong penalty in here
			this.emitters[0].baseSpeed = 4; 
			this.emitters[0].period = 50; 
		}
		
		/* inherit update function from BHell_Enemy_Base by V.L. */
		my.BHell_Enemy_Base.prototype.update.call(this);
		/* inherit update function from BHell_Enemy_Base by V.L. */
	} 
	
    return my;
} (BHell || {}));