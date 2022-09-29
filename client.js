const http = require('http')
const ws = require('ws')

const sock = new ws('ws://localhost:6080')
sock.on('message', (data) => {
  const msg = data.toString()
  const len = Number(msg.slice(-3))
  const sign = msg.slice(-3 - len, -3)
  const realData = msg.slice(-3 - len)
  const [url, method] = sign.split('*')

  const req = http
    .request(
      {
        hostname: 'localhost',
        port: 5000, // 需要代理到本地的端口
        method,
        path: url,
      },
      (res) => {
        let data = ''

        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          sock.send(data.toString())
        })
      }
    )
    .on('error', (err) => console.log('Error: ', err.message))

  req.write(realData)
  req.end()
})

sock.on('open', () => console.log('connect success !!!!'))
sock.on('error', (err) => console.log('error: ', err))
sock.on('close', () => console.log('close'))
