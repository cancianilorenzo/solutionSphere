import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";

import LoginContext from "../context/loginContext";
import { useContext } from "react";

const listOfBlocks = [
  {
    id: 1,
    ticket: 1,
    author: 1,
    timestamp: "2024-06-14 11:06:08",
    text: "This is block 1",
  },
  {
    id: 4,
    ticket: 1,
    author: 2,
    timestamp: "2024-06-14 11:06:08",
    text: "This is block 2",
  },
  {
    id: 3,
    ticket: 2,
    author: 4,
    timestamp: "2024-06-14 11:06:08",
    text: "This is block 4",
  },
  {
    id: 5,
    ticket: 2,
    author: 3,
    timestamp: "2024-06-14 11:06:08",
    text: "This is block 3",
  },
  {
    id: 2,
    ticket: 3,
    author: 5,
    timestamp: "2024-06-14 11:06:08",
    text: "This is block 5",
  },
];

function TicketWrapper(props) {
  return (
    <>
      {props.listOfTickets.map((e, index) => (
        <Ticket key={index} ticket={e} />
      ))}
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
  return (
    <>
      <Accordion alwaysOpen onClick={() => console.log("Clicked ", e.id)}>
        <Accordion.Item eventKey={e.id}>
          <Accordion.Header>
            <p>
              {e.title} - {e.owner} - {e.state} - {e.timestamp}
            </p>
          </Accordion.Header>
          {user[1] ? (
            listOfBlocks.map(
              (e, index) =>
                e.ticket === props.ticket.id && <Block key={index} block={e} />
            )
          ) : (
            <Accordion.Body>
              <p>Please log in to see responses</p>
            </Accordion.Body>
          )}
          {user[1] && (
            <Accordion.Body>
              <Button variant="secondary">Add response</Button>{" "}
              {user[1] && user[0] === "admin" && <Button>Edit</Button>}
            </Accordion.Body>
          )}
        </Accordion.Item>
      </Accordion>
    </>
  );
}

export default TicketWrapper;
