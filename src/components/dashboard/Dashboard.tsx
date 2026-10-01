"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { DashboardReport } from "@/server/reporting";
import "./dashboard.css";

const activityLabel = (value: string | null) => value === "WORDLE" ? "Wordle" : value === "WORD_SEARCH" ? "Word Search" : "Invalid type";
const stamp = (value: Date | string) => new Date(value).toLocaleString("en-AU", { timeZone: "Australia/Melbourne", dateStyle: "short", timeStyle: "short" });

export default function Dashboard() {
  const [days, setDays] = useState("7");
  const [source, setSource] = useState("LIVE");
  const [report, setReport] = useState<DashboardReport | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [health, setHealth] = useState("Checking");
  const [refreshing, setRefreshing] = useState(false);
  const query = `days=${days}&source=${source}`;

  const refresh = useCallback(async (signal?: AbortSignal) => {
    if (!signal) setRefreshing(true);
    const results = await Promise.allSettled([
      fetch(`/api/reports?${query}`, { cache: "no-store", signal }).then(async response => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message || "Reporting unavailable.");
        return body.data as DashboardReport;
      }),
      fetch("/health", { cache: "no-store", signal }).then(response => { if (!response.ok) throw new Error("Health check failed"); return response.json(); }),
    ]);
    if (signal?.aborted) return;
    if (results[0].status === "fulfilled") { setReport(results[0].value); setError(""); }
    else { setReport(null); setError("Reporting is unavailable. Check the database connection and refresh."); }
    setHealth(results[1].status === "fulfilled" && results[1].value.status === "ok" ? "Healthy" : "Unavailable");
    setRefreshing(false);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => { if (!controller.signal.aborted) void refresh(controller.signal); });
    const timer = setInterval(() => void refresh(controller.signal), 30000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [refresh]);

  async function exportReport() {
    setStatus("");
    try {
      const response = await fetch(`/api/reports/export?${query}`);
      if (!response.ok) { const body = await response.json(); throw new Error(body.error?.message || "Export failed."); }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = "generation-report.csv"; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus("Generation report downloaded.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Export failed."); }
  }

  const data = report?.filters.days === days && report?.filters.source === source ? report : null;
  const emptyLists = data?.inventory.lists.filter(list => !list._count.words) ?? [];
  const maximum = Math.max(1, ...(data?.byType.map(row => row.generated) ?? []));
  return <div className="dashboard">
    <div className="report-toolbar">
      <div className="form-field"><label htmlFor="report-period">Reporting period</label><select id="report-period" value={days} onChange={event => setDays(event.target.value)}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="all">All time</option></select></div>
      <div className="form-field"><label htmlFor="report-source">Traffic source</label><select id="report-source" value={source} onChange={event => setSource(event.target.value)}><option value="LIVE">Live activity</option><option value="SIMULATED">Simulated examples</option><option value="LOAD_TEST">Load tests</option><option value="ALL">All sources</option></select></div>
      <button className="button button--secondary" disabled={refreshing} onClick={() => void refresh()}>{refreshing ? "Refreshing..." : "Refresh"}</button>
      <button className="button button--primary" disabled={!data} onClick={() => void exportReport()}>Export CSV</button>
    </div>
    <div className="report-meta"><p><strong>System: {health}</strong> · <a href="/health" target="_blank" rel="noreferrer">View health check</a></p><p>{data ? `Updated ${stamp(data.generatedAt)} (Melbourne)` : "Waiting for reporting data"} · Refreshes every 30 seconds</p></div>
    <p className="form-help">Usage figures follow the selected period and source. Stored content counts show the current database. Simulated examples are synthetic records, not real learner activity.</p>
    <p role="status">{status}</p>
    {error ? <p role="alert" className="form-error">{error}</p> : null}
    {health === "Unavailable" ? <p role="alert" className="form-error">Health check failed. The application or database may be unavailable.</p> : null}
    {!data && !error ? <p role="status">Loading reporting data...</p> : null}
    {data ? <>
      <section aria-labelledby="usage-heading"><h2 id="usage-heading">Operational overview</h2><dl className="metric-grid">
        {[["Successful generations", data.totals.success], ["Failed generations", data.totals.failed], ["Success rate", data.totals.successRate === null ? "No attempts" : `${data.totals.successRate}%`], ["Average time on page", data.totals.averageTimeSeconds === null ? "No visits" : `${data.totals.averageTimeSeconds} s`], ["Recorded page visits", data.totals.visitCount], ["Most-used activity", data.totals.mostUsed]].map(([label, value]) => <div className="metric" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl><p className="form-help">Most-used type is based on successful exports. Time is average visible-tab duration per anonymous builder-site visit, capped at 30 minutes. Heartbeats run every 15 seconds and on navigation or tab hiding. Closed browsers or network loss can undercount time. Offline learner activity is not tracked.</p></section>

      <section className="report-panel" aria-labelledby="alerts-heading"><h2 id="alerts-heading">Alerts and data quality</h2>
        {data.totals.failed ? <p className="report-warning">{data.totals.failed} generation attempt(s) failed in this selection. Review the event log for the cause.</p> : <p>No failed generations in this selection.</p>}
        {data.totals.attempts >= 5 && (data.totals.successRate ?? 100) < 90 ? <p className="report-warning">Success rate is below the 90% monitoring threshold. Investigate invalid inputs and placement errors.</p> : null}
        {emptyLists.length ? <p className="report-warning">Empty word lists: {emptyLists.map(list => list.name).join(", ")}. <Link href="/library">Add words in the Teacher Library</Link>.</p> : <p>All stored lists contain words.</p>}
        {!data.totals.attempts ? <p>No generation attempts yet. <Link href="/wordle">Create a Wordle output</Link> or select simulated examples.</p> : null}
      </section>

      <div className="report-columns">
        <section className="report-panel" aria-labelledby="types-heading"><h2 id="types-heading">Activity creation</h2><p>{data.inventory.configurationCount} saved configurations in the current database.</p>
          {data.byType.map(row => <div className="usage-bar" key={row.type}><p><strong>{activityLabel(row.type)}</strong><span>{row.generated} generated · {row.saved} saved · {row.failed} failed</span></p><div className="usage-bar__track" aria-hidden="true"><div style={{ width: `${100 * row.generated / maximum}%` }} /></div></div>)}
          <p className="form-help">Generated outputs are retained snapshots. Saving a configuration or regenerating a preview does not create an output.</p>
        </section>
        <section className="report-panel" aria-labelledby="lists-heading"><h2 id="lists-heading">Stored word lists</h2><p>{data.inventory.lists.length} lists · {data.inventory.wordCount} words</p><div className="report-scroll" tabIndex={0} role="region" aria-label="Stored word lists table"><table><caption>Current stored content</caption><thead><tr><th scope="col">List</th><th scope="col">Words</th><th scope="col">Saved</th></tr></thead><tbody>{data.inventory.lists.map(list => <tr key={list.id}><th scope="row">{list.name}</th><td>{list._count.words}</td><td>{list._count.activityConfigurations}</td></tr>)}</tbody></table></div></section>
      </div>

      <div className="report-columns"><section className="report-panel" aria-labelledby="daily-heading"><h2 id="daily-heading">Daily generation trend</h2><p>UTC calendar days, latest 31 active days within the selection.</p><div className="report-scroll" tabIndex={0} role="region" aria-label="Daily generation table"><table><caption>Successful and failed generations by day</caption><thead><tr><th scope="col">Day (UTC)</th><th scope="col">Success</th><th scope="col">Failed</th></tr></thead><tbody>{Array.from(new Set(data.daily.map(row => row.day))).slice(0,31).map(day => <tr key={day}><th scope="row">{day}</th><td>{data.daily.find(row => row.day === day && row.status === "SUCCESS")?.count ?? 0}</td><td>{data.daily.find(row => row.day === day && row.status === "FAILED")?.count ?? 0}</td></tr>)}</tbody></table></div>{!data.daily.length ? <p>No events in this selection.</p> : null}</section>
      <section className="report-panel" aria-labelledby="pages-heading"><h2 id="pages-heading">Time on page</h2><div className="report-scroll" tabIndex={0} role="region" aria-label="Page time table"><table><caption>Visible time per recorded visit</caption><thead><tr><th scope="col">Page</th><th scope="col">Visits</th><th scope="col">Average (s)</th></tr></thead><tbody>{data.pages.map(row => <tr key={row.path}><th scope="row">{row.path}</th><td>{row.visits}</td><td>{row.averageSeconds}</td></tr>)}</tbody></table></div>{!data.pages.length ? <p>No recorded visits in this selection.</p> : null}</section></div>

      <section className="report-panel" aria-labelledby="events-heading"><h2 id="events-heading">Generation event log</h2><p>Latest 50 attempts. Export CSV for the complete selection, up to 10,000 records. Durations cover validation and generation before the event is saved, not browser download time.</p><div className="report-scroll" tabIndex={0} role="region" aria-label="Generation event log table"><table><caption>Persisted outcomes and generated outputs</caption><thead><tr><th scope="col">Time (Melbourne)</th><th scope="col">Activity</th><th scope="col">Outcome</th><th scope="col">Source</th><th scope="col">Time (ms)</th><th scope="col">Output or cause</th></tr></thead><tbody>{data.recent.map(row => <tr key={row.id}><td>{stamp(row.createdAt)}</td><td>{activityLabel(row.activityType)}</td><td><span className={`outcome outcome--${row.status.toLowerCase()}`}>{row.status === "SUCCESS" ? "Success" : "Failed"}</span></td><td>{row.source.replace("_", " ")}</td><td>{row.durationMs}</td><td>{row.status === "SUCCESS" && row.source !== "SIMULATED" ? <a href={`/activities/${row.id}`} target="_blank" rel="noreferrer">Open {row.filename} (new tab)</a> : row.status === "FAILED" ? `${row.errorCode}: ${row.message}` : "Synthetic example, no output file"}</td></tr>)}</tbody></table></div>{!data.recent.length ? <p>No generation records in this selection.</p> : null}</section>
    </> : null}
  </div>;
}
