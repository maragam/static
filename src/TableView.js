import React, { useEffect, useState, useMemo } from "react";
import "./TableView.css";

function TableView() {
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 100; // show 100 per page

  const FUNCTION_URL =
    "https://backendgui-f0befpdtf3aqb3he.westeurope-01.azurewebsites.net/api/list?code=FlBwKjGXoD5CRJEUOkeQ1IsljSVQkgMCH6y10gzNtqhSAzFuwk8dtA==";

  // Load ALL data by following continuation tokens
  const loadAllData = async () => {
    setLoading(true);
    let items = [];
    let token = null;

    do {
      const url = new URL(FUNCTION_URL);
      url.searchParams.set("pageSize", 1000); // fetch in big chunks
      if (token) url.searchParams.set("token", token);

      const res = await fetch(url);
      if (!res.ok) {
        console.error("API error", res.status, await res.text());
        break;
      }
      const data = await res.json();
      items = [...items, ...data.items];
      token = data.continuationToken;
    } while (token);

    setAllRows(items);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(allRows.length / pageSize);
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allRows.slice(start, start + pageSize);
  }, [allRows, currentPage]);

  return (
    <div className="table-container">
      <h2>Azure Storage Table Viewer</h2>
      {loading ? (
        <p>Loading all data...</p>
      ) : (
        <>
          <DynamicTable rows={pagedRows} allRows={allRows} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}

function DynamicTable({ rows, allRows }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Exclude unwanted system columns
  const excluded = new Set(["etag", "partitionkey", "rowkey", "timestamp"]);

  // Build union of all keys across ALL rows
  const columns = useMemo(() => {
    const colSet = new Set();
    allRows.forEach((row) => {
      Object.keys(row).forEach((col) => {
        if (!excluded.has(col.toLowerCase())) {
          colSet.add(col);
        }
      });
    });
    return Array.from(colSet);
  }, [allRows]);

  // Sorting logic
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
              <td key={col}>{row[col] ?? ""}</td> {/* empty if missing */}
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(
      <button
        key={i}
        className={`page-btn ${currentPage === i ? "active" : ""}`}
        onClick={() => onPageChange(i)}
      >
        {i}
      </button>
    );
  }

  return <div className="pagination">{pages}</div>;
}

export default TableView;
