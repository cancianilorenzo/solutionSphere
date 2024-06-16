import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import LoginContext from "../context/loginContext";
import { useContext} from "react";
import { Link } from "react-router-dom";
import MANAGER from "./Manager";
import Badge from "react-bootstrap/Badge";
import { Container, Row, Col } from "react-bootstrap";

const { EditModal } = MANAGER;

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
  const e = props.ticket;
  const { blocks } = props;

  const ticketOpen = e.state !== "closed";
  const loggedAdmin = user && user.role === "admin";
  const loggedTicketOwner =
    user &&
    user.role !== "admin" &&
    e.state !== "closed" &&
    user.id === e.owner;

  return (
    <>
      <Accordion.Item eventKey={e.id}>
        <Accordion.Header>
          <Container>
            <Row>
              <Col xs={12} md={2}>
                {e.title}
              </Col>
              <Col xs={12} md={2}>
                <Badge bg="info" style={{width: '120px'}}> {e.category} </Badge>
              </Col>
              <Col xs={12} md={2}>
                {e.owner_username}
              </Col>
              <Col xs={12} md={2}>
                {e.timestamp}
              </Col>
              <Col xs={12} md={1}>
                {e.state === "open" ? (
                  <Badge bg="success" style={{width: '90px'}}> Open </Badge>
                ) : (
                  <Badge bg="danger" style={{width: '90px'}}>Closed</Badge>
                )}
              </Col>
            </Row>
          </Container>
        </Accordion.Header>
        {user ? (
          blocks
            .filter((block) => block.ticket === e.id)
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
              // <Link to={`/add/${e.id}`}>
              //   <Button variant="success">Add response</Button>
              // </Link>
              <EditModal
              action={"Add response"}
              block={e.id}
              color={"success"}
              dirty={props.dirty}
              setDirty={props.setDirty}
            ></EditModal>
            )}{" "}
            {loggedAdmin && (
              <EditModal
                action={"Edit ticket"}
                ticket={e}
                dirty={props.dirty}
                setDirty={props.setDirty}
              ></EditModal>
            )}
            {loggedTicketOwner && (
              <EditModal
                action={"Close ticket"}
                ticket={e}
                dirty={props.dirty}
                setDirty={props.setDirty}
              ></EditModal>
            )}
          </Accordion.Body>
        )}
      </Accordion.Item>
    </>
  );
}

function Block(props) {
  const e = props.block;
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
            Author: {e.author_username}
          </Col>
          <Col xs={12} md={6}>
            Date: {e.timestamp}
          </Col>
        </Row>
        <Row>
          <Col xs={12}>{e.text}</Col>
        </Row>
      </Container>
    </Accordion.Body>
  );
}

export default TicketRoute;
