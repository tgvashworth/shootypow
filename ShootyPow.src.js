window.log=function(){log.history=log.history||[];log.history.push(arguments);arguments.callee=arguments.callee.caller;if(this.console)console.log(Array.prototype.slice.call(arguments));};roundToDp=function(number,dp){var val=Math.round(number*Math.pow(10,dp))/Math.pow(10,dp);return(val>5/Math.pow(10,dp))?val:(val<-5/Math.pow(10,dp))?val:0;}
limit=function(number,min,max){return Math.min(Math.max(number,min),max);}
random=function(min,max){return(Math.random()*((max)-min)+min);}
distBetween=function(a,b){return Math.abs(Math.sqrt(Math.pow(b.x-a.x,2)+Math.pow(b.y-a.y,2)));}
window.requestAnimFrame=(function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(callback,element){window.setTimeout(callback,1000/60);};})();

var Res = {
   formations : [
      [ $V([0, 0]), $V([-15, -15]), $V([-15, 15]), $V([-15, 0]), $V([-30, 0]), $V([-30,-15]), $V([-30, 15]), $V([-30, -30]), $V([-30, 30]) ],
      [ $V([0, 0]), $V([0, -15]), $V([0, 15]), $V([0, -30]), $V([0, 30]), $V([0,-45]), $V([0, 45]), $V([0, -60]), $V([0, 60]) ],
      [ $V([0, 0]), $V([-5, -15]), $V([-5, 15]), $V([-10, -30]), $V([-10, 30]), $V([-15,-45]), $V([-15, 45]), $V([-20, -60]), $V([-20, 60]) ],
      [ $V([0, 0]), $V([-15, -10]), $V([-15, 10]), $V([-30, -20]), $V([-30, 20]), $V([-45,-30]), $V([-45, 30]), $V([-60, -40]), $V([-60, 40]) ],
      [ $V([0, 0]), $V([-10, -5]), $V([-10, 5]), $V([-15, -15]), $V([-15, 15]), $V([-25,-10]), $V([-25, 10]), $V([-30, -25]), $V([-30, 25]) ]
    ],
    keys : {
      left:37,up:38,right:39,down:40,space:32,
      alt:18,ctrl:17,shift:16,tab:9,enter:13,escape:27,backspace:8,
      comma: 188, period: 190,
      zero:48,one:49, two:50,three:51,four:52,
      five:53,six:57,seven:58,eight:59,nine:60,
      a:65,b:66,c:67,d:68,e:69,f:70,g:71,h:72,i:73,j:74,k:75,
      l:76,m:77,n:78,o:79,p:80,q:81,r:82,s:83,t:84,u:85,v:86,
      w:87,x:88,y:89,z:90
    },
    buildColour : function(rgb) {
      return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0.6)";
    }
};

var Bullet = function() {
  
  return {
    
  };
  
}

var Swarm = function(f, s, t) {
  
  var swarm = []
    , formation = f
    , size = s
    , ftPos = t
    , ftVel = 0
    , ftAngle = 0
    , ftMove = 2
    , ftMoveMax = 6
    , generate = function(pos, vel, target, rgb) { // rgb should be Array
        return {
          pos: pos,
          vel: vel,
          target: target,
          health: 50,
          radius: 3,
          colour: rgb,
          opacity: 1,
          maxSpeed: 6,
          maxTurn: 0.4
        }
      }
    , buildSwarm = function(rgb) {
        for(var i=0;i<size;i++) {
          var pos = $V([roundToDp(random(0,Game.width), 2), roundToDp(random(0,Game.height), 2)]);
          swarm[i] = generate(pos, $V([0, 5]), Res.formations[formation][i].add(ftPos), rgb);      
          log(pos, swarm[i]);
        }
      }  
  return {
    pos: ftPos,
    angle: ftAngle,
    vel: ftVel,
    move: ftMove,
    max: ftMoveMax,
    formation: formation,
    build: buildSwarm,
    get: function() { return swarm }
  }
};

var Player = function(id, rgb, keys) { // keys = { left, up, down, right, fire, prev, next }
  
  var swarm = Swarm(0, 9, $V([50,50]))
    , motion = {left : false, up : false, right : false, down: false}
    , keys = keys
    , handleKey = function(keyCode, down) {
        //console.log("HANDLEKEY:", this);
        switch(keyCode) {
          case Res.keys[keys.left]:
            motion.left = down;
            //console.log(id,"LEFT")
          break;
          case Res.keys[keys.up]:
            motion.up = down;
          break;
          case Res.keys[keys.right]:
            motion.right = down;
          break;
          /*case Res.keys[keys.down]:
            motion.down = down;
          break;*/
          case Res.keys[keys.prev]:
            if(down == false) {
              swarm.formation = (swarm.formation > 0) ? swarm.formation - 1 : Res.formations.length - 1;
            }
          break;
          case Res.keys[keys.next]:
            if(down == false) {
              swarm.formation = (swarm.formation < Res.formations.length - 1) ? swarm.formation + 1 : 0;
            }
          break;
          case Res.keys[keys.fire]:
            
          break;
        }
      }
    
  swarm.build(rgb, Game.width);
  
  return {
    id: id,
    rgb: rgb,
    motion: motion,
    swarm: swarm,
    handle: handleKey
  }  
  
};

var Game = (function() {
  
  // Private
  var canvas = document.getElementById('world')
    , context = canvas.getContext('2d')
    , WIDTH = canvas.width
    , HEIGHT = canvas.height
    , go = true
    , updates = 0
    , stepLength = 1000 / 30
    , maxUpdates = 10
    , currentStep = null
    , players = [null, null]
    , bullets = []
    , drawTarget = false
    , init = function() {
      
        console.log("INIT:", this);
        document.addEventListener('keydown',this.keyDown,false);
        document.addEventListener('keyup',this.keyUp,false);
        
        players[0] = Player('tom', [220,160,160], { left: "a", up: "w", right: "d", down: "s", fire: "space", prev: "q", next: "e" } );
        players[1] = Player('james', [160,220,160], { left: "left", up: "up", right: "right", down: "down", fire: "enter", prev: "comma", next: "period" } );
        
        currentStep = (new Date).getTime();
        
        run();
        
      }
    , run = function() {
        
        updates = 0;        
        
        // Logic loop
        while((new Date).getTime() > currentStep && updates < maxUpdates) {
             
          for(var i=0;i<2;i++) {
            logic(players[i]);
          }               
          
          currentStep += stepLength;
          updates++;
          
        }
        
        context.save();
        context.fillStyle = "rgba(255,255,255,0.2)";
        context.fillRect(0,0,WIDTH,HEIGHT);
        context.restore();
                
        for(var i=0;i<2;i++) {
          view(players[i]);
        }
        
        if( (new Date).getTime() - currentStep > 750 ) {
          currentStep = (new Date).getTime()
        }
        
        if(go) requestAnimFrame(run, canvas);
        
      }
    , logic = function(p) {
      
        var ftPos = p.swarm.pos
          , ftAngle = p.swarm.angle
          , ftVel = p.swarm.vel
          , ftMove = p.swarm.move
          , ftMoveMax = p.swarm.max
          , swarm = p.swarm.get();
      
        if(p.motion.left) ftAngle -= Math.PI/32;
        if(p.motion.up) ftVel += ftMove;
        if(p.motion.right) ftAngle += Math.PI/32;
        if(p.motion.down) ftVel -= ftMove;
              
        ftAngle = (ftAngle > Math.PI*2 ? ftAngle - Math.PI*2 : ftAngle);
        ftVel = limit(ftVel,-ftMoveMax,ftMoveMax) * 0.95;
        ftPos = ftPos.add($V([ftVel * Math.cos(ftAngle), ftVel * Math.sin(ftAngle)]));
        ftPos = $V([limit(ftPos.e(1),0,WIDTH), limit(ftPos.e(2),0,HEIGHT)]);
                            
        for(var j=0,l=swarm.length;j<l;j++) {
          
          var s = swarm[j];
          if(s == null) continue;
          
          //console.log(p.swarm.formation);
                  
          s.target = (Res.formations[p.swarm.formation][j]).add(ftPos);
          s.target = s.target.rotate(ftAngle, ftPos);
                  
          var desired = s.target.subtract(s.pos),
              d = desired.modulus();
          
          if(d > 0) {
            var desiredUnit = desired.toUnitVector();
            
            var accel;
            if(d < 50)
              accel = desiredUnit.multiply(s.maxSpeed*(d/60));
            else
              accel = desiredUnit.multiply(s.maxSpeed);
            
            var steer = accel.subtract(s.vel);
            
            if(steer.modulus() > s.maxTurn) {
              steer = steer.toUnitVector().multiply(s.maxTurn);
            }
            
            s.vel = s.vel.add(steer);
          }
          
          s.pos = s.pos.add(s.vel);
          s.pos = $V([limit(s.pos.e(1),0,WIDTH), limit(s.pos.e(2),0,HEIGHT)]);
                              
        } // End for(s in swarm)
        
        p.swarm.pos = ftPos
        p.swarm.angle = ftAngle
        p.swarm.vel = ftVel
      
      }
    , view = function(p) {
        var ftPos = p.swarm.pos
          , ftAngle = p.swarm.angle
          , ftVel = p.swarm.vel
          , swarm = p.swarm.get();
         
        if (drawTarget) { 
          context.save();
          context.beginPath();
          context.arc(ftPos.e(1),ftPos.e(2),1,0,Math.PI*2,true);
          context.closePath();
          context.fillStyle = 'rgba(0,0,0,0.4)';
          context.fill();
          context.restore();
        }
        
        var ftMD = $V([ftVel * Math.cos(ftAngle), ftVel * Math.sin(ftAngle)]).multiply(2);
        
        if (drawTarget) { 
          context.save();
          context.beginPath();
          context.moveTo(ftPos.e(1),ftPos.e(2));
          context.lineTo(ftPos.add(ftMD).e(1), ftPos.add(ftMD).e(2));
          context.closePath();
          context.strokeStyle = 'rgba(255,0,0,0.4)';
          context.stroke();
          context.restore();
        }
        
        for(var j=0,l=swarm.length;j<l;j++) {
            
            var s = swarm[j];
            if(s == null) continue;
            
            if (drawTarget) {
              context.save();
              context.beginPath();
              context.arc(s.target.e(1),s.target.e(2),1,0,Math.PI*2,true);
              context.closePath();
              context.fillStyle = 'rgba(0,0,0,0.4)';
              context.fill();
              context.restore();
            }
            
            context.save();
            context.beginPath();
            context.arc(s.pos.e(1),s.pos.e(2),s.radius,0,Math.PI*2,true);
            context.closePath();
            context.fillStyle = Res.buildColour(s.colour);
            context.fill();
            context.restore();
            
            context.save();
            context.beginPath();
            context.moveTo(s.pos.e(1),s.pos.e(2));
            context.lineTo(s.pos.add(s.vel).e(1), s.pos.add(s.vel).e(2));
            context.closePath();
            context.strokeStyle = 'rgba(0,0,0,0.4)';
            context.stroke();
            context.restore();
            
        }
      }
    , keyDownHandler = function(event) {
        var keyCode = event.keyCode;
        console.log(keyCode);
        players[0].handle(keyCode, true);
        players[1].handle(keyCode, true);
      }
    , keyUpHandler = function(event) {
        var keyCode = event.keyCode;
        players[0].handle(keyCode, false);
        players[1].handle(keyCode, false);
      }
  
  // Expose some member functions
  return {
    init: init,
    keyDown: keyDownHandler,
    keyUp: keyUpHandler,
    width: WIDTH,
    height: HEIGHT
  }
  
}());

Game.init();

/*
var Template = (function() {
  
  // Private
  var x = 10;
  
  // Expose some member functions
  return {
    x: x
  }
  
})()
*/