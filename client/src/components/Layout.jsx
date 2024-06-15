import React from "react";
import { Outlet } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import MyNavbar from "./Navbar";
import MyFooter from "./Footer";

function Layout(props) {
  return (
    <>
      <Container>
        <Row className="justify-content-md-center">
          <Col md={11}>
            <MyNavbar appName="SolutionSphere" logout={props.logout} />
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

export default Layout;
