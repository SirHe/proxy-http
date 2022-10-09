const http = require('http')
const ws = require('ws')
const { v1 } = require('node-uuid')

let wsSock = null
let httpSock80 = null
let httpSock1412 = null

http
  .createServer((req, res) => {
    req.setEncoding('utf-8')
    httpSock80 = res

    let data = ''
    // 数据块接收中
    req.on('data', function (chunk) {
      data += chunk
    })

    req.on('end', function () {
      // const key = v1().replace(/-/g, '')
      // const sign = `${req.url}*${req.method}*${key}`

      // 暂时不支持并发（默认url中没有 *）
      const sign = `${req.url}*${req.method}*80`
      const len = String(sign.length).padStart(3, 0) // 用三位表示长度

      wsSock.send(data + sign + len)
    })
  })
  .listen('80', () => {
    console.log('http服务已启动~')
  })

http
  .createServer((req, res) => {
    req.setEncoding('utf-8')
    httpSock1412 = res

    let data = ''
    // 数据块接收中
    req.on('data', function (chunk) {
      data += chunk
    })

    req.on('end', function () {
      // const key = v1().replace(/-/g, '')
      // const sign = `${req.url}*${req.method}*${key}`

      // 暂时不支持并发（默认url中没有 *）
      const sign = `${req.url}*${req.method}*1412`
      const len = String(sign.length).padStart(3, 0)

      wsSock.send(data + sign + len)
    })
  })
  .listen('1412', () => {
    console.log('http服务已启动~')
  })

const wsServer = new ws.Server({ port: 6080 })
wsServer.on('connection', (sock) => {
  wsSock = sock

  sock.on('message', (data) => {
    const msg = data.toString().slice(0, -4)
    const httpSockNum = Number(data.toString().slice(-4))
    switch (httpSockNum) {
      case 80:
        httpSock80.end(msg)
        break
      case 1412:
        httpSock1412.end(msg)
        break
    }
  })

  sock.on('close', () => console.log('client close'))
  sock.on('error', (err) => console.log('client error', err))
})
wsServer.on('error', (err) => console.log(err))
