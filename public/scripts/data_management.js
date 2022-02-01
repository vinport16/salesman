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

function readBestScoreFromStorage(gameName){
  return readData(gameName) || {score: null, sequence_string: null};
}

function writeBestScoreToStorage(gameName, score, sequence_string){
  let oldBest= readData(gameName);
  // check that the current high score is not better
  if( !oldBest || oldBest.score > score){
    let newBest = {score: score, sequence: sequence_string};
    writeData(gameName, newBest);
  }
}
