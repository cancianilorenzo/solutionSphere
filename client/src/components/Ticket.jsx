import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";

import LoginContext from "../context/loginContext";
import { useContext, useState, useEffect } from "react";
import API from "../API";
import { Link } from "react-router-dom";

function TicketRoute(props) {
  const { user, setUser } = useContext(LoginContext);
  return (
    <>
      <center>
        {user && (
          <Link to="/create">
            <Button variant="success" size="lg">
              Add Ticket
            </Button>
          </Link>
        )}
      </center>
      <p></p>
      <Accordion alwaysOpen>
        {props.tickets.map((e, index) => (
          <Ticket key={index} ticket={e} />
        ))}
      </Accordion>
    </>
  );
}

function Block(props) {
  const e = props.block;
  return (
    <Accordion.Body>
      <p>{e.author}</p>
      <p>{e.text}</p>
      <p>{e.timestamp}</p>
      <p>{e.ticket}</p>
    </Accordion.Body>
  );
}

function Ticket(props) {
  const { user, setUser } = useContext(LoginContext);
  const e = props.ticket;
  const [blocks, setBlocks] = useState([]);
  useEffect(() => {
    if (user) {
      API.getBlocks(e.id).then((blocks) => setBlocks(blocks));
    }
  }, []);
  return (
    <>
      <Accordion.Item eventKey={e.id}>
        <Accordion.Header>
          <p>
            {e.title} - {e.owner} - {e.state} - {e.timestamp} - {e.id} -{e.category}
          </p>
        </Accordion.Header>
        {user ? (
          blocks.map((block, index) => <Block key={index} block={block} />)
        ) : (
          <Accordion.Body>
            <p>Please <Link to="/login">log in</Link> to see responses</p>
          </Accordion.Body>
        )}
        {user && (
          <Accordion.Body>
            <Link to={`/add/${e.id}`}>
              <Button variant="secondary" >Add response</Button>
            </Link>
            {" "}
            {user && user.role === "admin" && <Button>Edit</Button>}
          </Accordion.Body>
        )}
      </Accordion.Item>
    </>
  );
}

export default TicketRoute;
