import "./App.css"

function SignupPage() {


        async function Create() {
        const UsernameText = document.getElementById("UsernameText").value?.trim()
        const PasswordText = document.getElementById("PasswordText").value?.trim()
        const ConfrimPasswordText = document.getElementById("ConfrimPasswordText").value?.trim()

        if (UsernameText.length == 0 || PasswordText.length == 0) {
            alert("Username or password is empty")
            return
        }
        if (PasswordText.length < 8) {
            alert("Password must be longer than 8 characters")
            return
        }

        if (PasswordText != ConfrimPasswordText) {
            alert("Password does not match")
            return
        }



        const response = await fetch("/Create",{
            method : "POST",
            headers : {"Content-Type" : "application/json"},
            body : JSON.stringify({Username : UsernameText,Password : PasswordText})
        })

        const Data = await response.json()

        alert(Data.message)

        if (Data.message == "Account created!") {
            window.location.reload()
        }


    }


    return (
        <div>
              <div className="Container">
                <textarea  className="Username"   id="UsernameText" placeholder="Username"></textarea>
                <textarea  className="Password" id="PasswordText" placeholder="Password"></textarea>
                <textarea  className="ConfrimPassword" id="ConfrimPasswordText" placeholder=" Confrim Password"></textarea>

                <button onClick={Create}   className="SignButton">Create</button>
            </div>
        </div>
    )
}


export default SignupPage