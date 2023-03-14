function fenMiddleware(req, res, next) {
    try {
        let fen = req.body.fen;
        let depth = req.body.depth;
        const fenregex = /^([rnbqkpRNBQKP1-8]+\/){7}([rnbqkpRNBQKP1-8]+)\s[bw]\s(-|K?Q?k?q?)\s(-|[a-h][36])\s(0|[1-9][0-9]*)\s([1-9][0-9]*)/;
        if(!fen.match(fenregex)){
            res.status(400).send("Invalid fen string");
            return;
        }
        if((typeof depth !== 'number') || (depth < 1) || (depth > 35)){
            res.status(400).send("Invalid depth");
            return;
        }

        next();

    } catch(e) {
        res.status(400).send('error');
        return;
    }
}

module.exports = fenMiddleware;