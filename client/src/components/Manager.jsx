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
  const { error, jwt, setJwt } = props;
  const [estimation, setEstimation] = useState(undefined);

  const restore = () => {
    props.setErrorMessage("");
    props.setDirty(true);
  };

  const navigate = useNavigate();

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

  const handleBack = () => {
      navigate("/");
  }

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
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
              />
            </Form.Group>

            <Form.Group controlId="category">
              <Form.Label>Category:</Form.Label>
              <Form.Control
                as="select"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                }}
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
                onChange={(e) => {
                  setText(e.target.value);
                }}
              />
            </Form.Group>
            <p></p>
          </fieldset>
          <center>
            {disabled && (
              <Button variant="warning" onClick={handleEdit}>
                Edit
              </Button>
            )}
            <p></p>
            <Button variant="danger" onClick={handleBack}>
              Back
            </Button>{" "}
            <Button variant="success" type="submit">
              {textButton}
            </Button>
          </center>
        </Form>
      </center>
    </>
  );
}

function AddResponse(props) {
  const [show, setShow] = useState(false);
  const [text, setText] = useState("");
  const { id } = props;
  const [error, setError] = useState("");

  const handleClose = () => {
    setShow(false);
    setError("");
  };
  const handleShow = () => setShow(true);

  function handleAddResponse() {
    API.createBlock({ text, id }).then((block) => {
      if (block) {
        props.setDirty(true);
        handleClose();
      } else {
        setError("Error in patching ticket");
      }
    });
  }

  return (
    <>
      <Button variant="success" onClick={handleShow}>
        Add response
      </Button>

      <Modal show={show} onHide={handleClose}>
        {error && <h1 className="text-danger">{error}</h1>}
        <Modal.Header closeButton>
          <Modal.Title>New response</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Insert below your response</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                autoFocus
                onChange={(e) => {
                  setText(e.target.value);
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Close
          </Button>
          <Button variant="success" onClick={handleAddResponse}>
            Add response
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

function EditCategory(props) {
  const [show, setShow] = useState(false);
  const [category, setCategory] = useState(props.category);
  const { id, setDirty } = props;
  const [error, setError] = useState("");

  const handleClose = () => {
    setShow(false);
    setError("");
  };
  const handleShow = () => setShow(true);

  function handleEditCategory() {
    API.patchTicket({ id, category }).then((ticket) => {
      if (ticket) {
        setDirty(true);
        handleClose();
      } else {
        setError("Error in patching ticket");
      }
    });
  }

  return (
    <>
      <Button variant="warning" onClick={handleShow}>
        Edit category
      </Button>

      <Modal show={show} onHide={handleClose}>
        {error && <h1 className="text-danger">{error}</h1>}
        <Modal.Header closeButton>
          <Modal.Title>Edit category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Insert below the new category</Form.Label>
              <Form.Control
                as="select"
                onChange={(e) => {
                  setCategory(e.target.value);
                }}
              >
                <option>
                  {props.category.charAt(0).toUpperCase() +
                    props.category.slice(1)}
                </option>
                <option value="inquiry">Inquiry</option>
                <option value="maintenance">Maintenance</option>
                <option value="new feature">New feature</option>
                <option value="administrative">Administrative</option>
                <option value="payment">Payment</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Close
          </Button>
          <Button variant="success" onClick={handleEditCategory}>
            Edit category
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

const MANAGER = { CreateTicket, AddResponse, EditCategory };
export default MANAGER;
