import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { Plus, Search, Filter, Download, Edit, Trash2 } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const Leads = () => {
  const navigate = useNavigate()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLeads: 0,
    limit: 20
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})
  const [showFilters, setShowFilters] = useState(false)

  const fetchLeads = useCallback(async (page = 1, search = '', filters = {}) => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: pagination.limit,
        ...(search && { search }),
        ...(Object.keys(filters).length && { filters: JSON.stringify(filters) })
      }

      const response = await api.get('/leads', { params })
      setLeads(response.data.leads)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching leads:', error)
      toast.error('Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }, [pagination.limit])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchLeads(1, searchTerm, filters)
  }

  const handleFilterChange = (filterName, filterValue) => {
    const newFilters = { ...filters }
    if (filterValue && filterValue.value !== '') {
      newFilters[filterName] = filterValue
    } else {
      delete newFilters[filterName]
    }
    setFilters(newFilters)
    fetchLeads(1, searchTerm, newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
    fetchLeads(1, '', {})
  }

  const handleDelete = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) {
      return
    }

    try {
      await api.delete(`/leads/${leadId}`)
      toast.success('Lead deleted successfully')
      fetchLeads(pagination.currentPage, searchTerm, filters)
    } catch (error) {
      console.error('Error deleting lead:', error)
      toast.error('Failed to delete lead')
    }
  }

  const StatusCellRenderer = ({ value }) => {
    const getStatusClass = (status) => {
      const classes = {
        new: 'status-new',
        contacted: 'status-contacted',
        qualified: 'status-qualified',
        lost: 'status-lost',
        won: 'status-won'
      }
      return classes[status] || 'status-new'
    }

    return <span className={getStatusClass(value)}>{value}</span>
  }

  const ActionsCellRenderer = ({ data }) => {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => navigate(`/leads/${data._id}/edit`)}
          className="p-1 text-gray-600 hover:text-primary-600"
          title="Edit lead"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleDelete(data._id)}
          className="p-1 text-gray-600 hover:text-red-600"
          title="Delete lead"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    )
  }

  const columnDefs = [
    {
      headerName: 'Name',
      valueGetter: (params) => `${params.data.firstName} ${params.data.lastName}`,
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 150
    },
    {
      headerName: 'Email',
      field: 'email',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 200
    },
    {
      headerName: 'Company',
      field: 'company',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 150
    },
    {
      headerName: 'Phone',
      field: 'phone',
      sortable: true,
      flex: 1,
      minWidth: 130
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: StatusCellRenderer,
      sortable: true,
      filter: true,
      width: 110
    },
    {
      headerName: 'Source',
      field: 'source',
      sortable: true,
      filter: true,
      valueFormatter: (params) => {
        return params.value?.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') || ''
      },
      width: 120
    },
    {
      headerName: 'Score',
      field: 'score',
      sortable: true,
      filter: true,
      width: 80
    },
    {
      headerName: 'Lead Value',
      field: 'leadValue',
      sortable: true,
      filter: true,
      valueFormatter: (params) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(params.value || 0)
      },
      width: 120
    },
    {
      headerName: 'City',
      field: 'city',
      sortable: true,
      filter: true,
      width: 100
    },
    {
      headerName: 'Created',
      field: 'createdAt',
      sortable: true,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      },
      width: 100
    },
    {
      headerName: 'Actions',
      cellRenderer: ActionsCellRenderer,
      width: 100,
      sortable: false,
      filter: false,
      pinned: 'right'
    }
  ]

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">Manage and track your sales leads</p>
        </div>
        <Link
          to="/leads/new"
          className="btn-primary mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card p-6 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads by name, email, company..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            {(Object.keys(filters).length > 0 || searchTerm) && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn-secondary"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="select-field"
                  value={filters.status?.value || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value ? { operator: 'equals', value: e.target.value } : null)}
                >
                  <option value="">All statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="lost">Lost</option>
                  <option value="won">Won</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source
                </label>
                <select
                  className="select-field"
                  value={filters.source?.value || ''}
                  onChange={(e) => handleFilterChange('source', e.target.value ? { operator: 'equals', value: e.target.value } : null)}
                >
                  <option value="">All sources</option>
                  <option value="website">Website</option>
                  <option value="facebook_ads">Facebook Ads</option>
                  <option value="google_ads">Google Ads</option>
                  <option value="referral">Referral</option>
                  <option value="events">Events</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualified
                </label>
                <select
                  className="select-field"
                  value={filters.isQualified?.value || ''}
                  onChange={(e) => handleFilterChange('isQualified', e.target.value ? { operator: 'equals', value: e.target.value === 'true' } : null)}
                >
                  <option value="">All leads</option>
                  <option value="true">Qualified only</option>
                  <option value="false">Not qualified</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          Showing {leads.length} of {pagination.totalLeads} leads
        </p>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="card">
        <div className="ag-theme-alpine" style={{ height: '500px', width: '100%' }}>
          <AgGridReact
            columnDefs={columnDefs}
            rowData={leads}
            loading={loading}
            pagination={true}
            paginationPageSize={pagination.limit}
            suppressPaginationPanel={true}
            rowSelection="single"
            animateRows={true}
            suppressRowClickSelection={true}
            defaultColDef={{
              resizable: true,
              sortable: true
            }}
          />
        </div>

        {/* Custom Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchLeads(pagination.currentPage - 1, searchTerm, filters)}
              disabled={!pagination.hasPrevPage || loading}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => fetchLeads(pagination.currentPage + 1, searchTerm, filters)}
              disabled={!pagination.hasNextPage || loading}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="text-sm text-gray-600">
            {pagination.totalLeads} total leads
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leads