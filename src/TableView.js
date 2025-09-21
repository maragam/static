import React, { useEffect, useState } from "react";
import "./TableView.css"; // keep your modern styling

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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  if (!rows.length) return <p>No data yet...</p>;

  // Exclude unwanted system columns (case-insensitive)
  const excluded = new Set(["etag", "partitionkey", "rowkey", "timestamp"]);
  const columns = Object.keys(rows[0]).filter(
    (col) => !excluded.has(col.toLowerCase())
  );

  // Sorting logic
  const sortedRows = React.useMemo(() => {
    if (!sortConfig.key) return rows;

    return [...rows].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      // Handle undefined/null gracefully
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Numeric sort if both values are numbers
      if (!isNaN(aVal) && !isNaN(bVal)) {
        return sortConfig.direction === "asc"
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      }

      // String sort otherwise
      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [rows, sortConfig]);

  const handleSort = (col) => {
    setSortConfig((prev) => {
      if (prev.key === col) {
        // toggle direction
        return { key: col, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key: col, direction: "asc" };
    });
  };

  return (
    <table className="modern-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col} onClick={() => handleSort(col)} style={{ cursor: "pointer" }}>
              {col.replace(/([a-z])([A-Z])/g, "$1 $2")}
              {sortConfig.key === col && (sortConfig.direction === "asc" ? " ▲" : " ▼")}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((row, i) => (
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
