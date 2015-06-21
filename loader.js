(function () {

  function interpolate(key, locals) {
    locals = locals || {}
    return key.replace(/\{([^\}]+?)}/g, function (_, m) {
      return locals[m] || ''
    })
  }

  window.t = function t(key, locals) {
    var str = (E[key] || '')
    var s = interpolate(str, locals)
    return {
      backup: function backup(text) {
        return s || interpolate(text, locals)
      }
    }
  }

}());
