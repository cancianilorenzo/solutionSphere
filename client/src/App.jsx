import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import MyNavbar from "./components/Navbar.jsx";
import Ticket from "./components/Ticket.jsx";
import MyFooter from "./components/Footer.jsx";
import DefaultRoute from "./components/Default.jsx";
import { BrowserRouter, Routes, Route, Outlet, Link } from "react-router-dom";
import CreateTicket from "./components/Manager.jsx";
import { Container, Row, Col } from "react-bootstrap";

const tickets = [
  {
    id: 1,
    owner: 1,
    state: "open",
    title: "Inquiry Ticket",
    timestamp: "2024-06-14 11:06:08",
    category: "inquiry",
  },
  {
    id: 2,
    owner: 2,
    state: "open",
    title: "Maintenance Ticket",
    timestamp: "2024-06-14 11:06:08",
    category: "maintenance",
  },
  {
    id: 3,
    owner: 3,
    state: "open",
    title: "New Feature Ticket",
    timestamp: "2024-06-14 11:06:08",
    category: "new feature",
  },
  {
    id: 4,
    owner: 4,
    state: "open",
    title: "Administrative Ticket",
    timestamp: "2024-06-14 11:06:08",
    category: "administrative",
  },
  {
    id: 5,
    owner: 5,
    state: "open",
    title: "Payment Ticket",
    timestamp: "2024-06-14 11:06:08",
    category: "payment",
  },
];

import LoginContext from "./context/loginContext.js";

//ROUTES
// / = initial page
// /create = create a ticket
// /edit = edit a ticket
// /add/:id = show the form to add a block to a ticket identified by :id

function App() {
  const [user, setUser] = useState(["user", false]);
  return (
    <LoginContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<TicketRoute />} />
            <Route path="/create" element={<CreateTicket />} />
            <Route path="/*" element={<DefaultRoute />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LoginContext.Provider>
  );
}

function Layout() {
  return (
    <>
      <Container>
        <Row className="justify-content-md-center">
          <Col md={11}>
            <MyNavbar appName="SolutionSphere" />
          </Col>
        </Row>
        <p></p>
        <Row className="justify-content-md-center">
          <Col md={9}>
            <div className="content">
                <Outlet />
            </div>
          </Col>
        </Row>
      </Container>
      <p></p>
      <MyFooter appName="SolutionSphere" className="footer" />
    </>
  );
}
function TicketRoute(props) {
  return (
    <>
      <Ticket listOfTickets={tickets} />
    </>
  );
}

export default App;
