
import "./App.css"
import { useEffect , useRef } from "react"


function LoadChatWebsite() {
  const wsRef = useRef(null)

  async function SaveMessages(msg,id) {
        const StoreMessages = await fetch("/SaveMsg",{
      method : "POST",
      headers : {"Content-Type": "Application/json"},
      body : JSON.stringify({msg : msg,msg_id : id,user_ID : sessionStorage.getItem("user_id")})
    })

    const Response = await StoreMessages.json()

    console.log(Response.message)
  }


  async function UpdateMessages(id,newMsg) {
      const StoreMessages = await fetch("/UpdateMsg",{
      method : "POST",
      headers : {"Content-Type": "Application/json"},
      body : JSON.stringify({msg_id : id, msg : newMsg})
    })

    const Response = await StoreMessages.json()

    console.log(Response.message)
  }

     async function CreateRoom() {

    const Room = await fetch("/CreateRoom",{
      method : "POST",
      headers : {"Content-Type" : "application/json"},
      body : JSON.stringify({name : sessionStorage.getItem("Username") + "room"})
    })

      wsRef.current.send(JSON.stringify({type : "CreateRoom",room_name : sessionStorage.getItem("Username") + "room"}))
   }



    useEffect(() => {
      const ws = new WebSocket("ws://localhost:3000")
      var user = sessionStorage.getItem("Username")
      const ClientCount = document.getElementById("ClientText")
      const ChatBox = document.getElementById("ChatBox")

      wsRef.current = ws

  if (user != null) {
    const ProfileBox = document.getElementById("ProfileBox")
    ProfileBox.textContent = user
  }

  // message listener OUTSIDE keypress
  ws.addEventListener("message", function(e) {
    const Data = JSON.parse(e.data)

    if (Data.type == "Load") {

      for ( let row of Data.history) {
        const Container = document.getElementById("ChatArea")
      const box = document.createElement('div')
      box.className = "Dialogue"
      box.textContent = row.message
      box.dataset.sender = row.id
      box.id = row.message_id
      Container.appendChild(box)
      }

    }

    if (Data.type == "LoadRooms") {
      for (let room of Data.history) {
      const Container = document.getElementById("RoomList")
      const box = document.createElement("button")
      box.textContent = room.room_name
      box.dataset.sender = room.room_id
      box.id = room.room_id
      Container.appendChild(box)


      box.onclick = function() {
        ws.send(JSON.stringify({type : "JoinRoom" ,name : room.room_name}))
        document.getElementById("RoomName").textContent = room.room_name

        const Collection = Array.from(document.getElementsByClassName("Dialogue"))
        Collection.forEach(Chat => {
          document.getElementById("ChatArea").removeChild(Chat)
        });

      }
      }
    }
    if (Data.type == "Chat" && !document.getElementById("EditText") && Data.ROOM_NAME == document.getElementById("RoomName").textContent) {
    const Container = document.getElementById("ChatArea")
    const box = document.createElement('div')
    box.className = "Dialogue"
    box.textContent = Data.msg
    box.dataset.sender = Data.Owner
    box.id = Data.msg_id
    Container.appendChild(box)


    if (Data.Owner == user) {
      
          SaveMessages(Data.msg,Data.msg_id)
    }




    }else if (Data.type == "Update") {
      ClientCount.textContent = "👤" +  Data.Count
    }
    else if (Data.type == "Status") {
      const StatusText = document.getElementById("StatusText")
      StatusText.textContent = Data.Status
    }
    else if (Data.type == "Change") {   
      document.getElementById(Data.Obj_ID).textContent = Data.change
      document.getElementById("ChatArea").removeChild(document.getElementById("EditText"))

      UpdateMessages(Data.Obj_ID,Data.change)
    }
    else if (Data.type == "Delete") {
      document.getElementById("ChatArea").removeChild(document.getElementById(Data.Obj_ID))
    }
    else if (Data.type == "CreateRoom") {

    }

  })



   document.addEventListener("contextmenu",function(event) {
    event.preventDefault()
    if(event.target.className == "Dialogue") {
      if (event.target.dataset.sender != user) {return}
      if (document.getElementById("Menu")) {return}

      const SelectedElement = event.target; 
      const Menu = document.createElement("div")
      Menu.className = " Container EditMenu"
      Menu.style.left =  event.clientX  + "px";
      Menu.style.top = event.clientY + "px";
      Menu.id = "Menu"

      const Edit = document.createElement("button")
      Edit.className = "EditButton"
      Edit.id = "Edit"
      Edit.textContent = "Edit"

      const Delete = document.createElement("button")
      Delete.className = "EditButton"
      Delete.id = "Delete"
      Delete.textContent = "Delete"

      Menu.appendChild(Edit)
      Menu.appendChild(Delete)
  

      Delete.onclick = function() {
         ws.send(JSON.stringify({type : "Delete",object_id : SelectedElement.id}))
      }

      Edit.onclick = function() {
        const text = document.createElement("textarea")
        document.getElementById("ChatArea").appendChild(text)
        text.id = "EditText"
      }

      document.addEventListener("keypress",function(event) {
            if(event.key == "Enter" && document.getElementById("EditText")) {
              ws.send(JSON.stringify({type : "Change",message : user + ":" + document.getElementById("EditText").value,object_id : SelectedElement.id}))
            }
      })




      Menu.onmouseleave = function() {

          setTimeout(() => {
            const MenuExist = document.getElementById("Menu")
            if (MenuExist) {    document.body.removeChild(MenuExist);}
          }, 150);
      }

      document.body.appendChild(Menu)
    }
  })




      ChatBox.onkeyup = function() {
      ws.send(JSON.stringify({type : "Status",message : user + " " + "is typing...."}))
    }

    ChatBox.onmousedown = function() {
            ws.send(JSON.stringify({type : "Status",message : ""}))
    }

          document.addEventListener("keypress", function(event) {

    if (event.key == "Enter" && ChatBox.value.length > 0) {
      const CurrentTime = new Date().getHours() + ":" +  new Date().getMinutes()
      ws.send(JSON.stringify({type : "Chat" , message : CurrentTime + " "  + user + ":"  + ChatBox.value,sender : user}))
      ChatBox.value = ""
    }
  })


  return () => ws.close()
}, []) // 👈 you're missing this! empty array or it runs every render


    return (
        <div>
          <h1  id="RoomName"  className="MainHeader Global">Global</h1>
          <h1 id="ClientText" className="ClientText">👤</h1>
          <div  id="ProfileBox"   className="ProfileBox"></div>


          <h1 className="MainHeader RoomText">Rooms:</h1>
          <div id="RoomList" className=" Container RoomList">

          </div>

          <button onClick={CreateRoom}  className="SignPrompt CreateRoom">Create room:</button>


            <div id="ChatArea"    className=" Container ChatArea">
              <div className="Dialogue">eqe</div>
            </div>

            <div  className="Container">
            <h1 id="StatusText" className="StatusText" ></h1>
            <textarea id="ChatBox"   className="chat" placeholder="Speak here:"></textarea>
            </div>


        </div>
    )
}


export default LoadChatWebsite