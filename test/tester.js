const assert = require('assert')
const crypto = require('crypto')
const fs = require('fs')
const fetch = require('node-fetch')

function getMD5(file, cb) {
  var hash = crypto.createHash('md5')
  var s = fs.createReadStream(file)
  s.on('data', hash.update.bind(hash))
  s.on('end', function () {
    cb(hash.digest('hex'))
  })
}

function send(input) {
  var options = {
    method: input.verb || 'GET',
    headers: {}
  }
  if (input.data) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(input.data)
  }
  if (input.head) {
    Object.keys(input.head).forEach(function (key) {
      options.headers[key] = input.head[key]
    })
  }
  return fetch(`http://localhost:8080${input.path}`, options)
}

function test(title, ctor) {
  it(title, function (done) {
    var params = ctor()
    var input  = params.input
    var output = params.output

    send(input)
    .then(function (response) {
      if (output.head != null) {
        Object.keys(output.head).every(key => {
          var value = output.head[key]
          assert.strictEqual(response.headers.get(key), value, 'unexpected head')
        })
      }
      if (output.code != null) {
        assert.strictEqual(response.status, output.code, 'unexpected code')
      }
      if (output.mime != null) {
        console.log(response.headers.get('content-type'))
        assert(response.headers.get('content-type').indexOf(output.mime) >= 0, 'unexpected mime')
      }
      if (output.file != null && output.hash != null) {
        getMD5(output.file, function (hash) {
          assert.strictEqual(hash, output.hash, 'unexpected hash')
        })
        throw new Error('skip other')
      }
      return response.text()
    })
    .then(function (text) {
      if (text instanceof Error) return
      if (output.text != null) {
        assert.strictEqual(text.trim(), output.text.trim(), 'unexpected text')
      }
      if (output.file != null) {
        var content = fs.readFileSync(output.file, 'utf-8')
        assert.strictEqual(text.trim(), content.trim(), 'unexpected file')
      }
      if (output.json != null) {
        var json = JSON.parse(text)
        if (typeof output.json === 'object') {
          assert.strictEqual(
            JSON.stringify(json),
            JSON.stringify(output.json).trim(),
            'unexpected json'
          )
        } else {
          assert.strictEqual(json.state, output.json, 'unexpected json')
        }
      }
      done()
    })
    .catch(function (error) {
      if (error) {
        if (error.message === 'skip other') {
          done()
        } else {
          console.log(error)
          console.log(error.stack)
          done(error || new Error())
        }
      }
    })
  })
}

module.exports = {
  send, test
}
