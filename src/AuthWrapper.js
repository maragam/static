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
              scopes: ["api://db7fefa9-2bf3-4a95-b5a6-769d00f18f99/user_impersonation"],
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
