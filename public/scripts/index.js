var table = document.getElementById("puzzleList");

let rowdat = [];

for(let i = 0; i < puzzledata.length; i++){
  let bs = readBestScoreFromStorage(puzzledata[i].name);
  if(bs.crown && !about_equal(bs.score, puzzledata[i].best)){
    uncrown(puzzledata[i].name);
  }
  rowdat.push({name: puzzledata[i].name,
  yourbest: bs.score,
  best: puzzledata[i].best,
  crown: bs.crown});
}

function about_equal(a, b){
  return(Math.abs(a - b) < 0.00001);
}

// determine display order bucket
function rowscore(row){
  if(row.best == null){
    return(0); // last
  }else if(row.yourbest == null){
    return(3); // first
  }else if(row.yourbest > row.best && !about_equal(row.yourbest, row.best)){
    return(2);
  }else{
    // you have achieved the best score
    return(1);
  }
};

rowdat.sort((a, b) => {
  return(a.name.localeCompare(b.name));
}).sort((a, b) => {
  let delta = rowscore(b) - rowscore(a);
  if(delta == 0){
    // sort secondarily on score difference
    if(a.yourbest == null || b.yourbest == null){
      return(0);
    }
    let adif = a.yourbest - a.best;
    let bdif = b.yourbest - b.best;
    // if row difference is zero, list larger scores first
    if(bdif - adif == 0){
      return(b.best - a.best);
    }else{
      return(bdif - adif);
    }
  }else{
    return(delta);
  }
});

for(let i = 0; i < rowdat.length; i++){
  let row = document.createElement("tr");

  let name = document.createElement("td");
  let link = document.createElement("a");
  link.innerText = rowdat[i].name;
  link.href = "/game.html?puzzle=" + rowdat[i].name;
  name.appendChild(link);
  row.appendChild(name);

  let yourbest = document.createElement("td");
  let yourbestscore = rowdat[i].yourbest;
  yourbest.innerText = round(yourbestscore) || "";
  row.appendChild(yourbest);

  let best = document.createElement("td");
  let bestscore = rowdat[i].best;
  best.innerText = round(bestscore) || "";
  row.appendChild(best);

  let diff = document.createElement("td");
  if(rowdat[i].best && rowdat[i].yourbest){
    diff.innerText = "∆ "+round(rowdat[i].yourbest - rowdat[i].best);
    if(rowdat[i].best >= rowdat[i].yourbest){
      row.classList.add("completed");
    }else{
      row.classList.add("attempted");
    }
  }
  row.appendChild(diff);

  if(rowdat[i].crown){
    diff.innerText = diff.innerText + " 👑";
  }

  table.children[0].appendChild(row);
}

function round(f){
  if(f == null){
    return null;
  }
  return Math.round(f * 100) / 100
}
