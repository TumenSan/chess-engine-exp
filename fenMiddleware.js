function fenMiddleware(req, res, next) {
    try {
        let fen = req.body.fen;
        const fenregex = /^([rnbqkpRNBQKP1-8]+\/){7}([rnbqkpRNBQKP1-8]+)\s[bw]\s(-|K?Q?k?q?)\s(-|[a-h][36])\s(0|[1-9][0-9]*)\s([1-9][0-9]*)/;
        if(!fen.match(fenregex)){
            res.status(400).send("Invalid fen string");
            return;
        }

        let fenCheck = 
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
        
        /*
        console.log(fenCheck(fen))

        if(!fenCheck(fen)) {
            res.status(400).send('error FEN');
            return;
        }
        */

        next();

    } catch(e) {
        res.status(400).send('error');
        return;
    }
}

module.exports = fenMiddleware;