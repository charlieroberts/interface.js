var fs                = require('fs'),
    ws                = require('ws'),
    url               = require('url'),
    connect           = require('connect'),
    omgosc            = require('omgosc'),
    midi              = require('midi'),
    webServerPort     = 8080,
    socketPort        = 8081,
    oscOutPort        = 8082,
    oscInPort         = 8083,
    osc               = new omgosc.UdpSender( '127.0.0.1', oscOutPort ),
    clients_in        = new ws.Server({ port:socketPort }),
    clients           = {},
    root              = __dirname + "/interfaces",
    midiInit          = false,
    myIP              = null,
    interfaceJS       = null,
    server            = null,
    serveInterfaceJS  = null,
    midiOut           = null,
    midiNumbers       = {
      "noteon"        : 0x90,
      "noteoff"       : 0x80,
      "cc"            : 0xB0,
      "programchange" : 0xC0,
    };

interfaceJS =  fs.readFileSync( '../zepto.js', ['utf-8'] );
interfaceJS += fs.readFileSync( '../interface.js', ['utf-8'] );
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

server = connect()
  .use( connect.directory( root, { hidden:true,icons:true } ) )
  .use( serveInterfaceJS )
  .use( connect.static(root) )
  .listen( webServerPort );

clients_in.on( 'connection', function (socket) {
  console.log( "device connection received" );
  
  socket.on( 'message', function( obj ) {
    var args = JSON.parse( obj );
        
    if(args.type === 'osc') {
			osc.send( args.address, args.typetags, args.parameters );
    }else if( args.type === 'midi' ) {
      if( !midiInit ) {
        midiOutput = new midi.output();
        midiOutput.openVirtualPort( "Interface Output" );
        midiInit = true;
      }

      if(args.type !== 'programchange') {
        midiOutput.sendMessage([ midiNumbers[ args.midiType ] + args.channel, args.number, Math.round(args.value) ])
      }else{
        midiOutput.sendMessage([ 0xC0 + args.channel, args.number])
      }
    }
  });
});