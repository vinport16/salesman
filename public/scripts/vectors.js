var zeroVector = {x:0,y:0};

function getVector(e){
  return {x: e.clientX - canvas.parentElement.offsetLeft, y: e.clientY - canvas.parentElement.offsetTop};
}

function relative(position, state){
  return subtract(position, state.position);
}

function absolute(position, state){
  return add(position, state.position);
}

function subtract(v1, v2){
  return {x: v1.x-v2.x, y: v1.y-v2.y};
}

function add(v1, v2){
  return {x: v1.x+v2.x, y: v1.y+v2.y};
}

function divide(v1,n){ //divide a vector by a number
  return {x: v1.x/n, y: v1.y/n};
}

function multiply(v1,n){ //multiply a vector by a number
  return {x: v1.x*n, y: v1.y*n};
}

function distance(v1, v2){
  return Math.sqrt( (v1.x-v2.x)*(v1.x-v2.x) + (v1.y-v2.y)*(v1.y-v2.y) );
}

function unitVector(v){
  return divide(v, distance(zeroVector,v));
}

function duplicate(v){
  var x1 = v.x;
  var y1 = v.y;

  var v1 = {x:x1,y:y1};
  return v1;
}

function rotateVector(vec, ang){
    ang = -ang * (Math.PI/180);
    var cos = Math.cos(ang);
    var sin = Math.sin(ang);
    return {x: Math.round(10000*(vec.x * cos - vec.y * sin))/10000, y: Math.round(10000*(vec.x * sin + vec.y * cos))/10000};
}
