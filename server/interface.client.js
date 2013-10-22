var expr, socketAndIPPort, socketString;

expr = /[-a-zA-Z0-9.]+(:(6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{0,3}))/

socketIPAndPort = expr.exec( window.location.toString() )[0];
socketIPAndPort = socketIPAndPort.split(":");

socketString = 'ws://' + socketIPAndPort[0] + ':' + (parseInt(socketIPAndPort[1]) + 1);

Interface.Socket = new WebSocket( socketString );

Interface.OSC = {
  socket : Interface.Socket,
  send : function(_address, _typetags, _parameters) {
    if( this.socket.readyState === 1) {
      if(typeof _address === 'string' && typeof _typetags === 'string') {
        var obj = {
          type : "osc",
          address: _address,
          typetags: _typetags,
          parameters: Array.isArray(_parameters) ? _parameters : [ _parameters ],
        }
        this.socket.send(JSON.stringify(obj));
      }else{
        console.log( 'socket is not yet connected...' )
      }
    }else{
      console.log("INVALID OSC MESSAGE FORMATION", arguments);
    }
  }
};

Interface.MIDI = {
  socket: Interface.Socket,
  send : function(messageType, channel, number, value) {
    var obj = null;
    if(Array.isArray( arguments[0] )) {
      // fill in to allow stuff like [145,1,127]
    }else{
      obj = {
        type    : 'midi',
        midiType  : messageType,
        channel   : channel,
        number    : number,
      }
      if(typeof value !== 'undefined') {
        obj.value = value;
      }
      console.log( obj );
      this.socket.send( JSON.stringify( obj ) );
    }
  }
};
