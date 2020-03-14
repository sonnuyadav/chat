const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;
//connect mongodb

mongo.connect('mongodb://127.0.0.1/chat',{ useNewUrlParser: true, useUnifiedTopology: true }, function(err,db){
    if(err){
        throw err;
       }
      console.log("Mongodb connected!!!");

      //Connect to socket.io

      client.on('connection', function(){
          let chat = db.collection('chats');

          //create function to send status
          sendStatus = function(s){
              socket.emit('status',s);
          }
      })

    //Get chats from mongo collection

});
