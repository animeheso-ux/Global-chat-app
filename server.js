const express = require('express')
const { exec } = require('child_process')
const mysql = require("mysql2")
const bcrypt = require("bcrypt")
const path = require('path')
const { WebSocketServer } = require("ws")
const http = require("http")
const SaltRounds = 10

const app = express()
const server = http.createServer(app)
const Server = new WebSocketServer({server})





app.use(express.json())
app.use(express.static(path.join(__dirname, 'chat-app/dist')))

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'chat-app/dist', 'index.html'))
})

const PORT = 3000

console.log('Building React app...')
exec('cd chat-app && npm run build', (error) => {
  if (error) {
    console.error('Build failed:', error)
    return
  }

  console.log('Build successful!')


  //app.listen if I don't use websockets
  //server.listen if i USE websockets

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)

    if (process.platform === 'win32') {
      exec(`start http://localhost:${PORT}`)
    } else if (process.platform === 'darwin') {
      exec(`open http://localhost:${PORT}`)
    } else {
      exec(`xdg-open http://localhost:${PORT}`)
    }
  })
})




require("dotenv").config()


const db = mysql.createConnection({
  host : process.env.HOST,
  user : process.env.USER,
  password : process.env.PASSWORD,
  database : process.env.DATABASE,
})

db.connect(function(err) {
  if (err) {
    console.log("Error")
  }

  console.log("SQL IS CONNECTED!")
})




Server.on("connection",function(ws) {
  console.log("SERVER ONLINE")
   var CURRENT_ROOM = "Global"

  db.query("SELECT * FROM rooms ORDER BY room_id DESC LIMIT 50",(err,results)=> {
    ws.send(JSON.stringify({type : "LoadRooms",history : results}))
  })

  db.query("SELECT * FROM messages ORDER BY created_at DESC LIMIT 50",(err,results)=> {
    ws.send(JSON.stringify({type : "Load",history : results}))
  })




  
     const interval =  setInterval(() => {
            var ClientCount = Server.clients.size
              ws.send(JSON.stringify({type : "Update" ,Count : ClientCount}))
      },5000);


      ws.on("close",function() {
        console.log("Client disconnected")
        clearInterval(interval)
      })

  ws.on("message",function(data){
    const Data = JSON.parse(data.toString())
    const id = Math.floor(new Date().getTime() * Math.random())

  if (Data.type == "JoinRoom") {
    console.log("CHANGED TO ROOM",Data.name)
    CURRENT_ROOM = Data.name
    return // stop here, no need to broadcast
  }

     Server.clients.forEach(function(client) {

      if (Data.type == "Chat") {
        console.log("CURRENT ROOM",CURRENT_ROOM)
        client.send(JSON.stringify({type : "Chat" ,msg : Data.message,Owner : Data.sender,msg_id : id, ROOM_NAME : CURRENT_ROOM}))
      }else if (Data.type == "Status") {
        client.send(JSON.stringify({type : "Status" ,Status : Data.message}))
      }else if (Data.type == "Change") {
        client.send(JSON.stringify({type : "Change", change : Data.message, Obj_ID : Data.object_id}))
      }else if (Data.type == "Delete") {
        client.send(JSON.stringify({type : "Delete",Obj_ID : Data.object_id}))
      }else if (Data.type == "CreateRoom") {
        client.send(JSON.stringify({type : "CreateRoom", name : Data.room_name}))
      }


    })


  })
})


app.post("/CreateRoom",(req,res) => {
  const {name} = req.body


  db.query("INSERT INTO rooms (room_name) VALUES (?)",[name],async(err,results) => {

    if (err) {
      res.json({message : "ERROR CANNOT CREATE ROOM!"})
    }

    res.json({message : "ROOM SUCCESSFULLY CREATED!"})
  })
})

app.post("/SaveMsg",(req,res) => {
  const {msg,msg_id,user_ID} = req.body

  console.log(msg,msg_id,user_ID)

  db.query("SELECT * FROM messages WHERE message_id = ?",[msg_id],async(err,results)=> {

    if (err) {
      res.json({message : "Error"})
      return
    }

    if (results.length > 0 ) {
      return
    }
  })

  db.query("INSERT INTO messages (user_id,message,message_id,created_at) VALUES(?,?,?,?)",[user_ID,msg,msg_id,new Date()],async(err,results) => {

    if (err) {
      res.json({message : "ERROR!"})
      return
    }

    res.json({messages : "Successfully saved!"})
  })

})


app.post("/UpdateMsg",(req,res) => {
  const {msg_id,msg} = req.body

  db.query("SELECT * FROM messages WHERE message_id = ?",[msg_id],async(err,results)=> {

    if (err) {
      res.json({message : "ERROR MESSAGE_ID NOT FOUND"})
      return
    }

    if (results.length > 0) {
      db.query("UPDATE messages SET message = ? WHERE message_id = ?",[msg,msg_id],async(err,results)=> {

        if (err) {
          res.json({message : "Error"})
        }

        res.json({message : "Database updated!"})


      })
    }

  })
})

app.post("/GetUserID",(req,res)=> {
  const {username} = req.body


  db.query("SELECT id FROM users WHERE username = ?",[username],async(err,results) => {

    if (err) {
      res.json({message : "ERROR!"})
      return
    }


    res.json({message : results[0].id})
  })
})






app.post("/Login",(req,res) => {
  const {Username,Password} = req.body

  db.query("SELECT * FROM users WHERE username = ?",[Username],async(err,results) => {

    if (err) {
      res.json({message : "ERROR"})
      return
    }

    if (results.length == 0 ) {
      res.json({message : "USER NOT FOUND!"})
      return
    }

    // If user exist in db
    const User = results[0]
    const Verify = bcrypt.compareSync(Password,User.password)

    if (Verify) {
      res.json({message : "Login Successful!"})
    }else {
      res.json({message : "Incorrect Password"})
    }


  })

})


app.post("/Create",(req,res)=> {
    const {Username,Password} = req.body

    db.query("SELECT * FROM users WHERE username = ?",[Username],async(err,results) => {

      if (err) {
        res.json({message : "Error"})
        return
      }

      if (results.length > 0 ) {
      res.json({message : "username has been taken"})
      return
    }

    const HashedPassword = bcrypt.hashSync(Password,SaltRounds)

        db.query("INSERT INTO users (username,password) VALUES(?,?)",[Username,HashedPassword],async(err,results)=> {
          
        if (err) {
            res.json({message : "Error"})
            return
           }
        })


        res.json({message : "Account created!"})






    })

})


