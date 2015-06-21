var request = require('supertest')
  , express = require('express')
  , redis = require('redis').createClient()
  , subject = require('../')

describe('express-it', function () {

  var app, client
  beforeEach(function (done) {
    app = express()
    app.set('view engine', 'jade')
    app.set('views', __dirname + '/views')
    client = require('redis').createClient()
    client.on('connect', done)
    var VARIANTS = ['en.default', 'en.test', 'en.test2']
    app.use('/path/to/test', subject.init({
      express: express,
      redis: client,
      variants: VARIANTS
    }))


    app.use(function (req, res, next) {
      req.variant = 'en.default'
      next()
    })

    app.use(subject.middleware({
      redis: client,
      variants: VARIANTS
    }))

  })

  it('should show backup message when key is unfound', function (done) {
    app.get('/route', function (req, res) {
      res.render('test')
    })
    request(app)
    .get('/route')
    .expect(/example test message/, done)
  })

  it('should show test message when key is found', function (done) {
    app.get('/route', function (req, res) {
      res.render('test', {
        name: 'earthlings'
      })
    })

    request(app)
    .post('/path/to/test/create')
    .field('key', 'test.msg')
    .end(function () {
      request(app)
      .put('/path/to/test/update')
      .send({
        data: {
          variant: 'en.default',
          key: 'test.msg'
        },
        value: 'greetings {name}'
      })
      .end(function () {
        request(app)
        .get('/route')
        .expect(/greetings earthlings/, done)
      })
    })


  })


})

describe('variants by priority', function () {

  var app, client
  beforeEach(function (done) {
    app = express()
    app.set('view engine', 'jade')
    app.set('views', __dirname + '/views')
    client = require('redis').createClient()
    client.on('connect', done)
    var VARIANTS = ['en.default', 'en.test', 'en.test2']
    app.use('/path/to/test', subject.init({
      express: express,
      redis: client,
      variants: VARIANTS
    }))


    app.use(function (req, res, next) {
      req.variant = ['en.test2', 'en.test']
      next()
    })

    app.use(subject.middleware({
      redis: client,
      variants: VARIANTS
    }))

  })


  it('should allow cascading variants by priority', function (done) {

    app.get('/route', function (req, res) {
      res.render('test')
    })

    request(app)
    .post('/path/to/test/create')
    .field('key', 'cascade.msg1')
    .end(function () {
      request(app)
      .put('/path/to/test/update')
      .send({
        data: {
          variant: 'en.test',
          key: 'cascade.msg1'
        },
        value: 'cascade message'
      })
      .end(function () {



        request(app)
        .post('/path/to/test/create')
        .field('key', 'cascade.msg2')
        .end(function () {
          request(app)
          .put('/path/to/test/update')
          .send({
            data: {
              variant: 'en.test2',
              key: 'cascade.msg2'
            },
            value: 'priority message'
          })
          .end(function () {
            request(app)
            .get('/route')
            .expect(/priority message/)
            .expect(/cascade message/, done)
          })
        })

      })
    })


  })

})
