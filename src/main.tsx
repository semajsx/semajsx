import { render } from "@semajsx/web";
import App from "./App";
import "./style.css";

const root = document.getElementById("root");

if (root) {
  render(<App />, root);
}
