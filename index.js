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
    if (typeof(msg == "string") && msg.match("bestmove")) {
        response.send(msg);
    }

    if (typeof(msg == "string") && msg.match("Total evaluation")) {
        response.send(msg);
    }//
  }

// run chess engine
  engine.postMessage("ucinewgame");
  engine.postMessage("position fen " + request.body.fen);
  engine.postMessage("go depth 18");
  engine.postMessage("eval");//
});

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})


//"stockfish": "^11.0.0"