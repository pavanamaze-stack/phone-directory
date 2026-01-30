import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import { toast } from 'react-toastify'
import './Directory.css'

const Directory = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('name')
  const [order, setOrder] = useState('asc')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [search, department, status, sort, order, page])

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/employees/departments')
      setDepartments(response.data.data.departments)
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 10,
        sort,
        order
      }
      if (search) params.search = search
      if (department) params.jobTitle = department
      if (status) params.status = status

      const response = await api.get('/employees', { params })
      setEmployees(response.data.data.employees)
      setPagination(response.data.data.pagination)
    } catch (error) {
      toast.error('Failed to fetch employees')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'department') {
      setDepartment(value)
    } else if (filterType === 'status') {
      setStatus(value)
    }
    setPage(1)
  }

  const handleSort = (field) => {
    if (sort === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc')
    } else {
      setSort(field)
      setOrder('asc')
    }
  }

  if (loading && employees.length === 0) {
    return (
      <div className="directory-loading">
        <div className="loading-spinner"></div>
        <p>Loading employees...</p>
      </div>
    )
  }

  return (
    <div className="directory">
      <div className="directory-header">
        <div className="header-background">
          <div className="header-gradient"></div>
          <div className="header-pattern"></div>
        </div>
        <div className="header-content">
          <div className="header-main">
            <div className="header-icon-wrapper">
              <div className="header-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" fill="currentColor"/>
                </svg>
                <div className="icon-glow"></div>
              </div>
            </div>
            <div className="header-text">
              <h1>
                <span className="title-main">Employee Directory</span>
                <span className="title-accent"></span>
              </h1>
              <p className="directory-subtitle">
                {pagination.totalItems ? (
                  <>
                    <span className="subtitle-highlight">{pagination.totalItems}</span> employees in your organization
                  </>
                ) : (
                  'Browse and manage employee information'
                )}
              </p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-icon stat-icon-total">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{pagination.totalItems || 0}</div>
                <div className="stat-label">Total Employees</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-active">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {employees.filter(e => e.status === 'active').length}
                </div>
                <div className="stat-label">Active</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-departments">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 00-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" fill="currentColor"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{departments.length}</div>
                <div className="stat-label">Departments</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="directory-filters-card">
        <div className="search-box">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, phone, job title..."
            value={search}
            onChange={handleSearch}
            className="search-input"
          />
          {search && (
            <button
              className="clear-search"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
        <div className="filter-group">
          <div className="filter-wrapper">
            <svg className="filter-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" fill="currentColor"/>
            </svg>
            <select
              value={department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="filter-select"
            >
              <option value="">All Job Titles</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-wrapper">
            <svg className="filter-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" fill="currentColor"/>
            </svg>
            <select
              value={status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-container">
          {loading && employees.length > 0 && (
            <div className="table-loading-overlay">
              <div className="loading-spinner-small"></div>
            </div>
          )}
          <table className="directory-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable">
                  <div className="th-content">
                    <span>Name</span>
                    {sort === 'name' && (
                      <svg className="sort-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {order === 'asc' ? (
                          <path d="M7 14l5-5 5 5H7z" fill="currentColor"/>
                        ) : (
                          <path d="M7 10l5 5 5-5H7z" fill="currentColor"/>
                        )}
                      </svg>
                    )}
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
                    </svg>
                    <span>Email</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="currentColor"/>
                    </svg>
                    <span>Phone</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="currentColor"/>
                    </svg>
                    <span>Ext Number</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span>Direct Contact (DC)</span>
                  </div>
                </th>
                <th onClick={() => handleSort('jobTitle')} className="sortable">
                  <div className="th-content">
                    <span>Job Title</span>
                    {sort === 'jobTitle' && (
                      <svg className="sort-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {order === 'asc' ? (
                          <path d="M7 14l5-5 5 5H7z" fill="currentColor"/>
                        ) : (
                          <path d="M7 10l5 5 5-5H7z" fill="currentColor"/>
                        )}
                      </svg>
                    )}
                  </div>
                </th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    <div className="empty-state-content">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor" opacity="0.3"/>
                      </svg>
                      <p>No employees found</p>
                      <span>Try adjusting your search or filters</span>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((employee, index) => (
                  <tr key={employee._id} className="table-row" style={{ animationDelay: `${index * 0.05}s` }}>
                    <td className="employee-name">
                      <div className="name-avatar">
                        <div className="avatar-circle">
                          {((employee.name || employee.fullName) && (employee.name || employee.fullName).charAt(0)) ? (employee.name || employee.fullName).charAt(0).toUpperCase() : '—'}
                        </div>
                        <span>{(employee.name || employee.fullName) || '—'}</span>
                      </div>
                    </td>
                    <td>
                      {employee.email ? (
                        <a href={`mailto:${employee.email}`} className="email-link">
                          {employee.email}
                        </a>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                    <td>
                      {(employee.phone || employee.phoneNumber) ? (
                        <a href={`tel:${employee.phone || employee.phoneNumber}`} className="phone-link">
                          {employee.phone || employee.phoneNumber}
                        </a>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                    <td className="extension-cell">{(employee.extNumber || employee.extension) || '—'}</td>
                    <td>{employee.directContact || '—'}</td>
                    <td className="job-title-cell">{employee.jobTitle || '—'}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          employee.status === 'active' ? 'active' : 'inactive'
                        }`}
                      >
                        <span className="status-dot"></span>
                        {employee.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination-wrapper">
          <div className="pagination-info">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} employees
          </div>
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Previous
            </button>
            <div className="pagination-pages">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`pagination-page ${pagination.currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              className="pagination-btn"
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages}
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Directory
