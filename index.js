/*
const stockfish = require('stockfish')
const engine = await stockfish();

engine.onmessage = function (message) {
    console.log("received: " + message);
}

engine.postMessage('d');
*/

const express = require('express')
const app = express()
const port = 5000
const stockfish = require("stockfish");
const engine = stockfish();
const fenregex = "/^([rnbqkpRNBQKP1-8]+\/){7}([rnbqkpRNBQKP1-8]+)\s[bw]\s(-|K?Q?k?q?)\s(-|[a-h][36])\s(0|[1-9][0-9]*)\s([1-9][0-9]*)/"
//const regex = "/info.*score\s(cp\s-?\d+)/g";

engine.onmessage = function(msg) {
  console.log(msg);
};

//engine.postMessage("uci");

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.post('/', (request, response) => {

  //if (!request.body.fen.match(fenregex)) {
  if (!request.body.fen) {
    response.send("Invalid fen string");
    return;
  }
  
// if chess engine replies
  engine.onmessage = function(msg) {
    console.log(msg);
    // in case the response has already been sent?
    if (response.headersSent) {
        return;
    }
    // only send response when it is a recommendation
    const regex = /^info depth 20 .* nodes \d+ .*$/;
    if (typeof(msg == "string") && (msg.match(regex) && !msg.includes("lowerbound") 
      && !msg.includes("upperbound"))) {
        //response.send(msg);
        response.send(msg);
    }
  }

// run chess engine
  engine.postMessage("ucinewgame");
  engine.postMessage("position fen " + request.body.fen);
  engine.postMessage("go depth 20");
  //engine.postMessage("eval");//
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