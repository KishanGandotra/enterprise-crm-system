import './App.css';
import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employees, setEmployees] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [opportunityName, setOpportunityName] = useState('');
  const [clientName, setClientName] = useState('');
  const [revenue, setRevenue] = useState('');
  const [note, setNote] = useState('');
  const [notesByOpportunity, setNotesByOpportunity] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [analytics, setAnalytics] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filesByOpportunity, setFilesByOpportunity] = useState({});
  const [selectedFile, setSelectedFile] = useState(null); // <-- NEW STATE FOR FILE UPLOADS
  const [activeTab, setActiveTab] = useState('dashboard');

  const token = localStorage.getItem('token');
  const userRole = token ? JSON.parse(atob(token.split('.')[1])).role : null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount);
  };

  useEffect(() => {
    if (!token) return;
    const fetchInitialData = async () => {
      try {
        const empResponse = await axios.get('http://localhost:5000/employee/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployees(empResponse.data);
        const analyticsResponse = await axios.get('http://localhost:5000/dashboard/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(analyticsResponse.data);
      } catch (err) { console.log(err); }
    };
    fetchInitialData();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const fetchOpportunities = async () => {
      try {
        const opportunityResponse = await axios.get(
          `http://localhost:5000/opportunity/all?page=${page}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOpportunities(opportunityResponse.data);
        setHasMore(opportunityResponse.data.length === 5);
      } catch (err) { console.log(err); }
    };
    fetchOpportunities();
  }, [token, page]);

  // --- RESTORED LOGIC FUNCTIONS ---
  
  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || 'Login Failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const handleCreateEmployee = async () => {
    try {
      await axios.post('http://localhost:5000/employee/create', { name, email, role }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Employee Created');
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || 'Create Failed');
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/employee/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Employee Deleted');
      window.location.reload();
    } catch (err) {
      alert('Delete Failed');
    }
  };

  const handleUpdateEmployee = async (id) => {
    try {
      await axios.put(`http://localhost:5000/employee/update/${id}`, { name, email, role }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Employee Updated');
      window.location.reload();
    } catch (err) {
      alert('Update Failed');
    }
  };

  const handleCreateOpportunity = async () => {
    try {
      await axios.post('http://localhost:5000/opportunity/create', {
        name: opportunityName, client_name: clientName, description: 'Created from React', service_line: 'Technology', region: 'India', expected_revenue: revenue, start_date: '2026-06-10', end_date: '2026-12-31'
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Opportunity Created');
      window.location.reload();
    } catch (err) {
      alert('Create Opportunity Failed');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    if (!status) return;
    try {
      await axios.put(`http://localhost:5000/opportunity/status/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Status Updated');
      window.location.reload();
    } catch (err) {
      alert('Status Update Failed');
    }
  };

  const handleAddNote = async (opportunityId) => {
    if (!note.trim()) return;
    try {
      await axios.post(`http://localhost:5000/opportunity/note/${opportunityId}`, { note }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNote('');
      handleFetchNotes(opportunityId);
    } catch (err) {
      alert('Add Note Failed');
    }
  };

  const handleFetchNotes = async (opportunityId) => {
    try {
      const response = await axios.get(`http://localhost:5000/opportunity/notes/${opportunityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotesByOpportunity((prev) => ({ ...prev, [opportunityId]: response.data }));
    } catch (err) {
      console.log(err);
    }
  };

  const handleAssignOpportunity = async (opportunityId, employeeId) => {
    if (!employeeId) return;
    try {
      await axios.put(`http://localhost:5000/opportunity/assign/${opportunityId}`, { assigned_to: employeeId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Opportunity Assigned');
      window.location.reload();
    } catch (err) {
      alert('Assignment Failed');
    }
  };

  const handleFetchActivityLogs = async (opportunityId) => {
    try {
      const response = await axios.get(`http://localhost:5000/opportunity/activity/${opportunityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActivityLogs(response.data);
      setSelectedOpportunityId(opportunityId);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteOpportunity = async (id) => {
    if(!window.confirm("Are you sure you want to delete this opportunity?")) return;
    try {
      await axios.delete(`http://localhost:5000/opportunity/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Opportunity Deleted');
      window.location.reload();
    } catch (err) {
      alert('Delete Failed');
    }
  };

  const handleEditOpportunity = async (opp) => {
    const newName = prompt('Opportunity Name', opp.name);
    const newClient = prompt('Client Name', opp.client_name);
    const newRevenue = prompt('Revenue', opp.expected_revenue);

    if (!newName || !newClient || !newRevenue) return;
    try {
      await axios.put(`http://localhost:5000/opportunity/update/${opp.id}`, {
        name: newName, client_name: newClient, expected_revenue: newRevenue
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Opportunity Updated');
      window.location.reload();
    } catch (err) {
      alert('Update Failed');
    }
  };

  const handleFetchFiles = async (opportunityId) => {
    try {
      const response = await axios.get(`http://localhost:5000/opportunity/files/${opportunityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFilesByOpportunity((prev) => ({ ...prev, [opportunityId]: response.data }));
    } catch (err) {
      console.log(err);
    }
  };

  // --- NEW FILE UPLOAD LOGIC ---
  const handleFileUpload = async (opportunityId) => {
    if (!selectedFile) {
      alert('Please choose a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile); 

    try {
      await axios.post(`http://localhost:5000/opportunity/upload/${opportunityId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert('File uploaded successfully!');
      setSelectedFile(null); // Clear the selected file
      handleFetchFiles(opportunityId); // Refresh the file list immediately
      
    } catch (err) {
      console.log(err);
      alert('File upload failed.');
    }
  };

  // --- UI RENDERING ---

  if (token) {
    return (
      <div className="app-layout">
        
        {/* Floating Sidebar */}
        <div className="sidebar">
          <h2>✦ Presto</h2>
          <div className={`menu-item ${activeTab === 'dashboard' ? 'active-menu' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <span style={{opacity: 0.7}}>◱</span> Overview
          </div>
          <div className={`menu-item ${activeTab === 'opportunities' ? 'active-menu' : ''}`} onClick={() => setActiveTab('opportunities')}>
            <span style={{opacity: 0.7}}>⌘</span> Pipeline
          </div>
          <div className={`menu-item ${activeTab === 'opportunity' ? 'active-menu' : ''}`} onClick={() => setActiveTab('opportunity')}>
            <span style={{opacity: 0.7}}>+</span> New Deal
          </div>
          <div className={`menu-item ${activeTab === 'employees' ? 'active-menu' : ''}`} onClick={() => setActiveTab('employees')}>
            <span style={{opacity: 0.7}}>⚇</span> Directory
          </div>
          {/* Locked to Admins only */}
          {userRole === 'ADMIN' && (
            <div className={`menu-item ${activeTab === 'employee' ? 'active-menu' : ''}`} onClick={() => setActiveTab('employee')}>
              <span style={{opacity: 0.7}}>⊞</span> Add Staff
            </div>
          )}
          
          <div className="menu-item logout-btn" onClick={handleLogout}>
            ⏻ Terminate Session
          </div>
        </div>

        {/* Floating Content Canvas */}
        <div className="content">
          <header className="animate-fade-in" style={{ marginBottom: '48px' }}>
            <h1 style={{ fontSize: '36px' }}>{userRole === 'ADMIN' ? 'Admin Interface' : 'Workspace'}</h1>
            <p style={{ color: '#71717a', fontSize: '16px', fontWeight: '500' }}>Authenticated securely as {userRole}.</p>
          </header>

          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
              {analytics && (
                <>
                  <h3 style={{ fontSize: '20px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue Engine</h3>
                  <div className="metrics-container" style={{ marginBottom: '40px' }}>
                    <div className="metric-card">
                      <h4>Total Revenue</h4>
                      <p>{formatCurrency(analytics.totalRevenue)}</p>
                    </div>
                    <div className="metric-card">
                      <h4>Pipeline Value</h4>
                      <p>{formatCurrency(analytics.pipelineRevenue)}</p>
                    </div>
                    <div className="metric-card">
                      <h4>Deals Won</h4>
                      <p>{analytics.wonDeals}</p>
                    </div>
                    <div className="metric-card">
                      <h4>Deals Lost</h4>
                      <p>{analytics.lostDeals}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Locked form content to Admins only */}
          {activeTab === 'employee' && userRole === 'ADMIN' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '24px', marginBottom: '24px' }}>Register New Employee</h3>
              <div className="form-container">
                <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="text" placeholder="Job Role (e.g., ADMIN, SALES)" value={role} onChange={(e) => setRole(e.target.value)} />
                <button onClick={handleCreateEmployee}>Create Profile</button>
              </div>
            </div>
          )}

          {activeTab === 'opportunity' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '24px', marginBottom: '24px' }}>Create New Deal</h3>
              <div className="form-container">
                <input type="text" placeholder="Opportunity Title" value={opportunityName} onChange={(e) => setOpportunityName(e.target.value)} />
                <input type="text" placeholder="Client/Company Name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                <input type="number" placeholder="Expected Revenue (₹)" value={revenue} onChange={(e) => setRevenue(e.target.value)} />
                <button onClick={handleCreateOpportunity}>Add to Pipeline</button>
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '24px' }}>Staff Directory</h3>
              <div className="grid-container">
                {employees.map((emp, index) => (
                  <div key={emp.id} className="employee-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '20px' }}>{emp.name}</h3>
                    <p style={{ margin: '6px 0', color: '#475569', fontWeight: '500' }}>✉️ {emp.email}</p>
                    <p style={{ margin: '6px 0', color: '#475569', fontWeight: '500' }}>💼 {emp.role}</p>
                    
                    {userRole === 'ADMIN' && (
                      <div className="action-buttons" style={{ marginTop: 'auto', paddingTop: '20px' }}>
                        <button className="edit-btn" onClick={() => handleUpdateEmployee(emp.id)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDeleteEmployee(emp.id)}>Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'opportunities' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', maxWidth: '600px' }}>
                <input type="text" placeholder="Search parameters..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '220px' }}>
                  <option value="ALL">All Statuses</option>
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="WON">WON</option>
                  <option value="LOST">LOST</option>
                </select>
              </div>

              <div className="grid-container">
                {opportunities
                  .filter((opp) => {
                    const matchesSearch = opp.name.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesStatus = statusFilter === 'ALL' ? true : opp.status === statusFilter;
                    return matchesSearch && matchesStatus;
                  })
                  .map((opp, index) => (
                    <div key={opp.id} className="opportunity-card animate-fade-in" style={{ animationDelay: `${index * 0.08}s` }}>
                      
                      <div className="opportunity-header">
                        <h3>{opp.name}</h3>
                        <div className={`status-badge status-${opp.status.toLowerCase()}`}>
                          <span className="led"></span>
                          {opp.status.replace('_', ' ')}
                        </div>
                      </div>
                      
                      <div style={{ flex: 1, marginBottom: '24px' }}>
                        <p style={{ margin: '8px 0', color: '#52525b', fontSize: '15px' }}><strong style={{ color: '#09090b' }}>Client:</strong> {opp.client_name}</p>
                        <p style={{ margin: '12px 0', color: '#09090b', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em' }}>{formatCurrency(opp.expected_revenue)}</p>
                        <p style={{ margin: '8px 0', color: '#71717a', fontSize: '14px', fontWeight: '500' }}>Owner: {employees.find((emp) => emp.id === opp.assigned_to)?.name || 'Unassigned'}</p>
                      </div>

                      {userRole === 'ADMIN' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                          <select defaultValue="" onChange={(e) => handleStatusUpdate(opp.id, e.target.value)}>
                            <option value="" disabled>Change Status...</option>
                            <option value="OPEN">OPEN</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="WON">WON</option>
                            <option value="LOST">LOST</option>
                          </select>

                          <select defaultValue="" onChange={(e) => handleAssignOpportunity(opp.id, e.target.value)}>
                            <option value="" disabled>Assign Owner...</option>
                            {employees.map((emp) => (
                              <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                          </select>

                          <div className="action-buttons">
                            <button className="edit-btn" onClick={() => handleEditOpportunity(opp)}>Edit</button>
                            <button className="delete-btn" onClick={() => handleDeleteOpportunity(opp.id)}>Delete</button>
                          </div>
                        </div>
                      )}
                      
                      <div className="tab-actions">
                        <button onClick={() => handleFetchNotes(opp.id)}>Notes</button>
                        <button onClick={() => handleFetchFiles(opp.id)}>Files</button>
                        <button onClick={() => handleFetchActivityLogs(opp.id)}>History</button>
                      </div>

                      {/* Dropdown Content */}
                      {notesByOpportunity[opp.id] && (
                        <div className="animate-fade-in" style={{ marginTop: '20px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <input type="text" placeholder="Type a note..." value={note} onChange={(e) => setNote(e.target.value)} style={{ padding: '10px' }} />
                            <button onClick={() => handleAddNote(opp.id)} style={{ padding: '10px 16px', minWidth: '80px' }}>Post</button>
                          </div>
                          {notesByOpportunity[opp.id].map((n) => (
                            <div key={n.id} style={{ fontSize: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '10px' }}>
                              <p style={{ margin: '0 0 6px 0', color: '#1e293b' }}>{n.note}</p>
                              <small style={{ color: '#94a3b8', fontWeight: '600' }}>— {n.name}</small>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* --- FILES DROPDOWN WITH UPLOAD --- */}
                      {filesByOpportunity[opp.id] && (
                        <div className="animate-fade-in" style={{ marginTop: '20px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          
                          {/* File Upload Controls */}
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
                            <input 
                              type="file" 
                              onChange={(e) => setSelectedFile(e.target.files[0])} 
                              style={{ 
                                padding: '8px', 
                                flex: 1, 
                                background: '#fff', 
                                border: '1px dashed #cbd5e1', 
                                cursor: 'pointer',
                                color: '#64748b',
                                fontSize: '13px'
                              }} 
                            />
                            <button 
                              onClick={() => handleFileUpload(opp.id)} 
                              style={{ padding: '10px 16px', minWidth: '100px', background: '#09090b', color: '#fff', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                            >
                              Upload
                            </button>
                          </div>

                          {/* Display Existing Files */}
                          {(!filesByOpportunity[opp.id] || filesByOpportunity[opp.id].length === 0) && (
                            <p style={{ fontSize: '13px', color: '#a1a1aa', fontStyle: 'italic', margin: '0 0 8px 0' }}>No files attached to this deal yet.</p>
                          )}

                          {filesByOpportunity[opp.id].map((file) => (
                            <a key={file.id} href={`http://localhost:5000/uploads/${file.file_path}`} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: '14px', textDecoration: 'none', color: '#6366f1', fontWeight: '600', marginBottom: '8px', padding: '10px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e7ff' }}>
                              📄 {file.file_name}
                            </a>
                          ))}
                        </div>
                      )}

                      {selectedOpportunityId === opp.id && activityLogs.length > 0 && (
                        <div className="animate-fade-in" style={{ marginTop: '20px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#475569' }}>
                          {activityLogs.map((log) => (
                            <div key={log.id} style={{ marginBottom: '10px', display: 'flex', gap: '8px' }}>
                              <span style={{ color: '#8b5cf6' }}>•</span> 
                              <span>{log.action} <strong style={{ color: '#1e293b' }}>({log.name})</strong></span>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  ))}
              </div>

              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '48px', padding: '20px 0' }}>
                <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ background: '#fff', color: '#09090b', border: '1px solid #e4e4e7', opacity: page === 1 ? 0.5 : 1 }}>← Prev</button>
                <span style={{ fontWeight: '700', color: '#71717a', fontSize: '15px' }}>Page {page}</span>
                <button disabled={!hasMore} onClick={() => setPage(page + 1)} style={{ background: '#fff', color: '#09090b', border: '1px solid #e4e4e7', opacity: !hasMore ? 0.5 : 1 }}>Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // LOGIN SCREEN
  return (
    <div className="login-container">
      <div className="form-container animate-fade-in" style={{ width: '100%', maxWidth: '420px', background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px', color: '#fff' }}>✦ Presto Terminal</h2>
        <p style={{ textAlign: 'center', color: '#a1a1aa', marginBottom: '32px', fontWeight: '500' }}>System Authentication Required</p>
        <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }} />
        <button onClick={handleLogin} style={{ marginTop: '16px', background: '#fff', color: '#000' }}>Initialize Session</button>
      </div>
    </div>
  );
}

export default App;