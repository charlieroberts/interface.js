'use strict'

let fs                = require( 'fs' ),
    ws                = require( 'ws' ),
    url               = require( 'url' ),
    server            = require( 'http' ).createServer(),
    monitorServer     = require( 'http' ).createServer(),
    connect           = require( 'connect' ),
    directory         = require( 'serve-index' ),
    serve_static      = require( 'serve-static' ),
    oscMin            = require( 'osc-min' ),
    parseArgs         = require( 'minimist' ),
    udp               = require( 'dgram' ),
    monitorApp        = connect(),
    app               = connect(),
    midi              = null,   
    args              = parseArgs( process.argv.slice(2) ),
    webServerPort     = args.serverPort || 8080,
    oscOutPort        = args.oscOutPort || webServerPort + 1,
    oscInPort         = args.oscInPort  || webServerPort + 2,
    monitorPort       = args.monitorPort || webServerPort + 3,
    outputIPAddress   = args.outputIPAddress || null,
    appendID          = args.appendID   || false,
    clients_in        = new ws.Server({ server:server }),
    monitorWS         = new ws.Server({ server:monitorServer }),
    monitorClients    = [],
    clients           = {},
    root              = args.interfaceDirectory || __dirname + '/../',
    midiInit          = false,
    interfaceJS       = null,
    serveInterfaceJS  = null,
    midiOut           = null,
    midiNumbers       = {
      "noteon"        : 0x90,
      "noteoff"       : 0x80,
      "cc"            : 0xB0,
      "programchange" : 0xC0,
    },
    osc,
    monitors = [],
    template, templateSplit,
    idNumber = 0;
    
if( args.useMIDI === true ) midi = require( 'midi' )

template = fs.readFileSync( './template.htm', 'utf-8' );
templateSplit = template.split( '\n' )

/* 
 * Start web server running
*/

app
  .use( function( req, res, next ) {
    req.uri = url.parse( req.url )

    let pathSplit = req.uri.path.split( '/' ),
        filename  = pathSplit[ pathSplit.length - 1 ],
        extensionSplit = filename.split( '.' ),
        isIJS = extensionSplit.indexOf( 'ijs' ) > -1

    if( isIJS ) {
      let ijsFile = fs.readFileSync( './' + filename, 'utf-8' ),
          finalFile

      templateSplit.splice( 8,1,ijsFile ),
      finalFile = templateSplit.join( '\n' )

      console.log( finalFile )

      res.writeHead( 200, {
        'Content-Type': 'text/html',
        'Content-Length': finalFile.length
      })
      res.end( finalFile );

      return;
    }

    //if( req.uri.pathname == "/interface.js" ) {
    //  res.writeHead( 200, {
    //    'Content-Type': 'text/javascript',
    //    'Content-Length': interfaceJS.length
    //  })
    //  res.end( interfaceJS );

    //  return;
    //}

    next();
   
  })
  .use( directory( root, { hidden:false,icons:true } ) )
  .use( serve_static( root ) )

server.on( 'request', app )
server.listen( webServerPort )

monitorApp.use( serve_static( __dirname + '/node_modules/interface.server.monitor/'  ) )
monitorServer.on( 'request', monitorApp )
monitorServer.listen( monitorPort )

/*
 * Create OSC input port for bi-directional communication
*/

osc = udp.createSocket( 'udp4', function( _msg, rinfo ) {
  let msg = oscMin.fromBuffer( _msg )
    
  let firstPath = msg.address.split('/')[1],
      isNumber  = ! isNaN( firstPath ),
      tt = '',
      msgArgs = []
  
  for( let arg of msg.args ) {
    tt += arg.type[ 0 ]
    msgArgs.push( arg.value )
  }
  
  if( ! isNumber ) {
    for( let key in clients ) {
      try{
        clients[ key ].send( JSON.stringify({ type:'osc', address:msg.address, typetags: tt, parameters:msgArgs }) )
      } catch (error){}
    }
  }else{
    clients[ firstPath ].send( JSON.stringify({ type:'osc', address:'/'+msg.address.split('/')[2], typetags: tt, parameters:msgArgs }) )
  }
})

osc.bind( oscInPort )

monitorWS.on( 'connection', function ( monitorSocket ) {
  monitorClients.push( monitorSocket )

  monitorSocket.monitoredClients = []

  monitorSocket.on( 'close', ws => {
    monitorClients.splice( monitorClients.indexOf( monitorSocket ), 1 )
  })

  monitorSocket.on( 'message', msgData => {
    let msg = JSON.parse( msgData )
    
    switch( msg.key ) {
      case 'monitor.start' :
        monitorSocket.monitoredClients.push( clients[ msg.data ] )
        break;
      case 'monitor.end' :
        let client = clients[ msg.data ],
            idx = monitorSocket.monitoredClients.indexOf( client )

        if( idx > -1 ) {
          monitorSocket.monitoredClients.splice( idx, 1 )
        }
        break;

      default: break;
    }
  })

})

/*
 * Define WebSocket interaction.
*/

clients_in.on( 'connection', function ( socket ) {
  let clientIP = socket.upgradeReq.headers.origin.split( ':' )[ 1 ].split( '//' )[ 1 ]
  
  console.log( 'client connected:', clientIP )
  
  clients[ idNumber ] = socket
  socket.ip = clientIP
  socket.idNumber = idNumber++

  socket.on( 'close', ()=> {
    let client = clients[ socket.idNumber ]

    for( let monitor of monitorClients ) {
      if( monitor.readyState === ws.OPEN ) {
        monitor.send( JSON.stringify({ type:'removeClient', id:socket.idNumber }) )

        let idx = monitor.monitoredClients.indexOf( client )

        if( idx > -1 ) {
          monitor.monitoredClients.splice( idx, 1 )
        }
      }
    }
    delete clients[ idNumber ]
  })
  
  socket.on( 'message', function( obj ) {
    let msg = JSON.parse( obj );

    if( msg.type === 'osc' ) {
      if( args.appendID ) {  // append client id
        msg.parameters.push( socket.idNumber )
      }
      let buf = oscMin.toBuffer({
        address: msg.address,
        args: msg.parameters
      })
      
      for( let monitor of monitorClients ) {
        if( monitor.monitoredClients.indexOf( socket ) > -1 ) {
          msg.id = socket.idNumber
          monitor.send( JSON.stringify({ type:'monitoring', data: msg }) )
        }
      }

      osc.send( buf, 0, buf.length, oscOutPort, outputIPAddress || 'localhost')
    }else if( msg.type === 'midi' && midi !== null ) {
      if( !midiInit ) {
        midiOutput = new midi.output();
        midiOutput.openVirtualPort( 'Interface Output' );
        midiInit = true;
      }

      if(msg.type !== 'programchange') {
        midiOutput.sendMessage([ midiNumbers[ msg.midiType ] + msg.channel, msg.number, Math.round(msg.value) ])
      }else{
        midiOutput.sendMessage([ 0xC0 + msg.channel, msg.number])
      }
    }else if( msg.type === 'socket' ) {
      for( let key in clients ) {
        if( clients[ key ] !== socket ) {
          clients[ key ].send( JSON.stringify({ type:'socket', address:msg.address, parameters:msg.parameters }) )
        }
      }
    }else if( msg.type === 'meta' ) {
      switch( msg.key ) {
        case 'register':
          for( let monitor of monitorClients ) {
            if( monitor.readyState === ws.OPEN )  
              monitor.send( JSON.stringify({ type:'newClient', ip:socket.ip, id:socket.idNumber, interfaceName:msg.interfaceName }) )
          }
          break;
      } 

    }
  })

});
