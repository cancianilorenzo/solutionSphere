//TODO
//Code refactoring (?)
//Jest testing


import { useState, useEffect } from "react";
import TicketRoute from "./components/Ticket.jsx";
import DefaultRoute from "./components/Default.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import API from "./API.jsx";
import LoginContext from "./context/loginContext.js";
import Layout from "./components/Layout.jsx";
import LoginForm from "./components/Login.jsx";
import exportedObject from "./components/Manager";

function App(props) {
  const [user, setUser] = useState(null); //Previolusly undefined
  const [tickets, setTickets] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [dirty, setDirty] = useState(true);
  const [blocks, setBlocks] = useState([]);
  const [jwt, setJwt] = useState(null);
  const [TimeEstimations, setEstimations] = useState([]);

  const { CreateTicket } = exportedObject;

  //Every 3 mins refresh filmList --> update from other users!
  useEffect(() => {
    const intervalId = setInterval(() => {
      setDirty(true);
    }, 180000);
  }, []);

  const getJwt = () => {
    API.getAuthToken().then((resp) => setJwt(resp.token));
  }

  //UseEffect for basic application logic
  useEffect(() => {
    if (!user) {
      setErrorMessage(null); //Flush error message
      setBlocks([]); //Empty array to avoid old states
      setJwt(null); //Flush jwt
    }
    if (user) {
      setErrorMessage(null); //Flush error message
      API.getBlocks().then((blocks) => setBlocks(blocks));
      getJwt();
    }
    if (dirty) {
      API.getTickets().then((tickets) => setTickets(tickets));
      setDirty(false);
    }
  }, [dirty, user]);


  //UseEffect to fretrieve estimations
  useEffect(() => {
    if (jwt) {
      // console.log(jwt);
      if (user.role === "admin") {
        // console.log("Admin");
        API.getEstimation(jwt, tickets)
          .then((estimations) => {
            const result = estimations.map(obj => obj.estimation);
            setEstimations(result);
          })
          .catch((err) => console.error(err));
      }
    }
  }, [jwt, tickets]);


  //UseEffect for checking authN
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
  };

  const logout = () => {
    API.logout().catch((err) => console.error(err));
    setUser(undefined);
  };

  return (
    <LoginContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout logout={logout} />}>
            <Route
              index
              element={
                <TicketRoute
                  estimations={TimeEstimations}
                  tickets={tickets}
                  setDirty={setDirty}
                  blocks={blocks}
                  errorMessage={errorMessage}
                  setErrorMessage={setErrorMessage}
                />
              }
            />
            {user && (
              <Route
                path="/create"
                element={
                  <CreateTicket
                    errorMessage={errorMessage}
                    setErrorMessage={setErrorMessage}
                    setDirty={setDirty}
                    jwt={jwt}
                    setJwt={setJwt}
                  />
                }
              />
            )}
            <Route
              path="/login"
              element={
                <LoginForm
                  errorMessage={errorMessage}
                  setErrorMessage={setErrorMessage}
                  loginSuccessful={loginSuccesful}
                  setDirty={setDirty}
                />
              }
            />
            <Route path="/*" element={<DefaultRoute />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LoginContext.Provider>
  );
}

export default App;
