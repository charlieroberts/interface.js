# interface.js
A framework for browser-based GUIs

# use
To use internally to a web page, simply include `dist/interface.lib.js` in your HTML file. See the files in the `examples/` directory for more info.

To create interfaces that generate OSC messages, follow the instructions found in `server/README.markdown`. 

# development
From the top level of the repo, run:

`npm install --dev`

Then run `gulp; gulp watch`, which will start a continuous build system. After starting gulp, and saved changes to any file in the `js` folder will trigger recompilation of the main javascript file.
