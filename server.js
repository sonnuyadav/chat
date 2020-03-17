const MongoClient = require('mongodb').MongoClient;
const socketClient = require('socket.io').listen(4000).sockets;
//connect mongodb
// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'chats';
(async() => {
    let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    let db = client.db('chats');
    try {
        const res = await db.collection("chat").find().limit(100).sort({ _id: 1 }).toArray();
        console.log(`res => ${JSON.stringify(res)}`);
        //Connect to socket.io
        socketClient.on('connection', function(socket) {
            //create function to send status
            sendStatus = function(s) {
                socket.emit('status', s);
            }

            console.log('Send in output==', res);
            socket.emit('output', res);

            //Handle input events
            socket.on('input', function(data) {
                let name = data.name;
                let message = data.message;

                //check for name and message
                if (name == '' || message == '') {
                    sendStatus('Please enter the name and message')

                } else {
                    //Insert data in database
                    db.collection('chat').insertOne({ name: name, message: message }, function() {
                        socketClient.emit('output', [data]);
                        //Send status object
                        sendStatus({
                            message: "Message sent",
                            clear: true
                        });
                    })
                }
            });
            //handle clear
            socket.on('clear', function(data) {
                //Remove all chat from the collection
                db.collection('chat').remove({}, function() {
                    //emit cleared
                    socket.emit('cleared')
                })
            });
        });
    } finally {
        client.close();
    }
})().catch(err => console.error(err));