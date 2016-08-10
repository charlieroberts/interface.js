# Runnng Interface.js Tests

Tests use [Mocha](https://mochajs.org). Assertions are vanilla [node-style](https://nodejs.org/api/assert.html).

## Test in the browser
Open `tests/tests.htm` in any browser to run tests and see the result.

## Test in node
Interface.js uses the [mocha-phantomjs project](https://github.com/nathanboktae/mocha-phantomjs) to run tests in node. To install:

```
npm install mocha-phantomjs -g
```

With mocha-phantomjs installed, you can run the tests using `mocha-phantomjs tests/tests.htm`. 
