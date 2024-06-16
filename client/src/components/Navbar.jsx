import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import { Row, Col } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { useContext } from "react";
import LoginContext from "../context/loginContext";
import { Link } from "react-router-dom";

function MyNavbar(props) {
  const { user, setUser } = useContext(LoginContext);
  return (
    <Navbar bg="secondary">
      <Container>
        <Row className="w-100 justify-content-between align-items-center">
          <Col xs={4} className="text-center">
            <Navbar.Brand href="#home">
              {props.appName || "Ticketing"}
            </Navbar.Brand>
          </Col>
          <Col xs={4} className="text-center">
            {user ? (
              <Button variant="danger" onClick={props.logout}>Logout</Button>
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

export default MyNavbar;
