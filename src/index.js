import React from "react";
import ReactDOM from "react-dom/client";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser"; // ✅ correct import
import App from "./App";

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: "c26d9097-fcc7-4ed1-b90d-52397cf29862", // replace with your frontend app registration ID
    authority: "https://login.microsoftonline.com/17a865da-0315-41af-bacb-97e4174a440b", // replace with your tenant ID
    redirectUri: "http://localhost:3000", // or your deployed app URL
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <MsalProvider instance={msalInstance}>
    <App />
  </MsalProvider>
);
