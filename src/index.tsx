import './index.css';
<<<<<<< HEAD
import React from "react";
import { render } from "react-dom";
import { App } from "./App";

render(<App />, document.getElementById("root"));
=======
import { createRoot } from "react-dom/client";
import { App } from "./App";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(<App />);
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
