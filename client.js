let net = require('net'),
    stream = require('stream'),
    co  = require('co')

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

class Reader extends stream.Writable {
  constructor() {
    super()
  }

  _write(chunk, encoding, done) {
    chunk = chunk.toString().split('\n')
    chunk.forEach(msg =>
      msg && setTimeout(() => this.emit('message', msg), random(500, 2000))
    )
    done()
  }
}

class Client extends net.Socket {
  constructor() {
    super()
    this.reader = new Reader()
    this.callbacks = []
    this.pipe(this.reader)
    this.reader.on('message', msg => {
      let promise = this.callbacks.shift()
      if (promise && promise.resolve) {
        promise.resolve(msg)
      }
    })
  }

  * init() {
    return new Promise(resolve => {
      this.connect(8888, () => {
        console.log('client connected')
        resolve()
      })
    })
  }

  process(msg) {
    let deferred = Promise.defer()
    this.callbacks.push(deferred)
    this.write(`${msg}\n`)
    return deferred.promise
  }
}

function sleep(n) {
  return new Promise(resolve => setTimeout(resolve, n * 1e3))
}

let client = new Client()

co(function* () {
  yield client.init()
  sleep(1)
  for (let i of Array.from({length: 10}).map(Number.call, Number)) {
    let msg = yield client.process(`test ${i}`)
    console.log(msg)
  }
  client.end()
}).catch(err => console.log(err))
