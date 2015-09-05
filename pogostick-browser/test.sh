node test/mock-server.js & > /dev/null
browserify test/client.js -o test/blob.js
mocha-phantomjs http://localhost:3003
pkill node
