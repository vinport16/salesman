var express = require('express')
var app = express();
var http = require('http').createServer(app);
var fs = require('fs');
var port = process.env.PORT || 8080;
http.listen(port);
console.log("listening on port "+port);

// setup environment
if (!fs.existsSync('./dat')){
    fs.mkdirSync('./dat');
}
fs.writeFile("dat/names.json", `{"Michael": {"best": null, "sequence": null, "attempts": 0, "overthrows": 0, "date": null }}`, { flag: 'wx' }, function(err) {
  if(err) {
    if(err.code == 'EEXIST'){
      console.log("dat/names.json exists");
    }else{
      console.log(err);
    }
  } else {
    console.log("dat/names.json created");
  }
});

function updatePuzzleData(puzzles){
  let pd = "var puzzledata = ["
  for (let [key, value] of Object.entries(puzzles)) {
    pd += JSON.stringify({name: key, best: value.best}) + ",";
  }
  pd += "];"
  fs.writeFile("dat/puzzledata.js", pd, { flag: 'w' }, function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("dat/puzzledata.js updated");
    }
  });
}

var puzzles = JSON.parse(fs.readFileSync('dat/names.json'));
updatePuzzleData(puzzles);

app.use(express.static('public'))

app.get('/', function(req, res){
  res.sendFile(__dirname + 'public/index.html');
});

app.get('/bestscore', function(req, res){
  let p = puzzles[req.query.puzzle];
  if(p){
    let best = p.best || "null";
    res.send(""+best);
  }else{
    res.send("NO RECORD");
  }
});

app.get('/puzzledata.js', function(req, res){
  res.sendFile(__dirname + '/dat/puzzledata.js');
});
