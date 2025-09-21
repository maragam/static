import React from "react";
import ReactDOM from "react-dom/client";
import { MsalProvider, PublicClientApplication } from "@azure/msal-react";
import App from "./App";

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: "<frontend-client-id>",
    authority: "https://login.microsoftonline.com/<tenant-id>",
    redirectUri: "http://localhost:3000",
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <MsalProvider instance={msalInstance}>
    <App />
  </MsalProvider>
);
