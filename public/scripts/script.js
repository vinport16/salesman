var canvas = document.getElementById("canvas");
var canvasparent = document.getElementById("canvasparent");
var ctx = canvas.getContext('2d');
var current_distance = document.getElementById("distance");
var bestscore = document.getElementById("best");
var clearbutton = document.getElementById("clear");
var restorebutton = document.getElementById("restore");
const alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','!','@','#','$','%','^','&','*','<','>','?','|'];
const puzzleName = (new URLSearchParams(window.location.search)).get('puzzle');
const seed = puzzleName.hashCode();
const rng = new PRNG(seed);
const canvas_height = 85; // in vh (from style.css)
const canvas_width = 50;   // in vh (from style.css)
const worldwidth = canvas_width * 2;
const worldheight = canvas_height * 2;
const dotradius = 6;
var scale_factor = canvas.width/worldwidth; // reset in adjust_canvas
var lineWidth = canvas.width/50; // reset in adjust_canvas
const lineColor = "#1982C4";
const dotInPath = "inpath";
const dotSolo = "solo";
const dotSelected = "selected";
const dotEnd = "end";

// minimum number of dots that can be placed within the boundaries of the world
// that would make it impossible to place another dot without overlapping.
// calculated by using https://www.engineeringtoolbox.com/circles-within-rectangle-d_1905.html
// with canvas height, width, and dotradius * 4 (dots can be 4 radius away and effectively
// prevent a third dot from being placed between them) (28)
const numdots = Math.floor(rng.next(19,26));
//numdots = 5;
var dots = [];
var linestate = {
  attempts: {},
  best: 99999999999999,
  beststate: null,
  line: [],
  click: function(dot){
    if(this.line.includes(dot)){
      if(this.line.length > 1){
        if(this.line[this.line.length-1] == dot){
          // undo last move
          this.line.pop();
        }else if(this.line.length == numdots){
          // remove this dot, rotate list
          let idx = this.line.indexOf(dot);
          let newend = this.line.slice(0,idx);
          let newstart = this.line.slice(idx+1,this.line.length);
          this.line = newstart.concat(newend);
        }else if(this.line[0] == dot){
          // clicked on last dot: make that current selected dot
          this.line.reverse();
        }
      }else{
        // undo first move
        this.line.pop();
      }
    }else{
      // draw line to new dot
      this.line.push(dot);
    }
    current_distance.innerText = round(this.current_length());
    if(this.line.length == numdots){
      this.register_solution();
    }
  },
  toString: function(){
    // assumes this is a valid loop
    // order the attempt: start at A, and flip if
    // the second element is later than the last element
    let idx = this.line.indexOf(this.line.find(dot => dot.element.children[0].innerText == "A"));
    let newend = this.line.slice(0,idx+1);
    let newstart = this.line.slice(idx+1,this.line.length);
    this.line = newstart.concat(newend);
    if(this.line[1].element.children[0].innerText > this.line[this.line.length-1].element.children[0].innerText){
      this.line.reverse();
    }
    return this.line.map(dot => dot.element.children[0].innerText).join("");
  },
  register_solution: function(){
    let attemptstring = this.toString();
    let length = this.current_length();
    this.attempts[attemptstring] = length;
    if(length < this.best){
      flashScore(round(length));
      this.best = length;
      // shallow copy
      this.beststate = [...this.line];
      // write to local storage
      writeBestScoreToStorage(puzzleName, length, attemptstring);
    }
    restorebutton.disabled = false;
  },
  current_length: function(){
    let l = 0;
    for(let i = 0; i < this.line.length - 1; i++){
      l += distance(this.line[i], this.line[i+1]);
    }
    if(this.line.length == numdots){
      l += distance(this.line[0], this.line[this.line.length-1]);
    }
    return l;
  },
};

clearbutton.onclick = function(){
  linestate.line = [];
  current_distance.innerText = round(linestate.current_length());
  drawState(linestate, dots);
}

restorebutton.onclick = function(){
  // shallow copy
  linestate.line = [...linestate.beststate];
  current_distance.innerText = round(linestate.current_length());
  drawState(linestate, dots);
}

var round = function(f){
  return Math.round(f * 100) / 100
}

var connect_dots = function(d1, d2){
  let v1 = {x:d1.x, y:worldheight-d1.y};
  let v2 = {x:d2.x, y:worldheight-d2.y};
  v1 = multiply(v1, scale_factor);
  v2 = multiply(v2, scale_factor);
  drawLineWidth(v1, v2, lineColor, lineWidth);
}

var drawState = function(state, dots){
  clearCanvas();
  let last = state.line.length - 1;
  for(let i = 0; i < dots.length; i++){
    setDotColor(dots[i], dotSolo);
  }
  for(let i = 0; i < state.line.length-1; i++){
    setDotColor(state.line[i], dotInPath);
    connect_dots(state.line[i], state.line[i+1]);
  }
  if(state.line.length == dots.length && dots.length > 0){
    // last dot is in the loop
    setDotColor(state.line[last], dotInPath);
    // connect first and last
    connect_dots(state.line[0], state.line[last]);
  }else{
    // last dot is selected
    if(state.line.length > 0){
      setDotColor(state.line[last], dotSelected);
    }
    // first dot is the end
    if(state.line.length > 1){
      setDotColor(state.line[0], dotEnd);
    }
  }
}

var setDotColor = function(dot, className){
  dot.element.classList.remove(dotInPath);
  dot.element.classList.remove(dotSolo);
  dot.element.classList.remove(dotSelected);
  dot.element.classList.remove(dotEnd);
  dot.element.classList.add(className);
}

var createDot = function(p, text){
  let dot = document.createElement("span");
  dot.className = "dot";
  dot.classList.add(dotSolo);
  dot.style.position = "absolute";
  dot.style.top = (canvas_height-(p.y+dotradius)/2) +"vh";
  dot.style.left = ((p.x-dotradius)/2) +"vh";
  let content = document.createElement("div");
  content.className = "dottext";
  content.innerText = text;
  dot.appendChild(content);
  return dot;
}

function distance(v1, v2){
  return Math.sqrt( (v1.x-v2.x)*(v1.x-v2.x) + (v1.y-v2.y)*(v1.y-v2.y) );
}

function flashScore(newbest){
  bestscore.innerText = newbest;
	bestscore.classList.remove("fading");
  bestscore.offsetWidth;
  bestscore.classList.add("fading");
}

var adjust_canvas = function(){
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
  scale_factor = canvas.width/worldwidth;
  lineWidth = canvas.width/18;
  drawState(linestate, dots);
}
adjust_canvas();
window.onResize = adjust_canvas;





var dot_overlaps = function(newdot, otherdots){
  for(let i = 0; i < otherdots.length; i++){
    if(distance(newdot, otherdots[i]) < 2 * dotradius){
      return true;
    }
  }
  return false;
}

for(let i = 0; i < numdots; i++){
  let dot = {x:rng.next(dotradius,worldwidth-dotradius), y:rng.next(dotradius,worldheight-dotradius)};
  if(dot_overlaps(dot, dots)){
    // redo
    i--;
  }else{
    dots.push(dot);
  }
}

for(let i = 0; i < numdots; i++){
  let dot = createDot(dots[i], alphabet[i]);
  dots[i].element = dot;
  dot.onclick = function(){
    linestate.click(dots[i]);
    drawState(linestate, dots);
  }
  canvasparent.appendChild(dot);
}

// check if a best score was stored
let best = readBestScoreFromStorage(puzzleName);
if(best.score){
  bestscore.innerText = round(best.score);
  linestate.best = best.score;
  // rebuild sequence to store as linestate.beststate
  linestate.beststate = [];
  for(let i = 0; i < best.sequence.length; i++){
    let dot = dots.find(dot => dot.element.children[0].innerText == best.sequence[i]);
    linestate.beststate.push(dot);
  }
  restorebutton.disabled = false;
}else{
  restorebutton.disabled = true;
}