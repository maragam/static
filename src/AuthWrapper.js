import React from "react";
import { useMsal } from "@azure/msal-react";

export default function AuthWrapper({ children }) {
  const { instance, accounts } = useMsal();

  if (accounts.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h2>Please sign in</h2>
        <button
          onClick={() =>
            instance.loginPopup({
              scopes: ["api://<backend-client-id>/user_impersonation"],
            })
          }
        >
          Sign in with Microsoft
        </button>
      </div>
    );
  }

  return children;
}
