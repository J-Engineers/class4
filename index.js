const  { createServer }  = require('node:http');
const url = require('url')
const fs = require('fs')
const path = require('path')

const dotenv = require("dotenv");
const { test } = require('./controller/calculator');
dotenv.config({ path: 'config/env.env' })


const server = createServer();

server.on('request', async (req, res, next) => {
  const parsedUrl = url.parse(req.url, true)
  if(parsedUrl.pathname == '/' && req.method == "GET"){
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end(`Welcome to the class ${parsedUrl.query.name}`)
  }
  if(parsedUrl.pathname == '/calculate' && req.method == "POST"){
    let body = ''

    req.on('data', chunk => {
      body += chunk.toString()
    })

    req.on('end', async () => {
      try {
        res.writeHead(201, {'Content-Type': 'application/json'})
        const parsedBody = JSON.parse(body)
        const result = await test(
          parsedBody.operator,
          parsedBody.value1,
          parsedBody.value2
        )
        res.end(JSON.stringify({ massage: "Calculation is done", data: result }))
      }catch (err){
        res.writeHead(500, {'Content-Type': 'application/json'})
        res.end(JSON.stringify({error: err}))
      }
    })
  }
  if(parsedUrl.pathname == '/register' && req.method == 'POST'){
    
    let body = ''

    req.on('data', chunk => {
      body += chunk.toString()
    })

    req.on('end', () => {
      try {
        res.writeHead(201, {'Content-Type': 'application/json'})
        const parsedBody = JSON.parse(body)
        res.end(JSON.stringify({ massage: "Created successfully", data: parsedBody }))
      }catch (err){
        res.writeHead(500, {'Content-Type': 'application/json'})
        res.end(JSON.stringify({error: err}))
      }
    })
  }

  if(parsedUrl.pathname == "/write-file", req.method == "POST"){
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })

    req.on('end', () => {
      const bodyParsed = JSON.parse(body)
      try{
        let msg = "File created succesfully"
        const fullPath = path.join('files', bodyParsed.fileName)
        fs.writeFile(fullPath, bodyParsed.fileContent, err => {
          if (err) throw new err
          console.log(msg)
        })
        res.writeHead(201, {'Content-Type': "application/json"})
        res.end(JSON.stringify({message: msg, data: bodyParsed}))
      }catch(error){
        console.log(error)
      }
    })
  }
  if(parsedUrl.pathname == "/read-file" && req.method == "GET"){
    const parsedParams = parsedUrl.query
    try{
      fs.readFile(path.join('files', parsedParams.fileName), 'utf-8', (err, data) => {
        if (err) throw new err
        res.writeHead(200, {'Content-Type': 'application/json'})
        res.end(JSON.stringify({message: "Found the content", data }))
      })
    }catch(error){
      console.log(error)
    }
  }
})

server.listen(process.env.PORTNUMBER, process.env.IP, () => {
  console.log(`Listening on ${process.env.IP}:${process.env.PORTNUMBER}`);
});