Interface.OSC = {
  ip : null,
  port: null,
  socket : null,
  init : function() {
    this.socket = new WebSocket('ws://' + this.ip + ':' + this.port);
  },
  send : function(_address, _typetags, _parameters) {
    if(typeof _address === 'string' && typeof _typetags === 'string') {
      var obj = {
        type : "osc",
        address: _address,
        typetags: _typetags,
        parameters: Array.isArray(_parameters) ? _parameters : [ _parameters ],
      }
      this.socket.send(JSON.stringify(obj));
    }else{
      console.log("INVALID OSC MESSAGE FORMATION", arguments);
    }
  }
};

Interface.MIDI = {
  ip: null,
};