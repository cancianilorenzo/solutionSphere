import { useState, useEffect } from "react";
import TicketRoute from "./components/Ticket.jsx";
import DefaultRoute from "./components/Default.jsx";
import { BrowserRouter, Routes, Route} from "react-router-dom";
import API from "./API.jsx";
import LoginContext from "./context/loginContext.js";
import Layout from "./components/Layout.jsx";
import LoginForm from "./components/Login.jsx";
import exportedObject from './components/Manager';


function App(props) {
  const [user, setUser] = useState(undefined);
  const [tickets, setTickets] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [dirty, setDirty] = useState(true);
  const [blocks, setBlocks] = useState([]);

  const { CreateTicket, AddBlock } = exportedObject;

  // console.log(dirty);

  useEffect(() => {
    const intervalId = setInterval(() => {
        setDirty(true);
    }, 180000);
}, []);

  useEffect(() => {
    if(!user){
      setBlocks([]);//Empty array to avoid old states
    }
    if(user){
      API.getBlocks().then((blocks) => setBlocks(blocks));
    }
    if(dirty){
      API.getTickets().then((tickets) => setTickets(tickets));
      // if(user){
      //   API.getBlocks().then((blocks) => setBlocks(blocks));
      // }
      setDirty(false);
    }
    
  }, [dirty, user]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await API.getInfo();
        setUser(user);
      } catch (err) {
        console.error(err);
      }
    };
    checkAuth();
  }, []);

  const loginSuccesful = (user) => {
    setUser(user);
  }

  const logout = () => {
    API.logout().catch((err) => console.error(err));
    setUser(undefined);
  }

  return (
    <LoginContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout logout={logout}/>}>
            <Route index element={<TicketRoute tickets={tickets} setDirty={setDirty} blocks={blocks} errorMessage={errorMessage} setErrorMessage={setErrorMessage}/>} />
            {user && <Route path="/create" element={<CreateTicket errorMessage={errorMessage} setErrorMessage={setErrorMessage} setDirty={setDirty}/>} />}
            <Route path="/login" element={<LoginForm errorMessage={errorMessage} setErrorMessage={setErrorMessage} loginSuccessful={loginSuccesful} setDirty={setDirty}/>} />
            <Route path="/*" element={<DefaultRoute />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LoginContext.Provider>
  );
}

export default App;
