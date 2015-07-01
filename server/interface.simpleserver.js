var fs                = require('fs'),
    ws                = require('ws'),
    url               = require('url'),
    connect           = require('connect'),
    app               = connect(),
    directory         = require('serve-index'),
    static            = require('serve-static'),
    oscMin            = require( 'osc-min' ),
    midi              = null,   
    parseArgs         = require( 'minimist' ),
    udp               = require( 'dgram' ),
    args              = parseArgs( process.argv.slice(2) ),
    webServerPort     = args.serverPort || 8080,
    socketPort        = args.socketPort || webServerPort + 1,
    oscOutPort        = args.oscOutPort || webServerPort + 2,
    oscInPort         = args.oscInPort  || webServerPort + 3,
    outputIPAddress   = args.outputIPAddress || null,
    appendID          = args.appendID   || false,
    //osc               = new omgosc.UdpSender( '127.0.0.1', oscOutPort ),
    clients_in        = new ws.Server({ port:socketPort }),
    clients           = {},
    root              = args.interfaceDirectory || __dirname + "/interfaces",
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
    osc,
    idNumber = 0;
    
if( args.useMIDI === true ) midi = require( 'midi' )

//interfaceJS =  fs.readFileSync( '../external/zepto.js', ['utf-8'] );
interfaceJS = fs.readFileSync( '../build/interface.js', ['utf-8'] );
interfaceJS += fs.readFileSync( './interface.client.js', ['utf-8'] );

osc = udp.createSocket( 'udp4', function( _msg, rinfo ) {
  var msg = oscMin.fromBuffer( _msg )
    
  var firstPath = msg.address.split('/')[1],
      isNumber  = ! isNaN( firstPath ),
      tt = '',
      msgArgs = []
  
  for( var i = 0 ; i < msg.args.length; i++ ) {
    var arg = msg.args[ i ]
  
    tt += arg.type[ 0 ]
    msgArgs.push( arg.value )
  }
  
  if( ! isNumber ) {
    for( var key in clients ) {
      clients[ key ].send( JSON.stringify({ type:'osc', address:msg.address, typetags: tt, parameters:msgArgs }) )
    }
  }else{
    clients[ firstPath ].send( JSON.stringify({ type:'osc', address:'/'+msg.address.split('/')[2], typetags: tt, parameters:msgArgs }) )
  }
})
osc.bind( oscInPort )

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

clients_in.on( 'connection', function ( socket ) {
  //console.log( "device connection received", socket.upgradeReq.headers );
  
  var clientIP = socket.upgradeReq.headers.origin.split( ':' )[ 1 ].split( '//' )[ 1 ]
  
  console.log("client connected:", clientIP )
  
  clients[ idNumber ] = socket
  socket.ip = clientIP
  socket.idNumber = idNumber++
  
  socket.on( 'message', function( obj ) {
    var msg = JSON.parse( obj );

    if(msg.type === 'osc') {
      if( args.appendID ) {  // append client id
        msg.parameters.push( socket.idNumber )
      }
      var buf = oscMin.toBuffer({
        address: msg.address,
        args: msg.parameters
      })
      
      osc.send( buf, 0, buf.length, oscOutPort, outputIPAddress || 'localhost')
    }else if( msg.type === 'midi' && midi !== null ) {
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
    }else if( msg.type === 'socket' ) {
      for( var key in clients ) {
        if( clients[ key ] !== socket ) {
          clients[ key ].send( JSON.stringify({ type:'socket', address:msg.address, parameters:msg.parameters }) )
        }
      }
    }
  });
});