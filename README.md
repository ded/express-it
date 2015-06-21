## Express it
Serve custom translation variants for your `Express 4.x` app.

Peer dependencies required
 - `express`: For translation center & middleware integration.
 - `redis`: For storing persistent translations in memory.

### Purpose
If you’ve ever wanted to serve different message copy to a user based on varying cirumstances, this is the right tool.

This tool *can also be used* as a light-weight solution to `i18n` (internationalization), however be mindful that the scope of this project is **not** aimed at creating custom routing, dealing with pluralisation, or custom number formatting. It can, however, live along side your existing `i18n` framework (if this is your desire).

### How it works
The idea is to put the user into a custom translation variant based on any arbitrary data you see fitting. For example, several websites will use different messaging based on the users demographic, or if they were invited through a specific campaign or community.

Thus, instead of having to do this everywhere throughout your code...

``` js
if (user.age > 18 && user.age < 24 && user.gender == 'female') {
  render('<p>Like, hello {name}. Your totes welcome to the fridge</p>')
}
else if (user.age >= 21 && user.gender == 'male') {
  render('<p>Yo {name}. The beer is in the fridge.</p>')
} else {
  render('<p>Welcome {name}. Here is the fridge.</p>')
}
```

You could do something like this (we’ll show you how to setup a user in a variant later):

``` jade
.welcome
  p!= t('welcome.fridge.msg', { name: user.first_name }).backup('Welcome {name}. Here is the fridge.')
```


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
  // this introspection can be async
  req.variant = 'en.default' // or some other variant based on user data
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
