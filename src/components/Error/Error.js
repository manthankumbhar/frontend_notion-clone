import React from "react";
import "components/Error/Error.scss";

export default function Error() {
  return (
    <div className="error">
      <h1 className="error__h1">
        404 <br /> Page not found
      </h1>
      <a className="error__a" href="/">
        Go to home
      </a>
    </div>
  );
}
