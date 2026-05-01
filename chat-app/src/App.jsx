import "./App.css";
import LoginPage from "./Login";
import SignupPage from "./Signup";
import LoadChatWebsite from "./Chat";
import { useState } from "react";





function App() {
  const [page, setPage] = useState("login"); // "login" | "signup" | "home"

  return (
    <div>
      <header>
        <h1 className="MainHeader">Chat.app💬</h1>
      </header>

      {page === "login" && (
        <LoginPage onSwitch={() => setPage("signup")} 
        LoginSuccess={() => setPage("chat")}></LoginPage>
      )}

      {page === "signup" && (
        <SignupPage onSwitch={()=> setPage("login")}></SignupPage>
      )}

      {page === "chat" && (
        <LoadChatWebsite></LoadChatWebsite>
      )}

    </div>
  );
}

export default App;