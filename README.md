## Express it
Serve custom translation variants for your `Express 4.x` app.

Peer dependencies required
 - `express`: For translation center & middleware integration.
 - `redis`: For storing persistent translations in memory.

### Integration

 ``` javascript
var client = require('redis').createClient()
var VARIANTS = ['en.default', 'en.tech']
YOUR_APP.use('/path/to/translation-center', require('express-it').init({
  express: YOUR_EXPRESS,
  redis: client,
  variants: VARIANTS
}))


YOUR_APP.use(function (req, res, next) {
  req.variant = 'en.default' // (or some other variant based on user data)
  next()
})

YOUR_APP.use(require('express-it').middleware({
  redis: client,
  variants: VARIANTS
}))
 ```

 Usage in your templates (both server and client):

 ``` jade
 .welcome
   p= t('welcome.msg', { name: user.first_name }).backup('Hello {name}. Welcome to our website')
 ```

 Usage from pure client-side

 ``` jade
 // use the "E" view local to load your translations and "t()" function
 html
   head
     title example
     != E.getLoader()
     // etc...
 ```

 ``` html
 // call `t` from anywhere...
 <script>
   window.t('welcome.msg', { name: user.username }).backup('Welcome to Example.com')
 </script>
 ```
