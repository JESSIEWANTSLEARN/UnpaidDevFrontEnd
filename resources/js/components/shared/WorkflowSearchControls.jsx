import "../../../css/shared/workflow-search.css";

export default function WorkflowSearchControls({ search, onSearch, status, onStatus, statuses }) {
  return (
    <div className="wbo-workflow-search" role="search" aria-label="Search loaded records">
      <label>Search records
        <input type="search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="ID, name, subject, product..." />
      </label>
      <label>Status
        <select aria-label="Status" value={status} onChange={(event) => onStatus(event.target.value)}>
          <option value="all">All statuses</option>
          {statuses.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
        </select>
      </label>
      <button type="button" onClick={() => { onSearch(""); onStatus("all"); }}>Reset filters</button>
    </div>
  );
}
