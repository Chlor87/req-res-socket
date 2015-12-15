let net    = require('net'),
    stream = require('stream')

class Reverser extends stream.Transform {
  constructor() {
    super()
  }

  _transform(chunk, encoding, done) {
    this.push(chunk.toString().split('').reverse().join(''))
    done()
  }
}

net.createServer(socket => {
  socket.pipe(new Reverser()).pipe(socket)
}).listen(8888, () => {
  console.log(`server listen on ${8080}`)
})
