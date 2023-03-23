const express = require("express");
const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());

const amqp = require("amqplib");
var channel, connection;


connectQueue() // call connectQueue function
async function connectQueue() {
    try {

        //amqp://localhost:5672
        //amqp://user1:password1@localhost:5672
        connection = await amqp.connect("amqp://user1:password1@localhost:5672");
        channel = await connection.createChannel()
        
        // connect to 'test-queue', create one if doesnot exist already
        await channel.assertQueue("test-queue")
        
    } catch (error) {
        console.log(error)
    }
}

const sendData = async (data) => {
    // send data to queue
    await channel.sendToQueue("test-queue", Buffer.from(JSON.stringify(data)));
        
    // close the channel and connection
    //await channel.close();
    //await connection.close();
}

app.get("/send-msg", (req, res) => {
    const data = {
        fen: "r2qk2r/pbp1bppp/2pp1n2/8/1PB1P3/P1N5/2P2PPP/R1BQK2R b KQkq - 0 8",
        depth: 10
    }

    sendData(data);

    console.log("A message is sent to queue")
    res.send("Message Sent");
    
})


app.listen(PORT, () => console.log("Server running at port " + PORT));