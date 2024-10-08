import { React, useContext } from "react";
import { Outlet, Link } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import Navbar from "react-bootstrap/Navbar";
import LoginContext from "../context/loginContext";

function MyFooter(props) {
  return (
    <center>
      <footer>
        <p>&copy; {props.appName}</p>
      </footer>
    </center>
  );
}

function MyNavbar(props) {
  const { user, setUser } = useContext(LoginContext);
  return (
    <Navbar
      expand="lg"
      className="w-100"
      style={{ backgroundColor: "#B7B5B3" }}
    >
      <Container fluid>
        <Row
          className="w-100 justify-content-between align-items-center"
          style={{
            borderRadius: "10px",
            padding: "10px",
          }}
        >
          <Col xs={4} className="text-center">
            <Link to="/">
              <Navbar.Brand>{props.appName || "Ticketing"}</Navbar.Brand>
            </Link>
          </Col>
          <Col xs={4} className="text-center">
            {user && <p>Logged in as {user.username}</p>}
          </Col>
          <Col xs={4} className="text-center">
            {user ? (
              <Button variant="danger" onClick={props.logout}>
                Logout
              </Button>
            ) : (
              <Link to="/login">
                <Button variant="light"> Login </Button>
              </Link>
            )}
          </Col>
        </Row>
      </Container>
    </Navbar>
  );
}

function Layout(props) {
  const { error } = props;
  return (
    <>
      <Container>
        <Row className="justify-content-md-center">
          <Col md={14}>
            <MyNavbar appName="SolutionSphere" logout={props.logout} />
          </Col>
        </Row>
        {error && <h1 className="text-danger">{error}</h1>}
        <p></p>
        <Row className="justify-content-md-center">
          <Col md={9}>
            <div className="content">
              <Outlet />
            </div>
          </Col>
        </Row>
        <p></p>
        <Row className="justify-content-md-center">
          <Col md={14}>
            <MyFooter appName="SolutionSphere" />
          </Col>
        </Row>
      </Container>
      <p></p>
    </>
  );
}

export default Layout;
