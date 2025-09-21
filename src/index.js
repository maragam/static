import React from "react";
import ReactDOM from "react-dom/client";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser"; // ✅ correct import
import App from "./App";

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: "<frontend-client-id>", // replace with your frontend app registration ID
    authority: "https://login.microsoftonline.com/<tenant-id>", // replace with your tenant ID
    redirectUri: "http://localhost:3000", // or your deployed app URL
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <MsalProvider instance={msalInstance}>
    <App />
  </MsalProvider>
);
