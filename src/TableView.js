import React, { useEffect, useState } from "react";

function TableView() {
  const [rows, setRows] = useState([]);
  const [token, setToken] = useState(null);

  // Load data from your Azure Function
  const loadData = async (nextToken = null) => {
    const url = new URL("/api/list", window.location.origin);
    url.searchParams.set("pageSize", 20);
    if (nextToken) url.searchParams.set("token", nextToken);

    const res = await fetch(url);
    const data = await res.json();

    setRows(prev => [...prev, ...data.items]);
    setToken(data.continuationToken);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <DynamicTable rows={rows} />
      {token && <button onClick={() => loadData(token)}>Load More</button>}
    </div>
  );
}

function DynamicTable({ rows }) {
  if (!rows.length) return <p>No data yet...</p>;

  const columns = Object.keys(rows[0]);

  return (
    <table border="1" cellPadding="5">
      <thead>
        <tr>
          {columns.map(col => <th key={col}>{col}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map(col => <td key={col}>{row[col]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TableView;
