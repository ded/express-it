var variants = {}
var fs = require('fs')

function reloadVariants(config, optCb) {
  config.redis.mget(config.variants.map(function m(key) { return '_expt:' + key }), function cb(err, values) {
    values.forEach(function (val, i) {
      variants[config.variants[i]] = JSON.parse(val)
    })
    optCb && optCb()
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

  app.use(require('node-sass-middleware')({
    debug: true,
    src: __dirname + '/public',
    dest: __dirname + '/public',
    outputStyle: 'compressed',
    indentedSyntax: true
  }))

  app.use(config.express.static(__dirname + '/public'))
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
  app.delete('/remove', remove.bind(config))
  return app
}

function create(req, res, next) {
  var self = this
  var key = '_expt:' + self.variants[0]
  self.redis.get(key, function (err, val) {
    val = JSON.parse(val)
    val[req.body.key] = ''
    self.redis.set(key, JSON.stringify(val), function (err) {
      reloadVariants(self, function () {
        res.json({
          ok: err ? 0 : 1
        })
      })
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
      reloadVariants(self, function () {
        res.json({
          ok: err ? 0 : 1
        })
      })
    })
  })
}

function remove(req, res, next) {
  var self = this
  console.log('req', req.body)
  var key = '_expt:' + req.body.key
  self.redis.mget(self.variants.map(function (v) {
    return '_expt:' + v
  }),
  function (err, values) {
    values = values.map(function (val) {
      val = JSON.parse(val)
      delete val[req.body.key]
      return val
    })
    var sets = []
    for (var i = 0; i < self.variants.length; i++) {
      sets.push('_expt:' + self.variants[i])
      sets.push(JSON.stringify(values[i]))
    }
    self.redis.mset(sets, function (err) {
      reloadVariants(self, function () {
        res.json({
          ok: err ? 0 : 1
        })
      })
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
    variant = typeof variant === 'string' ? variant : variant[0]
    return {
      getLoader: function getLoader() {
        return '<script>window.E = ' + JSON.stringify(variants[variant]) + ';</script><script src="/express-it/index.js"></script>'
      }
    }
  }


  function middle(req, res, next) {
    if (req.url === '/express-it/index.js') return handleStaticLoader(req, res)
    res.locals.E = loader(req.variant)
    res.locals.t = branchTranslate.bind(null, req.variant)
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

  function branchTranslate(variant, key, locals) {
    if (typeof variant === 'string') {
      var block = variants[variant]
      return block[key] ? translate(block[key], locals) : defaultTranslate(key, locals)
    } else if (variant.length) {
      for (var i = 0; i < variant.length; i++) {
        var block = variants[variant[i]]
        if (block[key]) return translate(block[key], locals)
      }
    }
    return defaultTranslate(key, locals)
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
