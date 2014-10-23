var fs                = require('fs'),
    ws                = require('ws'),
    url               = require('url'),
    connect           = require('connect'),
    app               = connect(),
    directory         = require('serve-index'),
    static            = require('serve-static'),
    omgosc            = require('omgosc'),
    midi              = require('midi'),
    parseArgs         = require('minimist'),
    webServerPort     = 8080,
    socketPort        = 8081,
    oscOutPort        = 8082,
    oscInPort         = 8083,
    osc               = new omgosc.UdpSender( '127.0.0.1', oscOutPort ),
    clients_in        = new ws.Server({ port:socketPort }),
    clients           = {},
    root              = __dirname + "/interfaces",
    midiInit          = false,
    interfaceJS       = null,
    server            = null,
    serveInterfaceJS  = null,
    midiOut           = null,
    midiNumbers       = {
      "noteon"        : 0x90,
      "noteoff"       : 0x80,
      "cc"            : 0xB0,
      "programchange" : 0xC0,
    },
    idNumber = 0,
    args = parseArgs( process.argv.slice(2) );

//interfaceJS =  fs.readFileSync( '../external/zepto.js', ['utf-8'] );
interfaceJS = fs.readFileSync( '../build/interface.js', ['utf-8'] );
interfaceJS += fs.readFileSync( './interface.client.js', ['utf-8'] );

serveInterfaceJS = function(req, res, next){
	req.uri = url.parse( req.url );
  
	if( req.uri.pathname == "/interface.js" ) {
		res.writeHead( 200, {
			'Content-Type': 'text/javascript',
			'Content-Length': interfaceJS.length
		})
		res.end( interfaceJS );
    
		return;
	}
  
  next();
};

server = app
  .use( directory( root, { hidden:false,icons:true } ) )
  .use( serveInterfaceJS )
  .use( static(root) )
  .listen( webServerPort );

clients_in.on( 'connection', function (socket) {
  console.log( "device connection received" );
  socket.idNumber = idNumber++
  
  socket.on( 'message', function( obj ) {
    var msg = JSON.parse( obj );
    //console.log( obj );
    if(msg.type === 'osc') {
      if( args.id ) {  // append client id
        msg.typetags += 'i'
        msg.parameters.push( socket.idNumber )
      }
      osc.send( msg.address, msg.typetags, msg.parameters );
    }else if( msg.type === 'midi' ) {
      if( !midiInit ) {
        midiOutput = new midi.output();
        midiOutput.openVirtualPort( "Interface Output" );
        midiInit = true;
      }

      if(msg.type !== 'programchange') {
        midiOutput.sendMessage([ midiNumbers[ msg.midiType ] + msg.channel, msg.number, Math.round(msg.value) ])
      }else{
        midiOutput.sendMessage([ 0xC0 + msg.channel, msg.number])
      }
    }
  });
});