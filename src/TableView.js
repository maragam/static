import React, { useEffect, useState, useMemo } from "react";
import "./TableView.css";

const EXCLUDED_COLUMNS = new Set(["etag", "partitionkey", "rowkey", "timestamp"]);

function TableView() {
  const [allRows, setAllRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("");

  const pageSize = 100;

  const FUNCTION_URL =
    "https://backendgui-f0befpdtf3aqb3he.westeurope-01.azurewebsites.net/api/list?code=FlBwKjGXoD5CRJEUOkeQ1IsljSVQkgMCH6y10gzNtqhSAzFuwk8dtA==";

  // Load ALL data once
  const loadAllData = async () => {
    setLoading(true);
    let items = [];
    let token = null;

    try {
      do {
        const url = new URL(FUNCTION_URL);
        url.searchParams.set("pageSize", 1000);
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

      // Build union of all columns ONCE
      const colSet = new Set();
      items.forEach((row) => {
        Object.keys(row).forEach((col) => {
          if (!EXCLUDED_COLUMNS.has(col.toLowerCase())) {
            colSet.add(col);
          }
        });
      });
      setColumns(Array.from(colSet));
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filter rows across all columns
  const filteredRows = useMemo(() => {
    if (!filter) return allRows;
    const lower = filter.toLowerCase();
    return allRows.filter((row) =>
      Object.values(row).some(
        (val) =>
          val !== null &&
          val !== undefined &&
          String(val).toLowerCase().includes(lower)
      )
    );
  }, [allRows, filter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredRows.length / pageSize);
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage]);

  return (
    <div className="table-container">
      <h2>Azure Storage Table Viewer</h2>

      {/* 🔎 Global filter */}
      <input
        type="text"
        placeholder="Filter across all columns..."
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
          setCurrentPage(1);
        }}
        className="filter-input"
      />

      {loading ? (
        <p>Loading all data...</p>
      ) : (
        <>
          <DynamicTable rows={pagedRows} columns={columns} filter={filter} />
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

// 🔑 Highlight helper
function highlightMatch(value, filter) {
  if (!filter || value === undefined || value === null) return value ?? "";

  const str = String(value);
  const lowerStr = str.toLowerCase();
  const lowerFilter = filter.toLowerCase();

  const parts = [];
  let start = 0;
  let index;

  while ((index = lowerStr.indexOf(lowerFilter, start)) !== -1) {
    if (index > start) {
      parts.push(str.substring(start, index));
    }
    parts.push(
      <mark key={index}>{str.substring(index, index + filter.length)}</mark>
    );
    start = index + filter.length;
  }

  if (start < str.length) {
    parts.push(str.substring(start));
  }

  return parts;
}

function DynamicTable({ rows, columns, filter }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

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
              {sortConfig.key === col &&
                (sortConfig.direction === "asc" ? " ▲" : " ▼")}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => (
              <td key={col}>
                {highlightMatch(row[col], filter)}
              </td>
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
