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
    chat.find().limit(100).sort({_id:1}).toArray(function(err,rest){
        if(err){
            throw err;
        }
        //Emit the message to the client
        socket.emit('output', res);
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
            chat.insert({name:name, message:message}, function(){
                client.emit('output', [data]);

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
        chat.remove({}, function(){
            //emit cleared
            socket.emit('cleared')
        })
    });

});
