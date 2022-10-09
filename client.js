const http = require('http')
const ws = require('ws')

const portMap = { 80: 9529, 1412: 1412 }
const sock = new ws('ws://47.110.224.195:6080')
sock.on('message', (data) => {
  const msg = data.toString()
  const len = Number(msg.slice(-3))
  const sign = msg.slice(-3 - len, -3)
  const realData = msg.slice(0, -3 - len)
  const [url, method, port] = sign.split('*')
  console.log(realData, '======')
  const req = http
    .request(
      {
        hostname: 'localhost',
        port: portMap[port], // 需要代理到本地的端口
        method,
        path: url,
      },
      (res) => {
        let data = ''

        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          sock.send(`${data.toString()}${port.padStart(4, 0)}`)
        })
      }
    )
    .on('error', (err) => console.log('Error: ', err.message))
    .end(realData)
})

sock.on('open', () => console.log('connect success !!!!'))
sock.on('error', (err) => console.log('error: ', err))
sock.on('close', () => console.log('close'))
