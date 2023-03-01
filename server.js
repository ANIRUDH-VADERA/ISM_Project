const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const ioFile = require("socketio-file-upload");
const fs = require("fs");

// Enable CORS
app.use((req, res, next) => {
  // Set CORS headers
  // res.setHeader("Access-Control-Allow-Origin", "*");
  // res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  // res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Pass to next layer of middleware
  next();
});

app.use(express.static(__dirname + "/public"));

app.get("/", function (request, response) {
  response.sendFile(__dirname + "/public/home.html");
});

// Checking if the users connect
io.on("connection", (socket) => {
  console.log("A user connected");
  // Checking if the users disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
  
  socket.on("message", (message) => {
    console.log("message", message);
    // Broadcasting this message to all the users that are connected
    io.emit("message", message);
  });

  const fileUpload = new ioFile();

  fileUpload.listen(socket);
  
  fileUpload.on('start', (fileInfo) => {
    console.log(`File upload started: ${fileInfo.name}`);
  });
  
  fileUpload.on('saved', (fileInfo) => {
    console.log(`File saved: ${fileInfo.name}`);
  });
  
  fileUpload.on('error', (err) => {
    console.log(`Error while uploading file: ${err}`);
  });

  socket.on('base64 file', (fileInfo) => {
      const buffer = Buffer.from(fileInfo.data.split(',')[1], 'base64');
    
      // Save the file to disk or do whatever you want with the data
      fs.writeFile(fileInfo.name, buffer, (err) => {
        if (err) {
          console.log(`Error while saving file: ${err}`);
        } else {
          io.emit('base64 file', fileInfo)
          console.log(`File saved: ${fileInfo.name}`);
        }
     });
  });


});



const hostname = "localhost"; // change this to your LAN IP address
const port = 5500;
http.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
