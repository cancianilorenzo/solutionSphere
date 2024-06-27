import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import LoginContext from "../context/loginContext";
import { useContext } from "react";
import { Link } from "react-router-dom";
import MANAGER from "./Manager";
import Badge from "react-bootstrap/Badge";
import { Container, Row, Col } from "react-bootstrap";
import DOMPurify from "dompurify";
import API from "../API";

const { AddResponse, EditCategory} = MANAGER;

function TicketRoute(props) {
  const blocks = props.blocks;
  const { user } = useContext(LoginContext);

  return (
    <>
      <center>
        {user && (
          <Link to="/create">
            <Button variant="success" size="lg">
              Add Ticket{" "}
            </Button>
          </Link>
        )}
      </center>
      <p></p>
      <Accordion alwaysOpen>
        {props.tickets.map((e, index) => (
          <Ticket
            estimations={props.estimations}
            key={index}
            ticket={e}
            blocks={blocks}
            setDirty={props.setDirty}
          />
        ))}
      </Accordion>
    </>
  );
}

//Component that contains the ticket and calls the Block component
function Ticket(props) {
  const { user } = useContext(LoginContext);
  const { blocks, setDirty, ticket } = props;
  const estimations = props.estimations;


  const ticketOpen = ticket.state !== "closed";
  const loggedAdmin = user && user.role === "admin";
  const loggedTicketOwner =
    user &&
    user.role !== "admin" &&
    ticket.state !== "closed" &&
    user.id === ticket.owner;

  function handleCloseTicket() {
    API.patchTicket({ id: ticket.id, state: "closed" }).then((result) => {
      if (result) {
        setDirty(true);
      }
    });
  }

  function handleOpenTicket() {
    API.patchTicket({ id: ticket.id, state: "open" }).then((result) => {
      if (result) {
        setDirty(true);
      }
    });
  }

  return (
    <>
      <Accordion.Item eventKey={ticket.id}>
        <Accordion.Header>
          <Container>
            <Row className="justify-content-between">
              <Col xs={12} md={2} className="d-flex justify-content-center">
                {ticket.title}
              </Col>
              <Col xs={12} md={2} className="d-flex justify-content-center">
                <Badge
                  bg="info"
                  style={{
                    width: "120px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "40px", // Imposta un'altezza per il badge
                  }}
                >
                  {ticket.category}
                </Badge>
              </Col>
              <Col xs={12} md={2} className="d-flex justify-content-center">
                {ticket.owner_username}
              </Col>
              <Col xs={12} md={2} className="d-flex justify-content-center">
                {ticket.timestamp}
              </Col>
              <Col xs={12} md={1} className="d-flex justify-content-center">
                {ticket.state === "open" ? (
                  <Badge
                    bg="success"
                    style={{
                      width: "120px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "40px", // Imposta un'altezza per il badge
                    }}
                  >
                    Open
                  </Badge>
                ) : (
                  <Badge
                    bg="danger"
                    style={{
                      width: "120px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "40px", // Imposta un'altezza per il badge
                    }}
                  >
                    Closed
                  </Badge>
                )}
              </Col>
              <Col xs={12} md={2} className="d-flex justify-content-center">
                {user && user.role === "admin" && (
                  <Badge
                    bg="primary"
                    style={{
                      width: "120px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "40px", // Imposta un'altezza per il badge
                    }}
                  >
                    {estimations[ticket.id - 1] + " hours"}
                  </Badge>
                )}
              </Col>
            </Row>
          </Container>
        </Accordion.Header>
        {user ? (
          blocks
            .filter((block) => block.ticket === ticket.id)
            .map((block, index) => <Block key={index} block={block} />)
        ) : (
          <Accordion.Body>
            <p>
              Please <Link to="/login">log in</Link> to see responses
            </p>
          </Accordion.Body>
        )}
        {user && (
          <Accordion.Body>
            {ticketOpen && (
              <AddResponse id={ticket.id} setDirty={props.setDirty}></AddResponse>
            )}{" "}
            {loggedAdmin && !ticketOpen && (
              <Button variant="warning" onClick={handleOpenTicket}>
                Reopen tickt
              </Button>
            )}{" "}
            {(loggedTicketOwner || loggedAdmin) && (
              <Button variant="danger" onClick={handleCloseTicket}>
                Close ticket
              </Button>
            )}{" "}
            {loggedAdmin && <EditCategory id={ticket.id} setDirty={setDirty} category={ticket.category}></EditCategory>}
          </Accordion.Body>
        )}
      </Accordion.Item>
    </>
  );
}

function Block(props) {
  const { block } = props;
  return (
    <Accordion.Body>
      <Container
        style={{
          border: "1px solid black",
          padding: "10px",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Row>
          <Col xs={12} md={6}>
            Author: {block.author_username}
          </Col>
          <Col xs={12} md={6}>
            Date: {block.timestamp}
          </Col>
        </Row>
        <Row>
          <Col xs={12} style={{ whiteSpace: "pre-line" }}>
            {DOMPurify.sanitize(block.text)}
          </Col>
        </Row>
      </Container>
    </Accordion.Body>
  );
}

export default TicketRoute;
