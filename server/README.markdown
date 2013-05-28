#Using the Interface.js Simple Server

NOTE: The file interface.simpleserver.js is designed to be a quick, easy way to get OSC and MIDI messages from Interface.js interfaces. It requires a small number of terminal commands to get started. There is also a more complete Interface.Server project with a GUI for monitoring connections and some other extra functionalities. If the simple server doesn't suit your needs, please try Interface.Server! You can either [check out the source on GitHub][interface_server_github] or [download prebuilt binaries for OS X or Windows][interface_builds]. There are instructions on the GitHub site for building the project in Linux.

The Interface.js Server has two purposes: 
  1) it serves interfaces to any browser on the local network
  2) it translates network messages from your browser into OSC or MIDI messages.
  
If you want to use the server, you'll need to have [node.js][nodejs] installed. Node.js will provide most of the functionality we need to serve web pages, but we'll also need to add a few utility libraries to send OSC and MIDI and carry out a few other specialized tasks. We can install these utilities using the Node Package Manager, or NPM, which is installed with Node.js. Open a terminal, cd into the directory where this README is located and run the following command:

```
npm install
```

Once these libraries are installed execute the following command to start the server:

```node interface.simpleserver.js```

This will start the web server running on port 8080.

All interface files should be stored in the interface > server > interfaces directory. When you navigate to your computer's url and port 8080 in a browser, you should see a list of all the files in the interfaces directory. Selecting any file in your browser will run the interface and interface.server.js will transmit any messages it receives into either OSC messages on port 8082 or MIDI messages that leave the virtual midi output named "Interface Out".

To define widgets that send OSC messages, simply set their target to be "OSC" and their key to be the OSC address you would like them to output to. For example, to send a message to /speed we could create the following slider

```javascript
a = new Interface.Slider({
  bounds:[0,0,1,1],
  target:"OSC", key:'/speed',
});
```

For MIDI, we specify a target of "MIDI" instead of "OSC". For the key, we pass an array specifying the type of message we want to send, the channel it should go out on and the number of the message. It's also important to limit the range of widgets to valid MIDI values between 0 - 127. Possible message types currently include 'noteon', 'noteoff', 'cc' and 'programchange'. For example, to create a button that outputs NoteOn on channel 1, number 64 we would use:

```javascript
a = new Interface.Button({
  bounds:[0,0,1,1],
  min:0, max:127,
  target:"MIDI", key:['noteon', 0, 64],
});
```

The server directory comes with a couple of simple test files to experiment with MIDI and OSC, MIDI_test.htm and OSC_test.htm. If your computer is named bar, you should be able to enter the following URL with the server running:

http://bar.local:8080

... and see a list of files to run including the two mentioned above.

[nodejs]:http://nodejs.org
[npm]:http://nodejs.org/download/
[interface_server_github]:https://github.com/charlieroberts/interface.server
[interface_builds]:http://www.charlie-roberts.com/interface/builds
