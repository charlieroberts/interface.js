var fs            = require('fs'),
    ws            = require('ws'),
    http          = require('http'),
    url           = require('url'),
    mime          = require('mime'),
    dns           = require('dns'),
    os            = require('os'),
    net           = require('net'),
    util          = require('util'),
    path          = require('path'),
    mdns          = require('mdns'),
    connect       = require('connect'),
    path          = require('path'),
    root          = __dirname + "/interfaces",
    webServerPort = 8080,
    socketPort    = 8081,
    oscOutPort    = 8082,
    oscInPort     = 8083,
    clients       = {},
    myIP          = null,
    interfaceJS   = null,
    server        = null,
    serveInterfaceJS = null,
    omgosc        = require('./omgosc.js'),
    osc           = new omgosc.UdpSender( '127.0.0.1', oscOutPort ),
    clients_in    = new ws.Server({ port:socketPort });

interfaceJS =  fs.readFileSync( '../zepto.js', ['utf-8']);
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
  .use(connect.directory(root, {hidden:true,icons:true}))
  .use( serveInterfaceJS )
  .use(connect.static(root))
  .listen(webServerPort);

clients_in.on('connection', function (socket) {
  console.log("CONNECTION !!!");
  
  socket.on('message', function(obj) {
    var args = JSON.parse(obj);
    console.log("MESSAGE", args);
    if(args.type === 'osc') {
			osc.send(args.address, args.typetags, args.parameters );
    }
  });;
});

myIP = (function() {
	var interfaces = os.networkInterfaces();
	var addresses = [];
	for (k in interfaces) {
		for (k2 in interfaces[k]) {
			var address = interfaces[k][k2];
			if (address.family == 'IPv4' && !address.internal) {
				//console.log(address.address);
				addresses.push(address.address)
			}
		}
	}
	return addresses[0];
})();

interfaceJS += "\nInterface.OSC.ip = '" + myIP + "';";
interfaceJS += "\nInterface.OSC.port = '" + socketPort + "';";
