# interface.js simple server

This provides a simple server which hosts interfaces and transmits OSC messages.

## installation

Run `npm install --dev` from within the server directory.

## start

Run `node interface.simpleserver.js 8080` to run the server on port 8080... feel free to substitute a number of your choice.

## use

With the server started on port 8080, you can now navigate to `127.0.0.1:8080` in your browser, which will open the interface.js directory. Click inside the `server` directory and then click on `clientTest.htm`. This will open a single slider. By default OSC is transmitted on a port that is one higher than where you're running your web server. So, if you started the server on port 8080 OSC messages will be received by applications on port 8081.
