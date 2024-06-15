import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import API from "../API";
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';


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
    // const ticket = { title, category, text };
    if (title === "" || category === "" || text === "") {
      props.setErrorMessage("Please fill in all fields");
      return;
    }
    if (!disabled) {
      setDisabled(true);
      setTextButton("Confirm");
      console.log(title, category, text);
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
    return(<createTicket category={category} title={title} text={text} />)
  }

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
          {disabled && <Button variant="primary" onClick={handleEdit}>
              Edit
            </Button>}
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(text);
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
        props.setErrorMessage("Failed to create the block");
      }
    });
  };

  return (
    <>
      <center>
        {props.errorMessage && (
          <h1 className="text-danger">{props.errorMessage}</h1>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="text">
            <Form.Label>Text:</Form.Label>
            <Form.Control
              as="textarea"
              value={text}
              onChange={handleTextChange}
            />
          </Form.Group>
          <p></p>
          <center>
            <Button variant="primary" type="submit">
              Create Block
            </Button>
          </center>
        </Form>
      </center>
    </>
  );
}

const exportsObject = { CreateTicket, AddBlock };
export default exportsObject;
