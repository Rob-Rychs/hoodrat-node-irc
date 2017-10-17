// sure someone wrote a better package, and it's worth checking out, but first lets do it from scratch
// lets require some native node modules for shenanigans
const net = require('net');
const readFile = require('fs').readFile;
const path = require('path');

const play = require('./node_modules/play/lib/play.js');

// play with a callback

// function(){
  
//   // these are all "fire and forget", no callback
//   play.sound('../wavs/sfx/alarm.wav');
//   play.sound('../wavs/sfx/crinkle.wav');
//   play.sound('../wavs/sfx/flush.wav');
//   play.sound('../wavs/sfx/ding.wav');
// });

// let's create  server with 'net'
const server = net.createServer();

// on connection to server, fire this function
server.on('connection', handleConnection);

// inform the server on which port to listen to
// %j in the console.log auto JSON.stringifys the passed arg
//  address(): { port: number; family: string; address: string; };
server.listen(9000, function() {
  console.log('server listening to %j', server.address());
});

// lwets declare a map of our connecions
const connections = {};

// funciton to fire on new connection
function handleConnection(conn) {
  // set the encoding because there are people smarter than you who figured that out already 
  conn.setEncoding('utf8');

  play.sound('./wavs/help-from-my-friends.wav');

  // first let's greet the newly connected user with the ascii message in ./welcome.txt
  readFile(path.resolve(process.cwd(), 'welcome.txt'), 'utf8', (error, contents) => {
    !error && conn.write(contents);
  })

  // set the remoteAddress const with some properties from the connection event
  const remoteAddress = `${conn.remoteAddress}:${conn.remotePort}`;
  // set that new const as a property in our connections smap
  connections[remoteAddress] = conn
  // console.log that there is a new connection
  console.log(`new client connection from ${remoteAddress}`);

  function onData(data) {
    console.log('Got data', data, 'from:', remoteAddress);
    // make it upperCase for no reason? nahhhhh
    // conn.write(`Got "${data.trim()}". Let me uppercase: "${data.toUpperCase()}"`)

    // forEach over addresses in connections and send message data to all other connections 
    // some fancy setTimeout for mananging the event-loop/stack and making the for loop more async and performant
    Object.keys(connections).forEach((ra) => {
      setTimeout(() => {
        ra !== remoteAddress  
        ? connections[ra].write(`${ra}: ${data}`)
        : 'Ya Goofed'
        }, 0);
    })
  }

  // some extra connection event types and their handleFunctions()
  conn.on('error', onError);
  conn.on('close', onClose); 
  conn.on('data', onData);
  
  // handle the close of conn
  function onClose() {
    console.log('Deuces', remoteAddress);
  }
  // handle the Error of conn
  function onError() {
    console.log('ERROR', remoteAddress);
  }


}
