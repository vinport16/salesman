const current_version = 1;

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
  console.log(version, !version, version == current_version);
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
