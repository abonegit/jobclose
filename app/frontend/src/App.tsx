
import { useState } from "react";
import "./App.css";

const jobs = [
  {
    id: "JC-001",
    customer: "James Wilson",
    description: "Kitchen plumbing repair",
    date: "01 Nov 2026",
    amount: "£350.00",
    status: "In Progress",
  },
  {
    id: "JC-002",
    customer: "Sarah Thompson",
    description: "Bathroom installation",
    date: "31 Oct 2026",
    amount: "£1,250.00",
    status: "Completed",
  },
  {
    id: "JC-003",
    customer: "Michael Brown",
    description: "Boiler service",
    date: "30 Oct 2026",
    amount: "£180.00",
    status: "Awaiting Payment",
  },
  {
    id: "JC-004",
    customer: "Emma Roberts",
    description: "Radiator replacement",
    date: "29 Oct 2026",
    amount: "£420.00",
    status: "Completed",
  },
];

const navigation = [
  { name: "Dashboard", icon: "▦" },
  { name: "Jobs", icon: "▤" },
  { name: "Customers", icon: "♙" },
  { name: "Reports", icon: "▥" },
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">J</div>
          <span>JobClose</span>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav>
          {navigation.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-avatar">JD</div>
          <div>
            <strong>John Davies</strong>
            <span>Tradesperson</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace / </span>
            <strong>{activePage}</strong>
          </div>
          <div className="topbar-right">
            <span className="today">Sunday, 1 November 2026</span>
            <div className="user-avatar">JD</div>
          </div>
        </header>

        <section className="page-content">
          {activePage === "Dashboard" ? (
            <>
              <div className="page-heading">
                <div>
                  <h1>Good morning, John 👋</h1>
                  <p>Here's what's happening with your business today.</p>
                </div>
                <button className="primary-button">
                  + Create new job
                </button>
              </div>

              <div className="stats-grid">
                <StatCard
                  label="Total jobs"
                  value="24"
                  note="All recorded jobs"
                  icon="▤"
                />
                <StatCard
                  label="In progress"
                  value="6"
                  note="Currently active"
                  icon="◷"
                />
                <StatCard
                  label="Completed"
                  value="15"
                  note="Successfully finished"
                  icon="✓"
                />
                <StatCard
                  label="Outstanding"
                  value="£2,450"
                  note="Awaiting payment"
                  icon="£"
                />
              </div>

              <section className="panel jobs-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Recent jobs</h2>
                    <p>Keep track of your latest work.</p>
                  </div>
                  <button className="text-button">View all jobs →</button>
                </div>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>JOB ID</th>
                        <th>CUSTOMER</th>
                        <th>JOB DESCRIPTION</th>
                        <th>DATE</th>
                        <th>AMOUNT</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => (
                        <tr key={job.id}>
                          <td className="job-id">{job.id}</td>
                          <td className="customer-name">{job.customer}</td>
                          <td>{job.description}</td>
                          <td>{job.date}</td>
                          <td className="amount">{job.amount}</td>
                          <td>
                            <span
                              className={`status ${
                                job.status === "Completed"
                                  ? "completed"
                                  : job.status === "In Progress"
                                  ? "progress"
                                  : "awaiting"
                              }`}
                            >
                              {job.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="bottom-grid">
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Invoice overview</h2>
                      <p>Payment tracking summary.</p>
                    </div>
                  </div>
                  <div className="invoice-row">
                    <span>Paid invoices</span>
                    <strong className="paid-text">£4,850</strong>
                  </div>
                  <div className="invoice-row">
                    <span>Outstanding invoices</span>
                    <strong>£2,450</strong>
                  </div>
                  <div className="invoice-row">
                    <span>Overdue invoices</span>
                    <strong className="overdue-text">£650</strong>
                  </div>
                </section>

                <section className="panel activity-panel">
                  <h2>Getting started</h2>
                  <p>
                    Your JobClose workspace is ready. Start by adding
                    customers and recording your jobs.
                  </p>
                  <span className="demo-label">DEMO DATA</span>
                </section>
              </div>
            </>
          ) : (
            <div className="panel placeholder-panel">
              <h1>{activePage}</h1>
              <p>
                The {activePage.toLowerCase()} section is coming soon.
                We'll build this functionality in the next development
                stages.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  note: string;
  icon: string;
};

function StatCard({ label, value, note, icon }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <strong className="stat-value">{value}</strong>
      <span className="stat-note">{note}</span>
    </div>
  );
}

export default App;
