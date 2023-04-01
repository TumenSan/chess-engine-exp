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

connectQueue() // call connectQueue function

async function connectQueue() {
    try {
        //connect to 'test-queue', create one if does not exist already
        connection = await amqp.connect("amqp://user1:password1@rabbitmq:5672");
        channel = await connection.createConfirmChannel()

        await channel.assertQueue("back-to-engine", { durable: true });

        console.log('Exchange "engine-to-back" and queue "back-to-engine" are created and binded');

        channel.consume("back-to-engine", async (data) => {
            try {
                let dataJson = JSON.parse(data.content.toString());

                let est = await estimation(dataJson);

                // Create the response object with the request ID for correlation
                const response = {
                    answer: est,
                    requestId: dataJson.requestId
                };

                // Publish the response to the exchange with the routing key of the request ID
                await channel.sendToQueue("back-to-engine", Buffer.from(JSON.stringify(response)));

                // Print information about the sent response
                console.log("Response sent: " + JSON.stringify(response));

                // Acknowledge the message as processed
                channel.ack(data);
            } catch (error) {
                console.log("Error occurred: " + error.message);
                // Reject the message and return it to the queue to be reprocessed
                channel.nack(data);
            }

        }, { noAck: false });
        
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

async function estimation(game){
  console.log(game)

  let depth = game.depth;
  
  return new Promise(function(resolve, reject) {
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
          resolve(Conclusion);
      }
    }
  
    let fen = game.fen;
    // run chess engine
    engine.postMessage("ucinewgame");
    engine.postMessage("position fen " + fen);
    engine.postMessage(`go depth ${depth}`);
    //engine.postMessage("eval");//
  });
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