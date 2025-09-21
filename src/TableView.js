import React, { useEffect, useState } from "react";
import "./TableView.css"; // <-- add this import for styling

function TableView() {
  const [rows, setRows] = useState([]);
  const [token, setToken] = useState(null);

  const FUNCTION_URL =
    "https://backendgui-f0befpdtf3aqb3he.westeurope-01.azurewebsites.net/api/list?code=FlBwKjGXoD5CRJEUOkeQ1IsljSVQkgMCH6y10gzNtqhSAzFuwk8dtA==";

  // Load data from your Azure Function
  const loadData = async (nextToken = null) => {
    const url = new URL(FUNCTION_URL);
    url.searchParams.set("pageSize", 20);
    if (nextToken) url.searchParams.set("token", nextToken);

    const res = await fetch(url);
    const data = await res.json();

    setRows((prev) => [...prev, ...data.items]);
    setToken(data.continuationToken);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="table-container">
      <h2>Azure Storage Table Viewer</h2>
      <DynamicTable rows={rows} />
      {token && (
        <button className="load-btn" onClick={() => loadData(token)}>
          Load More
        </button>
      )}
    </div>
  );
}

function DynamicTable({ rows }) {
  if (!rows.length) return <p>No data yet...</p>;

  // Exclude unwanted system columns (case-insensitive)
  const excluded = new Set(["etag", "partitionkey", "rowkey", "timestamp"]);
  const columns = Object.keys(rows[0]).filter(
    (col) => !excluded.has(col.toLowerCase())
  );

  return (
    <table className="modern-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col}>
              {col.replace(/([a-z])([A-Z])/g, "$1 $2")} {/* Prettify headers */}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => (
              <td key={col}>{row[col]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TableView;