import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import { toast } from 'react-toastify'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [uploadHistory, setUploadHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')

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
          <h2>Users</h2>
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
    </div>
  )
}

export default AdminDashboard
