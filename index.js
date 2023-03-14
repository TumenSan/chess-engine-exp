const express = require('express')
const app = express()
const port = 6000
const stockfish = require("stockfish");
const engine = stockfish();
const fenMiddleware = require("./fenMiddleware");
//const fenregex = "/^([rnbqkpRNBQKP1-8]+\/){7}([rnbqkpRNBQKP1-8]+)\s[bw]\s(-|K?Q?k?q?)\s(-|[a-h][36])\s(0|[1-9][0-9]*)\s([1-9][0-9]*)/"
//const regex = "/info.*score\s(cp\s-?\d+)/g";

engine.onmessage = function(msg) {
  console.log(msg);
};

//engine.postMessage("uci");

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(fenMiddleware);

let depth = 20;

app.get('/', (request, response) => {
  response.send('post body any fen in /estimation or /bestmove');
});

app.post('/', (request, response) => {
  response.send('post body any fen in /estimation or /bestmove');
});

app.post('/estimation', (request, response) => {

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
    //const regex = /^info depth 20 .* nodes \d+ .*$/;
    //const regex = new RegExp(`^info depth ${depth} .* nodes \d+ .*$`);
    const regex = new RegExp(`^info depth ${depth} .* nodes \\d+ .*$`);
    if (typeof(msg == "string") && regex.test(msg) && !msg.includes("lowerbound") 
      && !msg.includes("upperbound")) {
        let arr = fen.split(" ");
        let color = "white move";
        if(arr[1] == "w")
          color = "white move";
        else color = "black move";
        response.send(`${color} ${msg}`);
    }
  }

  let fen = request.body.fen;
// run chess engine
  engine.postMessage("ucinewgame");
  engine.postMessage("position fen " + fen);
  engine.postMessage(`go depth ${depth}`);
  //engine.postMessage("eval");//
});

app.post('/bestmove', (req, res) => {

  //if (!request.body.fen.match(fenregex)) {
  if (!req.body.fen) {
    res.send("Invalid fen string");
    return;
  }
  
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
  engine.postMessage("position fen " + req.body.fen);
  engine.postMessage("go depth 20");
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


/*
let f = 
s => [...s].map(c =>                  // for each character 'c' in the FEN string 's':
  ++n % 9 ?                           //   if we haven't reached the end of a rank:
    +c ?                              //     if the character is a digit:
      n += --c                        //       advance the board pointer by c - 1 squares
    :                                 //     else:
      a[                              //       update the piece counter array:
        i =                           //         i = piece identifier (0 to 12)
          'pP/KkQqRrBbNn'.search(c),  //             with special case: '/' --> 2
        i &=                          //         we count it as a promoted pawn instead if:
          i > 4 &                     //           it's a Q, R, B or N and we already have
          a[i] > (i > 6) ||           //           2 of them for R, B, N or just 1 for Q
          i                           //           else, we keep the identifier unchanged
      ] = -~a[i]                      //         '-~' allows to increment 'undefined'
  :                                   //   else:
    x += c == '/',                    //     check that the expected '/' is there
  a = [                               //   initialize the piece counter array 'a'
    x =                               //   initialize the '/' counter 'x',
    n = 0 ]                           //   initialize the board pointer 'n'
) &&                                  // end of map()
!(                                    // now it's time to perform all sanity checks:
  [p, P, s, K, k] = a,                //   copy the 5 first entries of 'a' to new variables
  n - 71 |                            //   have we reached exactly the end of the board?
  x - 7 |                             //   have we identified exactly 7 ends of rank?
  s |                                 //   have we encountered any unexpected '/' character?
  k * K - 1 |                         //   do we have exactly one king on each side?
  p > 8 |                             //   no more than 8 black pawns, including promotions?
  P > 8)                              //   no more than 8 white pawns, including promotions?

console.log(f("3P4/6k1/8/8/8/6K1/8/8 w - - 0 1")) // True
console.log(f("8/6k1/8/8/3Q4/4K3/8/8 w - - 0 1")) // True
console.log(f("r2r2k1/p3q2p/ppR3pr/rP4bp/3p4/5B1P/P4PP1/3Q1RK1")) // False (black has 7 pawns and 4 rooks - impossible)
console.log(f("6k1/pp3ppp/4p3/2P3b1/bPP3P1/3K4/P3Q1q1")) // False (only 7 ranks)
console.log(f("3r1rk1/1pp1bpp1/6p1/pP1npqPn/8/4N2P/P2PP3/1B2BP2/R2QK2R")) // False (9 ranks)
console.log(f("5n1k/1p3r1qp/p3p3/2p1N2Q/2P1R3/2P5/P2r1PP1/4R1K1")) // False (2nd rank has 9 squares/pieces)
console.log(f("rnbqkbnr/pppppppp/8/35/8/8/PPPPPPPP/RNBQKBNR")) // True
console.log(f("rnbqkbnr/pppppppp/8/9/7/8/PPPPPPPP/RNBQKBNR")) // False (additional test case suggested by Rick Hitchcock)
console.log(f("rnbqkbnr/pppp/ppp/8/8/8/8/PPPPPPPP/RNBQKBNR")) // False (additional test case)*/