import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import API from "../API";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import Modal from "react-bootstrap/Modal";

function CreateTicket(props) {
  const [title, setTitle] = useState(props.title || "");
  const [category, setCategory] = useState(props.category || "inquiry");
  const [text, setText] = useState(props.text || "");
  const [disabled, setDisabled] = useState(false);
  const [textButton, setTextButton] = useState("Create ticket");

  const navigate = useNavigate();

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (title === "" || category === "" || text === "") {
      props.setErrorMessage("Please fill in all fields");
      return;
    }
    if (!disabled) {
      setDisabled(true);
      setTextButton("Confirm");
    } else {
      API.createTicket({ title, category, text }).then((ticket) => {
        if (ticket) {
          props.setErrorMessage("");
          props.setDirty(true);
          navigate("/");
        } else {
          props.setErrorMessage("Failed to create the ticket");
        }
      });
    }
  };

  const handleEdit = () => {
    setDisabled(false);
    setTextButton("Create ticket");
    return <createTicket category={category} title={title} text={text} />;
  };

  return (
    <>
      <center>
        {props.errorMessage && (
          <h1 className="text-danger">{props.errorMessage}</h1>
        )}
        <Form onSubmit={handleSubmitTicket}>
          <fieldset disabled={disabled}>
            <Form.Group controlId="title">
              <Form.Label>Title:</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={handleTitleChange}
              />
            </Form.Group>

            <Form.Group controlId="category">
              <Form.Label>Category:</Form.Label>
              <Form.Control
                as="select"
                value={category}
                onChange={handleCategoryChange}
              >
                <option value="inquiry">Inquiry</option>
                <option value="maintenance">Maintenance</option>
                <option value="new feature">New feature</option>
                <option value="administrative">Administrative</option>
                <option value="payment">Payment</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="text">
              <Form.Label>Text:</Form.Label>
              <Form.Control
                as="textarea"
                value={text}
                onChange={handleTextChange}
              />
            </Form.Group>
            <p></p>
          </fieldset>
          <center>
            {disabled && (
              <Button variant="primary" onClick={handleEdit}>
                Edit
              </Button>
            )}
            <p></p>
            <Button variant="primary" type="submit">
              {textButton}
            </Button>
          </center>
        </Form>
      </center>
    </>
  );
}

function AddBlock(props) {
  const [text, setText] = useState("");
  const navigate = useNavigate();

  const ticketId = useParams().id;

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const [show, setShow] = useState(props.show);

  const handleClose = () => {
    setShow(false)
    navigate("/");
  }; 
  const handleSubmit = (e) => {
    e.preventDefault();
    if (text === "") {
      props.setErrorMessage("Please fill in all fields");
      return;
    }
    API.createBlock({ text, ticketId }).then((block) => {
      if (block) {
        props.setErrorMessage("");
        props.setDirty(true);
        navigate("/");
      } else {
        props.setErrorMessage("Failed to add response");
      }
    });
  };

  return (
    <>
      <center>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>
            {props.errorMessage && <h1 className="text-danger">{props.errorMessage}</h1>}
              Add to ticket #{ticketId}
              </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="text">
                <Form.Label>Response:</Form.Label>
                <Form.Control
                  as="textarea"
                  value={text}
                  onChange={handleTextChange}
                />
              </Form.Group>
              <p></p>
              </Form>
          </Modal.Body>
          <Modal.Footer>
          <Button variant="primary" onClick={handleSubmit} >
                Create response
              </Button>
              <Button variant="secondary" onClick={handleClose} >
                Close
              </Button>
          </Modal.Footer>
        </Modal>
      </center>
    </>
  );
}

function EditBlockModal(props) {
  const { ticket } = props;
  const { action } = props;
  const [category, setCategory] = useState(ticket.category);
  const [checked, setChecked] = useState(true);
  const [error, setError] = useState("");

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };
  const handleChange = () => {
    setChecked(!checked);
  };

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleSubmit = () => {
    let state = "closed";
    checked ? (state = "closed") : (state = "open");
    const id = ticket.id;
    API.patchTicket({ id, category, state }).then((result) => {
      if (result) {
        setError("");
        props.setDirty(true);
        handleClose();
      } else {
        setError("Error in patching ticket");
      }
    });
  };

  return (
    <>
      <Button variant="warning" onClick={handleShow}>
        {action}
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {error && <h1 className="text-danger">{error}</h1>}
            Edit ticket #{ticket.id}
          </Modal.Title>
        </Modal.Header>
        {action === "Close ticket" && (
          <Modal.Body>Click Save Changes to close ticket</Modal.Body>
        )}
        {action === "Edit ticket" && (
          <Modal.Body>
            <Form>
              <Form.Group controlId="category">
                <Form.Label>Category:</Form.Label>
                <Form.Control
                  as="select"
                  value={category}
                  onChange={handleCategoryChange}
                >
                  <option value={category}>{category}</option>
                  <option value="inquiry">Inquiry</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="new feature">New feature</option>
                  <option value="administrative">Administrative</option>
                  <option value="payment">Payment</option>
                </Form.Control>
              </Form.Group>
              <p></p>
              <Form.Check
                type="checkbox"
                id="custom-checkbox"
                label="closed"
                checked={checked}
                onChange={handleChange}
              />
            </Form>
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Back
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

const MANAGER = { CreateTicket, AddBlock, EditBlockModal };
export default MANAGER;
