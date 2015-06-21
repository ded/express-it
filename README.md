## Express it
Serve custom translation variants for your `Express 4.x` app.

``` sh
$ npm install express-it --save
```

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

### A fully managed translation center
This tool comes with an administration interface (integration required) allowing you to update message copy in real-time.

![http://f.cl.ly/items/441U3r1Z1F1n3V3Q2u27/Screen%20Shot%202015-06-20%20at%2010.53.18%20PM.png](http://f.cl.ly/items/441U3r1Z1F1n3V3Q2u27/Screen%20Shot%202015-06-20%20at%2010.53.18%20PM.png)


### Integration

 ``` javascript
var client = require('redis').createClient()
var VARIANTS = ['en.default', 'en.tech', 'en.millenials', 'en.fb_mom_campaign', 'en.pinterest_users']
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

### Usage
Both client and server templates can take advantage of the `t()` function. The usage of the `backup()` method is *required* in all circumstances in cases where redis fails, or if a key is not found.

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

### Tests
see `tests/index.js`

``` sh
$ npm test
```

### Contributions
Yes please, and always welcome! Please consider the primary goals too. This is not intended to be a full `i18n` replacement. However performance improvements, bug fixes, and minor feature additions are fully welcomed!

#### Licence MIT

`express-it` is © 2015 Dustin Diaz and licensed under MIT. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE file for details.
