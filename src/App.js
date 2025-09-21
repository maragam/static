import React, { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import AuthWrapper from "./AuthWrapper";
import TableView from "./TableView";

function App() {
  const { instance, accounts } = useMsal();
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (accounts.length > 0) {
      instance
        .acquireTokenSilent({
          scopes: ["api://<backend-client-id>/user_impersonation"],
          account: accounts[0],
        })
        .then((res) => setToken(res.accessToken))
        .catch((err) => console.error(err));
    }
  }, [accounts, instance]);

  if (!token) {
    return <AuthWrapper><div>Loading...</div></AuthWrapper>;
  }

  return (
    <AuthWrapper>
      <TableView token={token} />
    </AuthWrapper>
  );
}

export default App;
