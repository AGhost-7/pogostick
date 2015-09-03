node test/mock-server.js
browserify test/client.js -o test/blob.js
mocha-phantomjs test/client.js
pkill node
