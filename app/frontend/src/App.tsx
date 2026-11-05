
import { useEffect, useState } from "react";
import "./App.css";

type Job = {
  id: string;
  job_reference: string;
  customer_id: string;
  customer_name: string;
  title: string;
  description: string | null;
  scheduled_date: string | null;
  status: string;
  estimated_cost: string;
  created_at: string;
};

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
};

const navigation = [
  { name: "Dashboard", icon: "▦" },
  { name: "Jobs", icon: "▤" },
  { name: "Customers", icon: "♙" },
  { name: "Reports", icon: "▥" },
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [customerFormError, setCustomerFormError] = useState("");
  const [customerFormSuccess, setCustomerFormSuccess] = useState("");
  const [jobCustomerId, setJobCustomerId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobScheduledDate, setJobScheduledDate] = useState("");
  const [jobEstimatedCost, setJobEstimatedCost] = useState("0");
  const [savingJob, setSavingJob] = useState(false);
  const [jobFormError, setJobFormError] = useState("");
  const [jobFormSuccess, setJobFormSuccess] = useState("");
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);
  const [jobStatusError, setJobStatusError] = useState("");

  // Fetch real jobs from the backend when the dashboard loads.
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs");

        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }

        const data: Job[] = await response.json();
        setJobs(data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Unable to load jobs. Please check the backend server.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data: Customer[] = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setCustomersError(
        "Unable to load customers. Please check the backend server."
      );
    } finally {
      setCustomersLoading(false);
    }
  };

  fetchCustomers();
}, []);
  // Calculate dashboard figures using the real jobs.
  const totalJobs = jobs.length;

  const inProgressJobs = jobs.filter(
    (job) => job.status === "In Progress"
  ).length;

  const completedJobs = jobs.filter(
    (job) => job.status === "Completed"
  ).length;

  const formatCurrency = (amount: string) =>
    Number(amount).toLocaleString("en-GB", {
      style: "currency",
      currency: "GBP",
    });

  const formatDate = (date: string | null) =>
    date
      ? new Date(date).toLocaleDateString("en-GB")
      : "Not scheduled";

async function handleAddCustomer(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setSavingCustomer(true);
  setCustomerFormError("");
  setCustomerFormSuccess("");

  try {
    const response = await fetch("/api/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Could not add customer.");
    }

    const customersResponse = await fetch("/api/customers");

    if (!customersResponse.ok) {
      throw new Error("Customer was added, but the list could not be refreshed.");
    }

    const updatedCustomers: Customer[] = await customersResponse.json();

    setCustomers(updatedCustomers);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerFormSuccess("Customer added successfully.");
  } catch (error) {
    setCustomerFormError(
      error instanceof Error ? error.message : "Something went wrong."
    );
  } finally {
    setSavingCustomer(false);
  }
}

async function handleAddJob(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setSavingJob(true);
  setJobFormError("");
  setJobFormSuccess("");

  try {
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id: jobCustomerId,
        title: jobTitle,
        description: jobDescription,
        scheduled_date: jobScheduledDate || null,
        estimated_cost: Number(jobEstimatedCost),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Could not add job.");
    }

    const jobsResponse = await fetch("/api/jobs");

    if (!jobsResponse.ok) {
      throw new Error("Job was added, but the jobs list could not be refreshed.");
    }

    const updatedJobs: Job[] = await jobsResponse.json();

    setJobs(updatedJobs);
    setJobCustomerId("");
    setJobTitle("");
    setJobDescription("");
    setJobScheduledDate("");
    setJobEstimatedCost("0");

    setJobFormSuccess("Job added successfully.");
  } catch (error) {
    setJobFormError(
      error instanceof Error ? error.message : "Something went wrong."
    );
  } finally {
    setSavingJob(false);
  }
}

async function handleUpdateJobStatus(jobId: string, status: string) {
  setUpdatingJobId(jobId);
  setJobStatusError("");

  try {
    const response = await fetch(`/api/jobs/${jobId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Could not update job status.");
    }

    const jobsResponse = await fetch("/api/jobs");

    if (!jobsResponse.ok) {
      throw new Error("Status updated, but the jobs list could not be refreshed.");
    }

    const updatedJobs: Job[] = await jobsResponse.json();
    setJobs(updatedJobs);
  } catch (error) {
    setJobStatusError(
      error instanceof Error ? error.message : "Something went wrong."
    );
  } finally {
    setUpdatingJobId(null);
  }
}
      
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
          <span className="today">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
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

            {loading && <p>Loading jobs...</p>}

            {error && <p role="alert">{error}</p>}

            {!loading && !error && (
              <>
                <div className="stats-grid">
                  <StatCard
                    label="Total jobs"
                    value={String(totalJobs)}
                    note="All recorded jobs"
                    icon="▤"
                  />

                  <StatCard
                    label="In progress"
                    value={String(inProgressJobs)}
                    note="Currently active"
                    icon="◷"
                  />

                  <StatCard
                    label="Completed"
                    value={String(completedJobs)}
                    note="Successfully finished"
                    icon="✓"
                  />

                  <StatCard
                    label="Outstanding"
                    value="Not tracked"
                    note="Invoice tracking not set up"
                    icon="£"
                  />
                </div>

                <section className="panel jobs-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Recent jobs</h2>
                      <p>Keep track of your latest work.</p>
                    </div>

                    <button
                      className="text-button"
                      onClick={() => setActivePage("Jobs")}
                    >
                      View all jobs →
                    </button>
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
                        {jobs.length > 0 ? (
                          jobs.map((job) => (
                            <tr key={job.id}>
                              <td className="job-id">
                                {job.job_reference}
                              </td>
                              <td>{job.customer_name}</td>
                              <td>{job.title}</td>
                              <td>{formatDate(job.scheduled_date)}</td>
                              <td>{formatCurrency(job.estimated_cost)}</td>
                              <td>
                                <select
                                  value={job.status}
                                  disabled={updatingJobId === job.id}
                                  onChange={(event) =>
                                    handleUpdateJobStatus(job.id, event.target.value)
                                  }
                                  aria-label={`Update status for ${job.job_reference}`}
                                >
                                  <option value="Scheduled">Scheduled</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6}>
                              No jobs recorded yet. Create your first job
                              to get started.
                            </td>
                          </tr>
                        )}
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
                      <strong>Not tracked</strong>
                    </div>

                    <div className="invoice-row">
                      <span>Outstanding invoices</span>
                      <strong>Not tracked</strong>
                    </div>

                    <div className="invoice-row">
                      <span>Overdue invoices</span>
                      <strong>Not tracked</strong>
                    </div>
                  </section>

                  <section className="panel activity-panel">
                    <h2>Getting started</h2>
                    <p>
                      Your JobClose workspace is ready. Start by adding
                      customers and recording your jobs.
                    </p>
                    <span className="demo-label">LIVE DATABASE</span>
                  </section>
                </div>
              </>
            )}
          </>
        
) : activePage === "Jobs" ? (
  <section className="panel jobs-panel">
    <div className="panel-heading">
      <div>
        <h1>All jobs</h1>
        <p>View and manage your recorded jobs.</p>
      </div>
      <span>{jobs.length} recorded jobs</span>
    </div>

    <div className="customer-form-section">
      <h2>Add a new job</h2>

      <form onSubmit={handleAddJob}>
        <div className="form-group">
          <label htmlFor="job-customer">Customer *</label>
          <select
            id="job-customer"
            value={jobCustomerId}
            onChange={(event) => setJobCustomerId(event.target.value)}
            required
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="job-title">Job title *</label>
          <input
            id="job-title"
            type="text"
            value={jobTitle}
            onChange={(event) => setJobTitle(event.target.value)}
            placeholder="e.g. Bathroom plumbing repair"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="job-date">Scheduled date</label>
          <input
            id="job-date"
            type="date"
            value={jobScheduledDate}
            onChange={(event) => setJobScheduledDate(event.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="job-description">Description</label>
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Describe the work required"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="job-cost">Estimated cost (£) *</label>
          <input
            id="job-cost"
            type="number"
            min="0"
            step="0.01"
            value={jobEstimatedCost}
            onChange={(event) => setJobEstimatedCost(event.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={savingJob || customers.length === 0}>
          {savingJob ? "Saving..." : "Add Job"}
        </button>

        {customers.length === 0 && (
          <p>Please add a customer before creating a job.</p>
        )}

        {jobFormError && (
          <p role="alert" className="form-error">
            {jobFormError}
          </p>
        )}

        {jobFormSuccess && (
          <p className="form-success">
            {jobFormSuccess}
          </p>
        )}
      </form>
    </div>

    <div className="panel-heading">
      <div>
        <h2>Job records</h2>
        <p>Your saved jobs.</p>
      </div>
    </div>

    {jobStatusError && (
      <p role="alert" className="form-error">
        {jobStatusError}
      </p>
    )}

    {loading ? (
      <p>Loading jobs...</p>
    ) : error ? (
      <p role="alert">{error}</p>
    ) : (
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
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <tr key={job.id}>
                  <td className="job-id">{job.job_reference}</td>
                  <td>{job.customer_name}</td>
                  <td>{job.title}</td>
                  <td>{formatDate(job.scheduled_date)}</td>
                  <td>{formatCurrency(job.estimated_cost)}</td>
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
              ))
            ) : (
              <tr>
                <td colSpan={6}>No jobs recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )}
  </section>
) : activePage === "Customers" ? (
  <section className="panel jobs-panel">
    <div className="panel-heading">
      <div>
        <h1>Customers</h1>
        <p>View and manage your customer records.</p>
      </div>

      <span>{customers.length} customers</span>
    </div>

    <div className="customer-form-section">
      <h2>Add a new customer</h2>

      <form onSubmit={handleAddCustomer}>
        <div className="form-group">
          <label htmlFor="customer-name">Customer name *</label>
          <input
            id="customer-name"
            type="text"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Enter customer name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="customer-email">Email address</label>
          <input
            id="customer-email"
            type="email"
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            placeholder="Enter email address"
          />
        </div>

        <div className="form-group">
          <label htmlFor="customer-phone">Phone number</label>
          <input
            id="customer-phone"
            type="tel"
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            placeholder="Enter phone number"
          />
        </div>

        <button type="submit" disabled={savingCustomer}>
          {savingCustomer ? "Saving..." : "Add Customer"}
        </button>

        {customerFormError && (
          <p role="alert" className="form-error">
            {customerFormError}
          </p>
        )}

        {customerFormSuccess && (
          <p className="form-success">
            {customerFormSuccess}
          </p>
        )}
      </form>
    </div>

    <div className="panel-heading">
      <div>
        <h2>Customer records</h2>
        <p>Your saved customers.</p>
      </div>
    </div>

    {customersLoading ? (
      <p>Loading customers...</p>
    ) : customersError ? (
      <p role="alert">{customersError}</p>
    ) : (
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>PHONE</th>
              <th>DATE ADDED</th>
            </tr>
          </thead>

          <tbody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.email || "Not provided"}</td>
                  <td>{customer.phone || "Not provided"}</td>
                  <td>
                    {new Date(
                      customer.created_at
                    ).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>No customers recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )}
  </section>
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
