import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./index.css";
import {BrowserRouter as Router} from "react-router-dom";
import App from "./App.tsx";
import {ThemeProvider} from "./providers/theme-provider";
import {Provider} from "react-redux";
import {store} from "./app/store.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Provider store={store}>
        <Router>
          <App />
        </Router>
      </Provider>
    </ThemeProvider>
  </StrictMode>
);
