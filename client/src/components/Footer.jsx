import React from "react";
import "../App.css";

function MyFooter(props) {
  return (
    <center>
      <footer className="footer">
        <p>&copy; {props.appName}</p>
      </footer>
    </center>
  );
}

export default MyFooter;
