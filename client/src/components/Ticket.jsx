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

const { AddResponse, EditCategory, ButtonCloseTicket, ButtonReopenTicket } =
  MANAGER;

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
            setUpdateBlocks={props.setUpdateBlocks}
          />
        ))}
      </Accordion>
    </>
  );
}

//Component that contains the ticket and calls the Block component
function Ticket(props) {
  const { user } = useContext(LoginContext);
  const { blocks, setDirty, ticket, setUpdateBlocks, estimations } = props;

  const ticketOpen = ticket.state !== "closed";
  const loggedAdmin = user && user.role === "admin";
  const loggedTicketOwner =
    user &&
    user.role !== "admin" &&
    ticket.state !== "closed" &&
    user.id === ticket.owner;

  return (
    <>
      <Accordion.Item eventKey={ticket.id}>
        <Accordion.Header>
          <Container>
            <Row className="mb-3">
              <Col
                xs={12}
                className="d-flex justify-content-center"
                style={{
                  // backgroundColor: "#E5E7E6",
                  borderRadius: "10px",
                  padding: "10px",
                }}
              >
                <h5>{"Title: " + ticket.title}</h5>
              </Col>
            </Row>

            <Row className="justify-content-between">
              <Col xs={12} md={1} className="d-flex justify-content-center">
                {ticket.state === "open" ? (
                  <Badge
                    bg="success"
                    style={{
                      width: "120px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "40px", // Set a height for the badge
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
                      height: "40px", // Set a height for the badge
                    }}
                  >
                    Closed
                  </Badge>
                )}
              </Col>
              <Col xs={12} md={2} className="d-flex justify-content-center">
                {"Author: " + ticket.owner_username}
              </Col>
              <Col xs={12} md={2} className="d-flex justify-content-center">
                <Badge
                  bg="info"
                  style={{
                    width: "120px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "40px", // Set a height for the badge
                  }}
                >
                  {ticket.category}
                </Badge>
              </Col>
              <Col xs={12} md={2} className="d-flex justify-content-center">
                {ticket.timestamp}
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
                      height: "40px", // Set a height for the badge
                    }}
                  >
                    {estimations[ticket.id - 1]}
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
              <AddResponse
                id={ticket.id}
                setDirty={props.setDirty}
                setUpdateBlocks={setUpdateBlocks}
              ></AddResponse>
            )}{" "}
            {loggedAdmin && !ticketOpen && (
              <ButtonReopenTicket
                id={ticket.id}
                setDirty={setDirty}
              ></ButtonReopenTicket>
            )}{" "}
            {(loggedTicketOwner || loggedAdmin) && ticketOpen && (
              <ButtonCloseTicket
                id={ticket.id}
                setDirty={setDirty}
              ></ButtonCloseTicket>
            )}{" "}
            {loggedAdmin && (
              <EditCategory
                id={ticket.id}
                setDirty={setDirty}
                category={ticket.category}
              ></EditCategory>
            )}
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
          backgroundColor: "#F1F7EE",
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
