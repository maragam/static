import React, { useEffect, useState, useMemo } from "react";
import "./TableView.css";

function TableView() {
  const [rows, setRows] = useState([]);
  const [token, setToken] = useState(null);

  const FUNCTION_URL =
    "https://backendgui-f0befpdtf3aqb3he.westeurope-01.azurewebsites.net/api/list?code=FlBwKjGXoD5CRJEUOkeQ1IsljSVQkgMCH6y10gzNtqhSAzFuwk8dtA==";

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

  // Exclude unwanted system columns
  const excluded = new Set(["etag", "partitionkey", "rowkey", "timestamp"]);
  const columns = rows.length
    ? Object.keys(rows[0]).filter((col) => !excluded.has(col.toLowerCase()))
    : [];

  // Always call useMemo, even if rows is empty
  const sortedRows = useMemo(() => {
    if (!rows.length) return [];
    if (!sortConfig.key) return rows;

    return [...rows].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (!isNaN(aVal) && !isNaN(bVal)) {
        return sortConfig.direction === "asc"
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      }

      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [rows, sortConfig]);

  const handleSort = (col) => {
    setSortConfig((prev) => {
      if (prev.key === col) {
        return { key: col, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key: col, direction: "asc" };
    });
  };

  if (!rows.length) return <p>No data yet...</p>;

  return (
    <table className="modern-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col}
              onClick={() => handleSort(col)}
              style={{ cursor: "pointer" }}
            >
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
