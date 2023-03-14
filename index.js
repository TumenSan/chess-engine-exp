const express = require('express')
const app = express()
const port = 6000
const stockfish = require("stockfish");
const engine = stockfish();
const fenMiddleware = require("./fenMiddleware");

engine.onmessage = function(msg) {
  console.log(msg);
};

//engine.postMessage("uci");

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(fenMiddleware);

let depth = 20;

app.get('/', (req, res) => {
  response.send('post body any fen in /estimation or /bestmove');
});

app.post('/', (req, res) => {
  response.send('post body any fen in /estimation or /bestmove');
});

app.post('/estimation', (req, res) => {
// if chess engine replies
  engine.onmessage = function(msg) {
    console.log(msg);
    // in case the response has already been sent?
    if (res.headersSent) {
        return;
    }
    // only send response when it is a recommendation
    //const regex = "/info.*score\s(cp\s-?\d+)/g";
    const regex = new RegExp(`^info depth ${depth} .* nodes \\d+ .*$`);
    if (typeof(msg == "string") && regex.test(msg) && !msg.includes("lowerbound") 
      && !msg.includes("upperbound")) {
        let arr = fen.split(" ");
        let color = "white move";
        if(arr[1] == "w")
          color = "white move";
        else color = "black move";
        res.send(`${color} ${msg}`);
    }
  }

  let fen = req.body.fen;
// run chess engine
  engine.postMessage("ucinewgame");
  engine.postMessage("position fen " + fen);
  engine.postMessage(`go depth ${depth}`);
  //engine.postMessage("eval");//
});

app.post('/bestmove', (req, res) => {
// if chess engine replies
  engine.onmessage = function(msg) {
    console.log(msg);
    // in case the response has already been sent?
    if (res.headersSent) {
        return;
    }
    // only send response when it is a recommendation
    if (typeof(msg == "string") && msg.match("bestmove")) {
      let arr = fen.split(" ");
      let color = "white move";
      if(arr[1] == "w")
        color = "white move";
      else color = "black move";
      res.send(`${color} ${msg}`);
    }
  }

  let fen = req.body.fen;
// run chess engine
  engine.postMessage("ucinewgame");
  engine.postMessage("position fen " + fen);
  engine.postMessage(`go depth ${depth}`);
});

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})

//3rr2k/ppp1q1pp/8/8/2PR4/1QP5/P4PPP/5RK1 w - - 5 23
//r1bqkb1r/ppp2ppp/2n2n2/3pp1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 5
//"stockfish": "^11.0.0"