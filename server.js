var VARIANTS = ['en.default', 'en.tech']

var redis = require('redis').createClient()
var express = require('express')
var app = express()

app.use('/', require('./index').init({
  express: express,
  redis: redis,
  variants: VARIANTS
}))

var server = app.listen(3000, function () {
  var port = server.address().port
  console.log('Demo server running on port', port)
})
