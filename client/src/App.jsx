import { useState, useEffect } from "react";
import "./App.css";
import TicketRoute from "./components/Ticket.jsx";
import DefaultRoute from "./components/Default.jsx";
import { BrowserRouter, Routes, Route, Outlet, Link } from "react-router-dom";
import API from "./API.jsx";
import LoginContext from "./context/loginContext.js";
import Layout from "./components/Layout.jsx";
import LoginForm from "./components/Login.jsx";
import exportedObject from './components/Manager';

//ROUTES
// / = initial page
// /create = create a ticket
// /edit = edit a ticket
// /add/:id = show the form to add a block to a ticket identified by :id


function App(props) {
  const [user, setUser] = useState(undefined);
  const [tickets, setTickets] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [dirty, setDirty] = useState(true);

  const { CreateTicket, AddBlock } = exportedObject;

  useEffect(() => {
    if(dirty){
      API.getTickets().then((tickets) => setTickets(tickets));
      setDirty(false);
    }
    
  }, [dirty]);

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
            <Route index element={<TicketRoute tickets={tickets} />} />
            <Route path="/create" element={<CreateTicket errorMessage={errorMessage} setErrorMessage={setErrorMessage} dirty={dirty} setDirty={setDirty}/>} />
            <Route path="/add/:id" element={<AddBlock errorMessage={errorMessage} setErrorMessage={setErrorMessage} dirty={dirty} setDirty={setDirty}/>} />
            <Route path="/login" element={<LoginForm errorMessage={errorMessage} setErrorMessage={setErrorMessage} loginSuccessful={loginSuccesful}/>} />
            <Route path="/*" element={<DefaultRoute />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LoginContext.Provider>
  );
}

export default App;
