import React from "react";
import "../App.css";

function MyFooter(props) {
  return (
    <center>
      <footer>
        <p>&copy; {props.appName}</p>
      </footer>
    </center>
  );
}

export default MyFooter;
