# epii-server
###### `epii-node-server`

[![Build Status](https://travis-ci.org/epii-io/epii-node-server.svg?branch=master)](https://travis-ci.org/epii-io/epii-node-server)
[![Coverage Status](https://coveralls.io/repos/github/epii-io/epii-node-server/badge.svg?branch=master)](https://coveralls.io/github/epii-io/epii-node-server?branch=master)

A koa-based server with preset MVC model.

**Please upgrade to v3+ for node 8 !!!**

- koa-router for controller
- koa-send for static files
- koa-body for body parse & file upload
- epii-html5 for main document

## Features

### MVC pipeline

    (Request)
      => Middleware => Controller => View =>
    (Response)

### ASP.net-liked

Different ActionResult makes different response.  

```js
// controller
module.exports = [
  {
    path: '/',
    verb: 'get',
    body: async function () {
      // response text/plain
      return this.epii.text('text output')

      // response application/json
      return this.epii.json({ state: true })

      // response text/html by ViewRender
      return this.epii.view({ name: 'Li Lei' })

      // response application/octet-stream
      return this.epii.file('dataset.csv')
    }
  }
]
```

### support custom layout

```js
// client/index.meta.js
module.exports = {
  base: 'simple', // inherit simple layout
  head: {
    styles: 'client/index.css'
  },
  body: {
    holder: 'client/index.html',
    scripts: 'client/index.js'
  }
}

// layout/simple.meta.js
module.exports = {
  head: {
    title: 'EPII Avatar',
    metas: [],
    styles: 'reset.css',
    icon: 'epii-icon.png'
  },
  body: {
    scripts: 'jquery-2.2.2.min.js'
  }
}
```

Or you maybe want to write HTML directly.

```js
// client/index.meta.js
module.exports = {
  html: 'client/index.html'
}
```

See also `epii-html5`.

## Usage

### project like this

```sh
(root)
├── layout
│   └── simple.meta.js
├── client
│   ├── ViewA
│   │   └── index.meta.js
│   └── ViewB
│       └── index.meta.js
├── server
│   ├── middleware
│   │   └── $order.js
│   └── controller
│       └── index.js
└── static
```

### install as dependency
```sh
npm install --save epii-server@latest
```

### use api to start server
```js
const epiiServer = require('epii-server')

epiiServer([{
  name: 'YOUR-APP-NAME',
  port: 8080,
  path: {
    root: __dirname,
    server: {
      controller: 'server/controller',
      middleware: 'server/middleware'
    },
    client: 'client',
    layout: 'layout',
    static: 'static',
    upload: 'upload'
  },
  prefix: {
    static: '__static'
  }
}])
```
