var table = document.getElementById("puzzleList");


for(let i = 0; i < puzzledata.length; i++){
  let row = document.createElement("tr");

  let name = document.createElement("td");
  let link = document.createElement("a");
  link.innerText = puzzledata[i].name;
  link.href = "/game.html?puzzle=" + puzzledata[i].name;
  name.appendChild(link);
  row.appendChild(name);

  let yourbest = document.createElement("td");
  let yourbestscore = readBestScoreFromStorage(puzzledata[i].name).score;
  yourbest.innerText = round(yourbestscore) || "";
  row.appendChild(yourbest);

  let best = document.createElement("td");
  let bestscore = puzzledata[i].best;
  best.innerText = round(bestscore) || "";
  row.appendChild(best);

  table.children[0].appendChild(row);
}

function round(f){
  if(f == null){
    return null;
  }
  return Math.round(f * 100) / 100
}
