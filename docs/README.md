# interface.js documentation

Documentation for Interface.js is created using [documentation.js](http://documentation.js.org). To generate docs:

1. If you haven't done so already, install documentation.js: `npm i documentation.js -g`
2. From the top level of the Interface.js repo, run: `documentation build js/index.js -f html -o docs`. This will place the generated documents in the `./docs` folder.
3. You can now view the docs at `./docs/index.html`.

Docs are in the style of [JSDoc](http://usejsdoc.org). Unfortunately, JSDoc does not play very well with the object creation patterns used in this library. If you add documentation, you need to be very explicit about what each method/property belongs to. See current code examples in the `js` directory for details.
