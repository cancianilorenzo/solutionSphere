import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import API from "../API";
import { useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";

function CreateTicket(props) {
  const [title, setTitle] = useState(props.title || "");
  const [category, setCategory] = useState(props.category || "inquiry");
  const [text, setText] = useState(props.text || "");
  const [disabled, setDisabled] = useState(false);
  const [textButton, setTextButton] = useState("Create ticket");
  const error = props.errorMessage;
  const jwt = props.jwt;
  const setJwt = props.setJwt;
  const [estimation, setEstimation] = useState(undefined);

  const restore = () => {
    props.setErrorMessage("");
    props.setDirty(true);
  };

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
      API.getEstimation(jwt, [{ title, category }])
        .then((estimations) => {
          const result = estimations.map((obj) => obj.estimation);
          setEstimation(result);
        })
        .catch((err) => {
          API.getAuthToken().then((resp) => {
            setJwt(resp.token);
            API.getEstimation(resp.token, [{ title, category }])
              .then((estimations) => {
                const result = estimations.map((obj) => obj.estimation);
                setEstimation(result);
              })
              .catch((err) => console.error(err));
          });
        });
    } else {
      API.createTicket({ title, category, text }).then((ticket) => {
        if (ticket) {
          restore();
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
        {error && <h1 className="text-danger">{props.errorMessage}</h1>}
        <Form onSubmit={handleSubmitTicket}>
          <fieldset disabled={disabled}>
            {disabled && <h1>Estimation: {estimation}</h1>}
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

function EditModal(props) {
  const { ticket } = props;
  const { block } = props;
  const id = block ? block : ticket.id;
  const { action } = props;
  const [category, setCategory] = useState(ticket ? ticket.category : "");
  const [checked, setChecked] = useState(true);
  const [error, setError] = useState("");
  const [text, setText] = useState("");

  const restore = () => {
    props.setDirty(true);
    setText("");
    setError("");
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };
  const handleChange = () => {
    setChecked(!checked);
  };
  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const [show, setShow] = useState(false);

  const handleClose = () => {
    restore();
    setShow(false);
  };
  const handleShow = () => setShow(true);

  const handleSubmit = () => {
    if (ticket) {
      let state = "closed";
      checked ? (state = "closed") : (state = "open");
      const id = ticket.id;
      API.patchTicket({ id, category, state }).then((result) => {
        if (result) {
          handleClose();
        } else {
          setError("Error in patching ticket");
        }
      });
    }
    if (block) {
      if (text === "") {
        props.setErrorMessage("Please fill in all fields");
        return;
      }
      API.createBlock({ text, id }).then((block) => {
        if (block) {
          setError("");
          props.setDirty(true);
          handleClose();
        } else {
          setError("Error in patching ticket");
        }
      });
    }
  };

  return (
    <>
      <Button variant={props.color || "warning"} onClick={handleShow}>
        {action}
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {error && <h1 className="text-danger">{error}</h1>}
            {ticket && "Edit ticket"}
            {block && "Add response"}
          </Modal.Title>
        </Modal.Header>
        {action === "Close ticket" && (
          <Modal.Body>Click Save Changes to close ticket</Modal.Body>
        )}
        {block && (
          <Modal.Body>Click Add Response to sumbit response</Modal.Body>
        )}

        <Modal.Body>
          {action === "Edit ticket" && (
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
          )}
          {block && (
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
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Back
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {ticket && `Save Changes`}
            {block && `Add Response`}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

const MANAGER = { CreateTicket, EditModal };
export default MANAGER;
