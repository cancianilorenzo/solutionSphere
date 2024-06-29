//TODO
//Jest testing

import { useState, useEffect } from "react";
import TicketRoute from "./components/Ticket.jsx";
import DefaultRoute from "./components/Default.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import API from "./API.js";
import LoginContext from "./context/loginContext.js";
import Layout from "./components/Layout.jsx";
import LoginForm from "./components/Login.jsx";
import exportedObject from "./components/Manager";

function App(props) {
  const [user, setUser] = useState(null); //Previolusly undefined
  const [tickets, setTickets] = useState([]);
  const [dirty, setDirty] = useState(true);
  const [blocks, setBlocks] = useState([]);
  const [updateBlocks, setUpdateBlocks] = useState(true);
  const [jwt, setJwt] = useState(null);
  const [TimeEstimations, setEstimations] = useState([]);
  const [error, setError] = useState("");

  const { CreateTicket } = exportedObject;

  const getJwt = () => {
    API.getAuthToken().then((resp) => setJwt(resp.token));
  };

  //Every 3 mins refresh filmList --> update from other users!
  useEffect(() => {
    const intervalId = setInterval(() => {
      setDirty(true);
    }, 180000);
  }, []);

  //UseEffect for checking authN
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await API.getInfo();
        setUser(user);
      } catch (err) {
        null;
      }
    };
    checkAuth();
  }, []);

  //UseEffect for basic application logic
  useEffect(() => {
    if (!user) {
      setBlocks([]); //Empty array to avoid old states
      setJwt(null); //Flush jwt
    }
    if (user && updateBlocks) {
      API.getBlocks().then((blocks) => setBlocks(blocks));
      getJwt();
      setUpdateBlocks(false);
    }

    if (dirty) {
      API.getTickets()
        .then((tickets) => setTickets(tickets))
        .catch((err) => null);
      setDirty(false);
    }
  }, [dirty, user, updateBlocks]);


  //TODO setError and show error
  //UseEffect to retrieve estimations
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        API.getEstimation(jwt, tickets)
          .then((estimations) => {
            const result = estimations.map((obj) => obj.estimation);
            setEstimations(result);
          })
          .catch((err) => {
            API.getAuthToken()
              .then((resp) => {
                setJwt(resp.token);
                API.getEstimation(resp.token, tickets)
                  .then((estimations) => {
                    const result = estimations.map((obj) => obj.estimation);
                    setEstimations(result);
                  })
                  .catch((err) => setError(err));
              })
              .catch((err) => setError(err));
          });
      }
      // }
    }
  }, [tickets]);

  const loginSuccesful = (user) => {
    setUser(user);
    setDirty(true);
    setUpdateBlocks(true);
  };

  const logout = () => {
    API.logout().catch((err) => setError(err));
    setUser(null);
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
                  setUpdateBlocks={setUpdateBlocks}
                  error={error}
                />
              }
            />
            {user && (
              <Route
                path="/create"
                element={
                  <CreateTicket
                    setDirty={setDirty}
                    jwt={jwt}
                    setJwt={setJwt}
                    setUpdateBlocks={setUpdateBlocks}
                  />
                }
              />
            )}
            <Route
              path="/login"
              element={
                <LoginForm
                  loginSuccessful={loginSuccesful}
                  logout={logout}
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
