var expr, socketAndIPPort, socketString;

expr = /[-a-zA-Z0-9.]+(:(6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{0,3}))/

socketIPAndPort = expr.exec( window.location.toString() )[0];
socketIPAndPort = socketIPAndPort.split(":");

socketString = 'ws://' + socketIPAndPort[0] + ':' + (parseInt(socketIPAndPort[1]) + 1);

Interface.Socket = new WebSocket( socketString );

Interface.Socket.onmessage = function (event) {
  var data = JSON.parse( event.data )
  if( data.type === 'osc' ) {
    Interface.OSC._receive( event.data );
  }else {
    if( Interface.Socket.receive ) {
      Interface.Socket.receive( data  )
    }
  }
};

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
  },
  _receive : function( data ) {
    var msg = JSON.parse( data );

    if( msg.address in this.callbacks ) {
      this.callbacks[ msg.address ]( msg.parameters );
    }else{
      for(var i = 0; i < Interface.panels.length; i++) {
        for( var j = 0; j < Interface.panels[i].children.length; j++) {
          var child = Interface.panels[i].children[j];
          
          //console.log( "CHECK", child.key, msg.address )
          if( child.key === msg.address ) {
            //console.log( child.key, msg.parameters )
            child.setValue.apply( child, msg.parameters );
            return;
          }
        }
      }
      this.receive( msg.address, msg.typetags, msg.parameters );
    }
  },
  callbacks : { // "panel" is the Interface.Panel object created in the livecode.html interface
    "/interface/runScript": function(args) {
      eval(args[0]);
    },
    "/interface/addWidget": function(args) {
      // console.log( args )
      var w = {};

      var json2 = args[0].replace(/\'/gi, "\""); // replace any single quotes in json string
      
      try {
        eval("w = " + json2);
        // TODO: use JSON.parse? It's really annoying to format strings for JSON in Max/MSP...
        //w  = JSON.parse( json2 ); // since this might be an 'important' string, don't fail on json parsing error
      }catch (e) {
        console.log("ERROR PARSING JSON");
        return;
      }
            
      var isImportant = false;
    	var hasBounds = (typeof w.bounds !== "undefined") || (typeof w.x !== "undefined");
            
      var _w = new Interface[w.type](w);
      
      if( w.type !== 'Accelerometer' && w.type !== 'Orientation' ) {
      
        panel.add( _w );
                    
        if( !hasBounds ) {
          // TODO: IMPLEMENT
          //if(!Interface.isWidgetSensor(w) ) {
          Interface.autogui.placeWidget(_w, isImportant);
          //}
        }
      }else{
        console.log("STARTING UP ACC")
        _w.start()
      }
        
      // var widgetPage = (typeof w.page !== "undefined") ? w.page : Interface.currentPage;
      // Interface.addingPage = widgetPage;
      // Interface.addWidget(window[w.name], Interface.addingPage);
    },
    "/interface/addWidgetKV" : function(args) {
      var w = {};
      for (var i = 2; i < args.length; i+=2) {
        w[args[i]]=args[i+1];
      }
                                        
      var isImportant = false;
            
      if(typeof w.page === "undefined") {
        w.page = Interface.currentPage;
      }
            
      var _w = Interface.makeWidget(w);
      _w.page = w.page;
            
      if(typeof _w.bounds == "undefined") {
        if(!Interface.isWidgetSensor(w) ) {
          Interface.autogui.placeWidget(_w, isImportant);
        }
      }
            
      var widgetPage = (typeof w.page !== "undefined") ? w.page : Interface.currentPage;
      Interface.addWidget(window[w.name], widgetPage);
    },
    "/interface/autogui/redoLayout" : function(args) {
      Interface.autogui.redoLayout();
    },
    "/interface/removeWidget": function(args) {
      var w = panel.getWidgetWithName( args[0] );
      if(typeof Interface.autogui !== "undefined") {
        Interface.autogui.removeWidget( w );
      }
      panel.remove( w );
    },
    "/interface/setBounds": function(args) {
      var w = panel.getWidgetWithName( args[0] );
      w.bounds = [ args[1], args[2], args[3], args[4] ];
    },
    "/interface/setColors": function(args) {
      var w = panel.getWidgetWithName( args[0] );
      w.background = args[1];
      w.fill = args[2];
      w.stroke = args[3];
      w.refresh();
    },
    "/interface/setRange": function(args) {
      var w = panel.getWidgetWithName( args[0] );
      w.min = args[1];
      w.max = args[2];
    },
    "/interface/setAddress": function(args) {
      var w = panel.getWidgetWithName(args[0]);
      w.key = args[1];
    },
    "/interface/clear" : function(args) {
      //Interface.autogui.reset();
      panel.clear();
    },
  },
  receive : function(address, typetags, parameters) { },
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
