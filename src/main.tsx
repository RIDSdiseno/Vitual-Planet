import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./core/auth/auth.context";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              padding: "12px 0",
              background: "#ffffff",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <img
              src="/VP.png"
              alt="Virtual Planet"
              style={{ height: 40, width: "auto", objectFit: "contain" }}
            />
          </div>

          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
);