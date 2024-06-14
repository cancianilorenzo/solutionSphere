import { useState } from "react";
import { Form, Button } from "react-bootstrap";

function CreateTicket() {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [text, setText] = useState("");

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
    };

    const handleTextChange = (e) => {
        setText(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(title, category, text);
        // Perform ticket creation logic here
        // You can access the values of title, category, and text using the state variables
        // For example, you can send an API request to create a new ticket with the entered values
    };

    return (
        <>
            <Form onSubmit={handleSubmit}>
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
                        <option value="category1">Category 1</option>
                        <option value="category2">Category 2</option>
                        <option value="category3">Category 3</option>
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

                <Button variant="primary" type="submit">
                    Create Ticket
                </Button>
            </Form>
        </>
    );
}

export default CreateTicket;