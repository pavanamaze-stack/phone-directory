import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import { toast } from 'react-toastify'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [uploadHistory, setUploadHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [editingUser, setEditingUser] = useState(null)
  const [showAddUser, setShowAddUser] = useState(false)
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'USER',
    isActive: true,
    password: '',
    confirmPassword: ''
  })
  const [addUserForm, setAddUserForm] = useState({
    name: '',
    email: '',
    role: 'USER',
    password: '',
    confirmPassword: ''
  })
  const [savingUser, setSavingUser] = useState(false)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'users') {
        const response = await api.get('/admin/users')
        setUsers(response.data.data.users)
      } else {
        const response = await api.get('/admin/upload-history')
        setUploadHistory(response.data.data.uploads)
      }
    } catch (error) {
      toast.error('Failed to fetch data')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserUpdate = async (userId, updates) => {
    try {
      await api.put(`/admin/users/${userId}`, updates)
      toast.success('User updated successfully')
      fetchData()
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
    setUserForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
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
      const payload = {
        role: addUserForm.role
      }
      if (addUserForm.name.trim()) payload.name = addUserForm.name.trim()
      if (addUserForm.email.trim()) payload.email = addUserForm.email.trim()
      if (addUserForm.password) payload.password = addUserForm.password
      await api.post('/admin/users', payload)
      toast.success('User created successfully')
      setShowAddUser(false)
      setAddUserForm({ name: '', email: '', role: 'USER', password: '', confirmPassword: '' })
      fetchData()
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

    if (userForm.password) {
      payload.password = userForm.password
    }

    try {
      setSavingUser(true)
      await api.put(`/admin/users/${editingUser._id}`, payload)
      toast.success('User updated successfully')
      setEditingUser(null)
      setUserForm({
        name: '',
        email: '',
        role: 'USER',
        isActive: true,
        password: '',
        confirmPassword: ''
      })
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user')
    } finally {
      setSavingUser(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Upload History
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>Users</h2>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowAddUser(true)}
            >
              Add User
            </button>
          </div>
          <table className="table">
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
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        user.isActive ? 'active' : 'inactive'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => openEditUser(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      style={{ marginLeft: '8px' }}
                      onClick={() =>
                        handleUserUpdate(user._id, {
                          isActive: !user.isActive
                        })
                      }
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card">
          <h2>Upload History</h2>
          <table className="table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Total Rows</th>
                <th>Successful</th>
                <th>Failed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {uploadHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    No upload history
                  </td>
                </tr>
              ) : (
                uploadHistory.map((upload) => (
                  <tr key={upload._id}>
                    <td>{upload.fileName}</td>
                    <td>
                      {upload.uploadedBy?.name || 'Unknown'}
                    </td>
                    <td>
                      {new Date(upload.createdAt).toLocaleDateString()}
                    </td>
                    <td>{upload.totalRows}</td>
                    <td className="success">{upload.successfulRows}</td>
                    <td className="error">{upload.failedRows}</td>
                    <td>
                      <span className={`status-badge ${upload.status}`}>
                        {upload.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAddUser && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add User</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddUser(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Name (optional)</label>
                <input
                  type="text"
                  name="name"
                  value={addUserForm.name}
                  onChange={handleAddUserFormChange}
                  placeholder="Leave blank for default"
                />
              </div>
              <div className="form-group">
                <label>Email (optional)</label>
                <input
                  type="email"
                  name="email"
                  value={addUserForm.email}
                  onChange={handleAddUserFormChange}
                  placeholder="Leave blank for placeholder email"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={addUserForm.role}
                  onChange={handleAddUserFormChange}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="USER">User</option>
                </select>
              </div>
              <div className="form-group">
                <label>Password (optional)</label>
                <input
                  type="password"
                  name="password"
                  value={addUserForm.password}
                  onChange={handleAddUserFormChange}
                  placeholder="Leave blank for default password"
                />
              </div>
              <div className="form-group">
                <label>Confirm Password (optional)</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={addUserForm.confirmPassword}
                  onChange={handleAddUserFormChange}
                  placeholder="Re-enter password if set"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingUser}
                >
                  {savingUser ? 'Creating...' : 'Create User'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddUser(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit User</h2>
              <button
                className="close-btn"
                onClick={() => setEditingUser(null)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div className="form-group">
                <label>Name (optional)</label>
                <input
                  type="text"
                  name="name"
                  value={userForm.name}
                  onChange={handleUserFormChange}
                />
              </div>
              <div className="form-group">
                <label>Email (read-only)</label>
                <input
                  type="email"
                  name="email"
                  value={userForm.email}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={userForm.role}
                  onChange={handleUserFormChange}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="USER">User</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={userForm.isActive}
                    onChange={handleUserFormChange}
                    style={{ marginRight: '8px' }}
                  />
                  Active
                </label>
              </div>
              <div className="form-group">
                <label>New Password (optional)</label>
                <input
                  type="password"
                  name="password"
                  value={userForm.password}
                  onChange={handleUserFormChange}
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={userForm.confirmPassword}
                  onChange={handleUserFormChange}
                  placeholder="Re-enter new password"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingUser}
                >
                  {savingUser ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
