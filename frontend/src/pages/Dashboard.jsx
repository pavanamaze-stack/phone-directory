import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import { toast } from 'react-toastify'
import './Dashboard.css'

const Dashboard = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    extension: '',
    department: '',
    jobTitle: '',
    officeLocation: '',
    status: 'active'
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const response = await api.get('/employees', {
        params: { limit: 100 }
      })
      setEmployees(response.data.data.employees)
    } catch (error) {
      toast.error('Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleCreate = () => {
    setEditingEmployee(null)
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      extension: '',
      department: '',
      jobTitle: '',
      officeLocation: '',
      status: 'active'
    })
    setShowModal(true)
  }

  const handleEdit = (employee) => {
    setEditingEmployee(employee)
    setFormData({
      fullName: employee.fullName,
      email: employee.email,
      phoneNumber: employee.phoneNumber,
      extension: employee.extension || '',
      department: employee.department,
      jobTitle: employee.jobTitle || '',
      officeLocation: employee.officeLocation || '',
      status: employee.status
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingEmployee) {
        await api.put(`/admin/employees/${editingEmployee._id}`, formData)
        toast.success('Employee updated successfully')
      } else {
        await api.post('/admin/employees', formData)
        toast.success('Employee created successfully')
      }
      setShowModal(false)
      fetchEmployees()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return
    }
    try {
      await api.delete(`/admin/employees/${id}`)
      toast.success('Employee deleted successfully')
      fetchEmployees()
    } catch (error) {
      toast.error('Failed to delete employee')
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    try {
      const response = await api.post('/upload/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success(
        `Upload completed: ${response.data.data.uploadLog.successfulRows} successful, ${response.data.data.uploadLog.failedRows} failed`
      )
      if (response.data.data.uploadLog.errors.length > 0) {
        console.log('Errors:', response.data.data.uploadLog.errors)
      }
      fetchEmployees()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = '' // Reset file input
    }
  }

  if (loading) {
    return <div className="loading">Loading employees...</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Manage Employees</h1>
        <div className="actions">
          <label className="btn btn-primary">
            {uploading ? 'Uploading...' : 'Upload CSV'}
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </label>
          <button onClick={handleCreate} className="btn btn-success">
            Add Employee
          </button>
        </div>
      </div>

      <div className="card">
        <table className="table">
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
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                  No employees found
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee._id}>
                  <td>{employee.fullName || '—'}</td>
                  <td>{employee.email || '—'}</td>
                  <td>{employee.phoneNumber || '—'}</td>
                  <td>{employee.extension || '—'}</td>
                  <td>{employee.department || '—'}</td>
                  <td>{employee.jobTitle || '—'}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        employee.status === 'active' ? 'active' : 'inactive'
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(employee)}
                      className="btn btn-sm btn-secondary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(employee._id)}
                      className="btn btn-sm btn-danger"
                      style={{ marginLeft: '5px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</h2>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name (optional)</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Leave blank if not needed"
                />
              </div>
              <div className="form-group">
                <label>Email (optional)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Leave blank if not needed"
                />
              </div>
              <div className="form-group">
                <label>Phone Number (optional)</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Leave blank if not needed"
                />
              </div>
              <div className="form-group">
                <label>Extension</label>
                <input
                  type="text"
                  name="extension"
                  value={formData.extension}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Department (optional)</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="Leave blank if not needed"
                />
              </div>
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Office Location</label>
                <input
                  type="text"
                  name="officeLocation"
                  value={formData.officeLocation}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">
                  {editingEmployee ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
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

export default Dashboard
