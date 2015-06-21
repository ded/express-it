var variants = {}
var fs = require('fs')

function reloadVariants(config) {
  config.redis.mget(config.variants.map(function m(key) { return '_expt:' + key }), function cb(err, values) {
    values.forEach(function (val, i) {
      variants[config.variants[i]] = JSON.parse(val)
    })
  })
}


module.exports.init = function (config) {
  var app = config.express()
  var bodyParser = require('body-parser')
  app.set('view engine', 'jade')
  app.set('views', __dirname + '/views')

  config.redis.mget(config.variants.map(function m(key) { return '_expt:' + key }), function cb(err, values) {
    var multi = config.redis.multi()
    values.forEach(function map(val, i) {
      if (!val) {
        multi.set('_expt:' + config.variants[i], '{}')
      }
    })
    multi.exec(function () {})
  })

  app
    .use(bodyParser.urlencoded({
      extended: true,
      limit: '10mb'
    }))

    .use(bodyParser.json({
      limit: '10mb'
    }))

  app.get('/', function (req, res) {
    config.redis.mget(config.variants.map(function i18nmap(key) { return '_expt:' + key }), function cb(err, values) {
      values = values.map(function map(val, i) {
        return val ? {
          variant: config.variants[i],
          value: JSON.parse(val)
        } : {
          variant: config.variants[i],
          value: {}
        }
      })
      res.render('index', {
        variants: config.variants,
        keys: values
      })
    })
  })

  app.post('/create', create.bind(config))
  app.put('/update', update.bind(config))
  return app
}

function create(req, res, next) {
  var self = this
  var key = '_expt:' + self.variants[0]
  self.redis.get(key, function (err, val) {
    val = JSON.parse(val)
    val[req.body.key] = ''
    self.redis.set(key, JSON.stringify(val), function (err) {
      res.json({
        ok: err ? 0 : 1
      })
      reloadVariants(self)
    })
  })
}

function update(req, res, next) {
  var self = this
  var key = '_expt:' + req.body.data.variant
  self.redis.get(key, function (err, val) {
    val = JSON.parse(val)
    val[req.body.data.key] = req.body.value
    self.redis.set(key, JSON.stringify(val), function (err) {
      res.json({
        ok: err ? 0 : 1
      })
      reloadVariants(self)
    })
  })
}

module.exports.middleware = function middleware(config) {
  reloadVariants(config)

  var STATIC_DATA = ''

  fs.readFile(__dirname + '/loader.js', 'utf-8', function (err, data) {
    STATIC_DATA = data
  })

  var loader = function (variant) {
    return {
      getLoader: function getLoader() {
        return '<script>window.E = ' + JSON.stringify(variants[variant]) + ';</script><script src="/express-it/index.js"></script>'
      }
    }
  }


  function middle(req, res, next) {
    if (req.url === '/express-it/index.js') return handleStaticLoader(req, res)
    res.locals.E = loader(req.variant)
    res.locals.t = branchTranslate.bind(null, variants[req.variant])
    next()
  }

  function handleStaticLoader(req, res) {
    res.status(200).type('text/javascript').send(STATIC_DATA)
  }

  function interpolate(key, locals) {
    locals = locals || {}
    return key.replace(/\{([^\}]+?)}/g, function (_, m) {
      return locals[m] || ''
    })
  }

  function translate(key, locals) {
    var s = interpolate(key, locals)
    return {
      backup: function backup(text) {
        return s || interpolate(text, locals)
      }
    }
  }

  function branchTranslate(block, key, locals) {
    return block[key] ? translate(block[key], locals) : defaultTranslate(key, locals)
  }

  function defaultTranslate(key, locals) {
    return {
      backup: function backup(text) {
        return interpolate(text, locals)
      }
    }
  }

  return middle
}
