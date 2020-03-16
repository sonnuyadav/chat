const mongo = require('mongodb').MongoClient;
const socketClient = require('socket.io').listen(4000).sockets;
//connect mongodb
// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'chats';
mongo.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true }, function(err,dbResponse){
    if(err){
        throw err;
       }
      console.log("Mongodb connected!!!");

      const db = dbResponse.db(dbName);
      const chatTable = db.collection('chat'); 
      //Connect to socket.io
      socketClient.on('connection', function(socket){
          //create function to send status
          sendStatus = function(s){
              socket.emit('status',s);
          }
      

    //Get chats from mongo collection
    db.collection('chat').find().limit(100).sort({_id:1}).toArray(function(err,rest){
        if(err){
            throw err;
        }
        console.log("=====Rest data",rest)
        //Emit the message to the client
        //socket.emit('output', rest);
    });

    //Handle input events
    socket.on('input', function(data){
        let name = data.name;
        let message = data.message;

        //check for name and message
        if(name =='' || message ==''){
            sendStatus('Please enter the name and message')

        }else{
            //Insert data in database
            db.collection('chat').insert({name:name, message:message}, function(){
                socketClient.emit('output', [data]);

                //Send status object
                sendStatus({
                    message : "Message sent",
                    clear: true
                });
            })
        }
    });
    //handle clear
    socket.on('clear', function(data){
        //Remove all chat from the collection
        db.collection('chat').remove({}, function(){
            //emit cleared
            socket.emit('cleared')
        })
    });

    //close socket emit
});
});
