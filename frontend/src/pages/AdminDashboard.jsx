import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import { toast } from 'react-toastify'
import './AdminDashboard.css'

const EMPTY_USER_FORM = {
  name: '',
  email: '',
  role: 'USER',
  isActive: true,
  password: '',
  confirmPassword: ''
}

const EMPTY_EMPLOYEE_FORM = {
  fullName: '',
  email: '',
  phoneNumber: '',
  extension: '',
  department: '',
  jobTitle: '',
  officeLocation: '',
  status: 'active'
}

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [employees, setEmployees] = useState([])
  const [uploadHistory, setUploadHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [editingUser, setEditingUser] = useState(null)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [showAddUser, setShowAddUser] = useState(false)
  const [userForm, setUserForm] = useState(EMPTY_USER_FORM)
  const [addUserForm, setAddUserForm] = useState(EMPTY_USER_FORM)
  const [employeeForm, setEmployeeForm] = useState(EMPTY_EMPLOYEE_FORM)
  const [savingUser, setSavingUser] = useState(false)
  const [savingEmployee, setSavingEmployee] = useState(false)
  const [uploadingCsv, setUploadingCsv] = useState(false)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'users') {
        const res = await api.get('/admin/users')
        setUsers(res.data.data.users)
      } else if (activeTab === 'employees') {
        const res = await api.get('/employees', { params: { limit: 10000 } })
        setEmployees(res.data.data.employees)
      } else {
        const res = await api.get('/admin/upload-history')
        setUploadHistory(res.data.data.uploads)
      }
    } catch (error) {
      toast.error('Failed to fetch data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserUpdate = async (userId, updates) => {
    try {
      await api.put(`/admin/users/${userId}`, updates)
      toast.success('User updated')
      await fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user')
    }
  }

  const openEditUser = (user) => {
    setEditingUser(user)
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'USER',
      isActive: user.isActive ?? true,
      password: '',
      confirmPassword: ''
    })
  }

  const handleUserFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setUserForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleAddUserFormChange = (e) => {
    const { name, value } = e.target
    setAddUserForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    if (addUserForm.password && addUserForm.password.length < 6) {
      toast.error('Password must be at least 6 characters when provided')
      return
    }
    if (addUserForm.password && addUserForm.password !== addUserForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    try {
      setSavingUser(true)
      const payload = { role: addUserForm.role }
      if (addUserForm.name.trim()) payload.name = addUserForm.name.trim()
      if (addUserForm.email.trim()) payload.email = addUserForm.email.trim()
      if (addUserForm.password) payload.password = addUserForm.password
      await api.post('/admin/users', payload)
      toast.success('User created')
      setShowAddUser(false)
      setAddUserForm(EMPTY_USER_FORM)
      await fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user')
    } finally {
      setSavingUser(false)
    }
  }

  const handleSaveUser = async (e) => {
    e.preventDefault()
    if (!editingUser) return
    if (userForm.password && userForm.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (userForm.password && userForm.password !== userForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    const payload = {
      name: userForm.name.trim(),
      role: userForm.role,
      isActive: userForm.isActive
    }
    if (userForm.password) payload.password = userForm.password
    try {
      setSavingUser(true)
      await api.put(`/admin/users/${editingUser._id}`, payload)
      toast.success('User updated')
      setEditingUser(null)
      setUserForm(EMPTY_USER_FORM)
      await fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user')
    } finally {
      setSavingUser(false)
    }
  }

  const openEditEmployee = (emp) => {
    setEditingEmployee(emp)
    setEmployeeForm({
      fullName: emp.fullName ?? '',
      email: emp.email ?? '',
      phoneNumber: emp.phoneNumber ?? '',
      extension: emp.extension ?? '',
      department: emp.department ?? '',
      jobTitle: emp.jobTitle ?? '',
      officeLocation: emp.officeLocation ?? '',
      status: emp.status ?? 'active'
    })
  }

  const handleEmployeeFormChange = (e) => {
    const { name, value } = e.target
    setEmployeeForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveEmployee = async (e) => {
    e.preventDefault()
    if (!editingEmployee) return
    const payload = {}
    const fields = ['fullName', 'email', 'phoneNumber', 'extension', 'department', 'jobTitle', 'officeLocation', 'status']
    fields.forEach((f) => {
      const v = employeeForm[f]
      payload[f] = v == null || String(v).trim() === '' ? '' : String(v).trim()
    })
    if (payload.status !== 'active' && payload.status !== 'inactive') payload.status = 'active'
    try {
      setSavingEmployee(true)
      await api.put(`/admin/employees/${editingEmployee._id}`, payload)
      toast.success('Employee updated')
      setEditingEmployee(null)
      setEmployeeForm(EMPTY_EMPLOYEE_FORM)
      await fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update employee')
    } finally {
      setSavingEmployee(false)
    }
  }

  const handleCsvUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }
    const formData = new FormData()
    formData.append('file', file)
    setUploadingCsv(true)
    try {
      const res = await api.post('/upload/csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success(`Upload: ${res.data.data.uploadLog.successfulRows} successful, ${res.data.data.uploadLog.failedRows} failed`)
      await fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed')
    } finally {
      setUploadingCsv(false)
      e.target.value = ''
    }
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-bg" />
        <div className="admin-header-content">
          <h1>Admin Panel</h1>
          <p>Manage users, employees, and uploads</p>
        </div>
      </header>

      <nav className="admin-tabs">
        <button
          type="button"
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <span className="admin-tab-icon">👤</span>
          User Management
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          <span className="admin-tab-icon">👥</span>
          Manage Employees
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span className="admin-tab-icon">📤</span>
          Upload History
        </button>
      </nav>

      <main className="admin-main">
        {activeTab === 'users' && (
          <section className="admin-card">
            <div className="admin-card-head">
              <h2>Users</h2>
              <button type="button" className="admin-btn primary" onClick={() => setShowAddUser(true)}>
                Add User
              </button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name || '—'}</td>
                      <td>{user.email || '—'}</td>
                      <td><span className="admin-role-badge">{user.role}</span></td>
                      <td>
                        <span className={`admin-status ${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button type="button" className="admin-btn sm secondary" onClick={() => openEditUser(user)}>Edit</button>
                        <button
                          type="button"
                          className="admin-btn sm secondary"
                          onClick={() => handleUserUpdate(user._id, { isActive: !user.isActive })}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'employees' && (
          <section className="admin-card">
            <div className="admin-card-head">
              <h2>Manage Employees</h2>
              <div className="admin-card-actions">
                <label className={`admin-upload-btn ${uploadingCsv ? 'loading' : ''}`}>
                  <input type="file" accept=".csv" onChange={handleCsvUpload} disabled={uploadingCsv} hidden />
                  {uploadingCsv ? 'Uploading...' : 'Upload CSV'}
                </label>
              </div>
            </div>
            <p className="admin-card-hint">All fields are optional. CSV upload accepts empty fields. Edit any row to update (null/empty saves).</p>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Extension</th>
                    <th>Department</th>
                    <th>Job Title</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="admin-empty">No employees yet. Upload a CSV or add from Dashboard.</td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr key={emp._id}>
                        <td>{emp.fullName || '—'}</td>
                        <td>{emp.email || '—'}</td>
                        <td>{emp.phoneNumber || '—'}</td>
                        <td>{emp.extension || '—'}</td>
                        <td>{emp.department || '—'}</td>
                        <td>{emp.jobTitle || '—'}</td>
                        <td>
                          <span className={`admin-status ${emp.status === 'active' ? 'active' : 'inactive'}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td>
                          <button type="button" className="admin-btn sm primary" onClick={() => openEditEmployee(emp)}>Edit</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'history' && (
          <section className="admin-card">
            <div className="admin-card-head">
              <h2>Upload History</h2>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Uploaded By</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Success</th>
                    <th>Failed</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadHistory.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="admin-empty">No upload history</td>
                    </tr>
                  ) : (
                    uploadHistory.map((upload) => (
                      <tr key={upload._id}>
                        <td>{upload.fileName}</td>
                        <td>{upload.uploadedBy?.name || '—'}</td>
                        <td>{new Date(upload.createdAt).toLocaleString()}</td>
                        <td>{upload.totalRows}</td>
                        <td className="admin-success">{upload.successfulRows}</td>
                        <td className="admin-failed">{upload.failedRows}</td>
                        <td>
                          <span className={`admin-status ${upload.status}`}>{upload.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {showAddUser && (
        <div className="admin-modal-overlay" onClick={() => setShowAddUser(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Add User</h2>
              <button type="button" className="admin-modal-close" onClick={() => setShowAddUser(false)} aria-label="Close">×</button>
            </div>
            <form onSubmit={handleAddUser} className="admin-form">
              {['name', 'email'].map((field) => (
                <div key={field} className="admin-form-group">
                  <label>{field === 'name' ? 'Name (optional)' : 'Email (optional)'}</label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    name={field}
                    value={addUserForm[field]}
                    onChange={handleAddUserFormChange}
                    placeholder={`Leave blank for default`}
                  />
                </div>
              ))}
              <div className="admin-form-group">
                <label>Role</label>
                <select name="role" value={addUserForm.role} onChange={handleAddUserFormChange}>
                  <option value="ADMIN">Admin</option>
                  <option value="USER">User</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label>Password (optional)</label>
                <input type="password" name="password" value={addUserForm.password} onChange={handleAddUserFormChange} placeholder="Default if blank" />
              </div>
              <div className="admin-form-group">
                <label>Confirm Password</label>
                <input type="password" name="confirmPassword" value={addUserForm.confirmPassword} onChange={handleAddUserFormChange} />
              </div>
              <div className="admin-form-actions">
                <button type="submit" className="admin-btn primary" disabled={savingUser}>{savingUser ? 'Creating...' : 'Create'}</button>
                <button type="button" className="admin-btn secondary" onClick={() => setShowAddUser(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="admin-modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Edit User</h2>
              <button type="button" className="admin-modal-close" onClick={() => setEditingUser(null)} aria-label="Close">×</button>
            </div>
            <form onSubmit={handleSaveUser} className="admin-form">
              <div className="admin-form-group">
                <label>Name (optional)</label>
                <input type="text" name="name" value={userForm.name} onChange={handleUserFormChange} placeholder="Leave blank to keep" />
              </div>
              <div className="admin-form-group">
                <label>Email (read-only)</label>
                <input type="email" name="email" value={userForm.email} disabled />
              </div>
              <div className="admin-form-group">
                <label>Role</label>
                <select name="role" value={userForm.role} onChange={handleUserFormChange}>
                  <option value="ADMIN">Admin</option>
                  <option value="USER">User</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label>
                  <input type="checkbox" name="isActive" checked={userForm.isActive} onChange={handleUserFormChange} />
                  Active
                </label>
              </div>
              <div className="admin-form-group">
                <label>New Password (optional)</label>
                <input type="password" name="password" value={userForm.password} onChange={handleUserFormChange} placeholder="Keep current if blank" />
              </div>
              <div className="admin-form-group">
                <label>Confirm Password</label>
                <input type="password" name="confirmPassword" value={userForm.confirmPassword} onChange={handleUserFormChange} />
              </div>
              <div className="admin-form-actions">
                <button type="submit" className="admin-btn primary" disabled={savingUser}>{savingUser ? 'Saving...' : 'Save'}</button>
                <button type="button" className="admin-btn secondary" onClick={() => setEditingUser(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingEmployee && (
        <div className="admin-modal-overlay" onClick={() => setEditingEmployee(null)}>
          <div className="admin-modal admin-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Edit Employee</h2>
              <button type="button" className="admin-modal-close" onClick={() => setEditingEmployee(null)} aria-label="Close">×</button>
            </div>
            <p className="admin-form-hint">All fields optional. Leave blank to clear or keep existing. Null/empty saves.</p>
            <form onSubmit={handleSaveEmployee} className="admin-form">
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Full Name (optional)</label>
                  <input type="text" name="fullName" value={employeeForm.fullName} onChange={handleEmployeeFormChange} placeholder="Leave blank if not needed" />
                </div>
                <div className="admin-form-group">
                  <label>Email (optional)</label>
                  <input type="email" name="email" value={employeeForm.email} onChange={handleEmployeeFormChange} placeholder="Leave blank if not needed" />
                </div>
                <div className="admin-form-group">
                  <label>Phone (optional)</label>
                  <input type="text" name="phoneNumber" value={employeeForm.phoneNumber} onChange={handleEmployeeFormChange} placeholder="Leave blank if not needed" />
                </div>
                <div className="admin-form-group">
                  <label>Extension (optional)</label>
                  <input type="text" name="extension" value={employeeForm.extension} onChange={handleEmployeeFormChange} placeholder="Leave blank if not needed" />
                </div>
                <div className="admin-form-group">
                  <label>Department (optional)</label>
                  <input type="text" name="department" value={employeeForm.department} onChange={handleEmployeeFormChange} placeholder="Leave blank if not needed" />
                </div>
                <div className="admin-form-group">
                  <label>Job Title (optional)</label>
                  <input type="text" name="jobTitle" value={employeeForm.jobTitle} onChange={handleEmployeeFormChange} placeholder="Leave blank if not needed" />
                </div>
                <div className="admin-form-group">
                  <label>Office Location (optional)</label>
                  <input type="text" name="officeLocation" value={employeeForm.officeLocation} onChange={handleEmployeeFormChange} placeholder="Leave blank if not needed" />
                </div>
                <div className="admin-form-group">
                  <label>Status</label>
                  <select name="status" value={employeeForm.status} onChange={handleEmployeeFormChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="admin-form-actions">
                <button type="submit" className="admin-btn primary" disabled={savingEmployee}>{savingEmployee ? 'Saving...' : 'Save'}</button>
                <button type="button" className="admin-btn secondary" onClick={() => setEditingEmployee(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
