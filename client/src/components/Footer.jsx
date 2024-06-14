import React from "react";
import "../App.css";

function MyFooter(props) {
    return (
      <footer className="footer">
        <p>&copy; {props.appName}</p>
      </footer>
    );
  }

  export default MyFooter;