import "./App.css"


function LoginPage({onSwitch,LoginSuccess}) {
                    //LoginSuccess()
    async function Login() {
        const UsernameText = document.getElementById("UsernameText").value?.trim()
        const PasswordText = document.getElementById("PasswordText").value?.trim()

        if (UsernameText.length == 0 || PasswordText.length == 0) {
            alert("Username or password is empty")
            return
        }

        const response = await fetch("/Login",{
            method : "POST",
            headers : {"Content-Type" : "application/json"},
            body : JSON.stringify({Username : UsernameText,Password : PasswordText})
        })

        const Data = await response.json()

        alert(Data.message)

        if (Data.message == "Login Successful!") {
            LoginSuccess()
            sessionStorage.setItem("Username",UsernameText)

            const GetUserID = await fetch("/GetUserID",{
            method : "POST",
            headers : {"Content-Type" : "application/json"},
            body : JSON.stringify({username : UsernameText})
                })


                const ID = await GetUserID.json()
                sessionStorage.setItem("user_id",ID.message)
        }


    }




    return (
        <div>

            <div className="Container">
                <textarea  className="Username"   id="UsernameText" placeholder="Username"></textarea>
                <textarea  className="Password" id="PasswordText" placeholder="Password"></textarea>

                <button onClick={Login} className="LoginButton">Login</button>

            </div>


        <div>
            <div className="PromptContainer">
                <h1 className="SignText">New here?</h1>
                <button onClick={onSwitch} className="SignPrompt">Sign here!</button>
            </div>
        </div>

        </div>
    )
}



export default LoginPage