const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const port = 3300;
const usernames = [];

app
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.sockets.on('connection', (socket) => {
  socket.on('new user', (data, callback) => {
    if (usernames.indexOf(data) != -1) {
      callback(false);
    }
    else {
      callback(true);
      socket.username = data;
      usernames.push(socket.username);
      updateUsernames();
    }
  });
  // update usernames
  function updateUsernames() {
    io.sockets.emit('usernames', usernames);
  }

  // send message
  socket.on('send message', (data) => {
    io.sockets.emit('new message', {user: socket.username, timestamp: new Date().toISOString(), msg: data});
  });

  // disconnect
  socket.on('disconnect', (data) => {
    if (!socket.username) return;

    usernames.splice(usernames.indexOf(socket.username), 1);
    updateUsernames();
  });
});

server.listen(process.env.PORT || port, (err) => {
  if (err) {
    console.log(err, 'Unable to connect to the server.');
  }

  console.log(`Server is now open at port ${port}`);
});