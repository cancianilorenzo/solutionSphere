import React, { useState } from "react";
import API from "../API";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";

function LoginForm(props) {
  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleUsernameChange = (e) => {
    setusername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    API.login(username, password).then((user) => {
      if (user) {
        props.setErrorMessage("");
        props.loginSuccessful(user);
        console.log("Logged in as", user);
        navigate("/");
      } else {
        props.setErrorMessage("Failed to log in");
        console.log("Failed to log in");
      }
    });
  };

  return (
    <div>
      <center>
        <h1 className="text-danger">{props.errorMessage}</h1>
        <h2>Login</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formBasicUsername">
            <Form.Label>Username:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={handleUsernameChange}
            />
          </Form.Group>
          <p></p>
          <Form.Group controlId="formBasicPassword">
            <Form.Label>Password:</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
            />
          </Form.Group>
          <p></p>
          <Button variant="primary" type="submit">
            Login
          </Button>
          
        </Form>
      </center>
    </div>
  );
}

export default LoginForm;
