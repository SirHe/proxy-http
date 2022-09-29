const http = require('http')
const ws = require('ws')
const { v1 } = require('node-uuid')

let wsSock = null
let httpSock = null

const httpServer = http
  .createServer((req, res) => {
    req.setEncoding('utf-8')
    httpSock = res

    let postData = ''
    // 数据块接收中
    req.on('data', function (postDataChunk) {
      postData += postDataChunk
    })

    req.on('end', function () {
      // const key = v1().replace(/-/g, '')
      // const sign = `${req.url}*${req.method}*${key}`

      // 暂时不支持并发（默认url中没有 *）
      const sign = `${req.url}*${req.method}`
      const len = String(sign.length).padStart(3, 0)

      wsSock.send(postData + sign + len)
    })
  })
  .listen('80', () => {
    console.log('http服务已启动~')
  })

const wsServer = new ws.Server({
  host: 'localhost',
  port: 6080,
})
wsServer.on('connection', (sock) => {
  wsSock = sock

  sock.on('message', (data) => {
    const msg = data.toString()
    httpSock.end(msg)
  })

  sock.on('close', () => console.log('client close'))
  sock.on('error', (err) => console.log('client error', err))
})
wsServer.on('error', (err) => console.log(err))
