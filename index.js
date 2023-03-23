const express = require('express')
const app = express()
const port = 6000
const stockfish = require("stockfish");
const engine = stockfish();
const fenMiddleware = require("./fenMiddleware");

app.use(express.json()); // for parsing application/json

//брокер rabbitmq
const amqp = require("amqplib");
var channel, connection;
var Answer;

connectQueue() // call connectQueue function
async function connectQueue() {
    try {

        //amqp://localhost:5672
        //amqp://user1:password1@localhost:5672
        connection = await amqp.connect("amqp://user1:password1@localhost:5672");
        channel = await connection.createChannel()
        
        // connect to 'test-queue', create one if doesnot exist already
        await channel.assertQueue("test-queue")

        channel.consume("test-queue", data => {
          // console.log(data)
          let dataJson = JSON.parse(data.content.toString());
          let est = estimation(dataJson);
          console.log(est + '   !!!!!');
          console.log(Answer + '   !!!123');
          channel.ack(data);
          //return(est);
        })
        
    } catch (error) {
        console.log(error)
    }
}


//движок
engine.onmessage = function(msg) {
  console.log(msg);
};

//engine.postMessage("uci");

app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//app.use(fenMiddleware);

// estimation or bestmove

function estimation(game){
  console.log(game)

  let depth = game.depth;

  // if chess engine replies
  engine.onmessage = function(msg) {
    console.log(msg);
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
        let Conclusion = color + ' ' + msg;
        console.log(Conclusion);
        Answer = Conclusion;
        return Conclusion;
    }
  }

  let fen = game.fen;
  // run chess engine
  engine.postMessage("ucinewgame");
  engine.postMessage("position fen " + fen);
  engine.postMessage(`go depth ${depth}`);
  //engine.postMessage("eval");//
}

function bestmove(game){
  console.log(game)

  let depth = game.depth;

  // if chess engine replies
  engine.onmessage = function(msg) {
    console.log(msg);
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
        return(`${color} ${msg}`);
    }
    if (typeof(msg == "string") && msg.match("bestmove")) {
      let arr = fen.split(" ");
      let color = "white move";
      if(arr[1] == "w")
        color = "white move";
      else color = "black move";
      return(`${color} ${msg}`);
    }
  }

  let fen = game.fen;
  // run chess engine
  engine.postMessage("ucinewgame");
  engine.postMessage("position fen " + fen);
  engine.postMessage(`go depth ${depth}`);
  //engine.postMessage("eval");//
}

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})

//3rr2k/ppp1q1pp/8/8/2PR4/1QP5/P4PPP/5RK1 w - - 5 23
//r1bqkb1r/ppp2ppp/2n2n2/3pp1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 5
//"stockfish": "^11.0.0"