const current_version = 2;

// convert value to JSON before storage
function writeData(key, value){
  let json_value = JSON.stringify(value);
  localStorage.setItem(key, json_value);
}

// convert value from JSON
function readData(key){
  let val = localStorage.getItem(key);
  return JSON.parse(val);
}

function current(version){
  if(!version){
    return false;
  }
  return version == current_version;
}

function readBestScoreFromStorage(gameName){
  let dat = readData(gameName) || {score: null, sequence_string: null, version: current_version};
  // make sure major version is the same
  if(!current(dat.version)){
    return {score: null, sequence_string: null, version: current_version};
  }else{
    // if there was a breaking change, data must be cleared
    return dat;
  }
}

function writeBestScoreToStorage(gameName, score, sequence_string){
  let oldBest= readData(gameName);
  // check that the current high score is not blank, wrong version, or better
  if( !oldBest || !current(oldBest.version) || oldBest.score > score){
    let newBest = {score: score, sequence: sequence_string, version: current_version};
    writeData(gameName, newBest);
  }
}

function getBestScoreFromServer(gameName){
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", "/bestscore?puzzle="+gameName, false ); // false for synchronous request
  xmlHttp.send();
  let score = xmlHttp.responseText
  if(score == "null" || score == "NO RECORD"){
    return(null);
  }else{
    return(parseFloat(score));
  }
}

function crown(gameName){
  let score_info = readBestScoreFromStorage(gameName);
  score_info.crown = true;
  writeData(gameName, score_info);
}

function uncrown(gameName){
  let score_info = readBestScoreFromStorage(gameName);
  score_info.crown = false;
  writeData(gameName, score_info);
}

function sendBestScoreToServer(gameName, score, sequence_string){
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/newbest", true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function(e) {
    if(xhr.readyState === 4){
      if(xhr.status === 200){
        console.log("GOOOD DATA");
        crown(gameName);
      }else{
        console.log("BAD DATA. REJECtED");
      }
    }
  }
  xhr.send(JSON.stringify({
      name: gameName,
      score: score,
      sequence: sequence_string,
  }));
}
