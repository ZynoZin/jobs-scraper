const express = require('express');

const server = express();


//just a server to keep the bot alive in heroku
server.all('/', (req, res)=>{

   res.setHeader('Content-Type', 'text/html');

   res.write('<link href="https://fonts.googleapis.com/css?family=Roboto Condensed" rel="stylesheet"> <style> body {font-family: "Roboto Condensed";font-size: 22px;} <p>Hosting Active</p>');

   res.end();

})



function listenToServer(){

   server.listen(process.env.PORT || 3000 , ()=>{console.log("Server is online!")});

}



module.exports = listenToServer;