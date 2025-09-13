import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const LeadForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    city: '',
    state: '',
    source: 'website',
    status: 'new',
    score: 0,
    leadValue: 0,
    lastActivityAt: '',
    isQualified: false
  })

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEditing)

  useEffect(() => {
    if (isEditing) {
      fetchLead()
    }
  }, [id, isEditing])

  const fetchLead = async () => {
    try {
      const response = await api.get(`/leads/${id}`)
      const lead = response.data.lead
      
      setFormData({
        firstName: lead.firstName || '',
        lastName: lead.lastName || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        city: lead.city || '',
        state: lead.state || '',
        source: lead.source || 'website',
        status: lead.status || 'new',
        score: lead.score || 0,
        leadValue: lead.leadValue || 0,
        lastActivityAt: lead.lastActivityAt ? 
          new Date(lead.lastActivityAt).toISOString().slice(0, 16) : '',
        isQualified: lead.isQualified || false
      })
    } catch (error) {
      console.error('Error fetching lead:', error)
      toast.error('Failed to fetch lead details')
      navigate('/leads')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.firstName.trim()) {
      toast.error('First name is required')
      return
    }
    if (!formData.lastName.trim()) {
      toast.error('Last name is required')
      return
    }
    if (!formData.email.trim()) {
      toast.error('Email is required')
      return
    }
    if (!formData.phone.trim()) {
      toast.error('Phone is required')
      return
    }
    if (!formData.company.trim()) {
      toast.error('Company is required')
      return
    }
    if (!formData.city.trim()) {
      toast.error('City is required')
      return
    }
    if (!formData.state.trim()) {
      toast.error('State is required')
      return
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid phone number')
      return
    }

    // Score validation
    if (formData.score < 0 || formData.score > 100) {
      toast.error('Score must be between 0 and 100')
      return
    }

    // Lead value validation
    if (formData.leadValue < 0) {
      toast.error('Lead value cannot be negative')
      return
    }

    setLoading(true)
    try {
      const submitData = {
        ...formData,
        lastActivityAt: formData.lastActivityAt || null
      }

      if (isEditing) {
        await api.put(`/leads/${id}`, submitData)
        toast.success('Lead updated successfully!')
      } else {
        await api.post('/leads', submitData)
        toast.success('Lead created successfully!')
      }
      
      navigate('/leads')
    } catch (error) {
      console.error('Error saving lead:', error)
      const message = error.response?.data?.error || 'Failed to save lead'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleCancel = () => {
    navigate('/leads')
  }

  if (initialLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={handleCancel}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Lead' : 'Create New Lead'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Update lead information' : 'Add a new lead to your database'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            </div>

            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                className="input-field"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                className="input-field"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="input-field"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                className="input-field"
                placeholder="+1234567890"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* Company Information */}
            <div className="md:col-span-2 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                required
                className="input-field"
                placeholder="Enter company name"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                required
                className="input-field"
                placeholder="Enter city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                required
                className="input-field"
                placeholder="Enter state"
                value={formData.state}
                onChange={handleChange}
              />
            </div>

            {/* Lead Information */}
            <div className="md:col-span-2 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Information</h3>
            </div>

            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
                Lead Source *
              </label>
              <select
                id="source"
                name="source"
                required
                className="select-field"
                value={formData.source}
                onChange={handleChange}
              >
                <option value="website">Website</option>
                <option value="facebook_ads">Facebook Ads</option>
                <option value="google_ads">Google Ads</option>
                <option value="referral">Referral</option>
                <option value="events">Events</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                id="status"
                name="status"
                required
                className="select-field"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="lost">Lost</option>
                <option value="won">Won</option>
              </select>
            </div>

            <div>
              <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2">
                Lead Score (0-100)
              </label>
              <input
                type="number"
                id="score"
                name="score"
                min="0"
                max="100"
                className="input-field"
                placeholder="Enter lead score"
                value={formData.score}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="leadValue" className="block text-sm font-medium text-gray-700 mb-2">
                Lead Value ($)
              </label>
              <input
                type="number"
                id="leadValue"
                name="leadValue"
                min="0"
                step="0.01"
                className="input-field"
                placeholder="Enter lead value"
                value={formData.leadValue}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="lastActivityAt" className="block text-sm font-medium text-gray-700 mb-2">
                Last Activity
              </label>
              <input
                type="datetime-local"
                id="lastActivityAt"
                name="lastActivityAt"
                className="input-field"
                value={formData.lastActivityAt}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isQualified"
                name="isQualified"
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                checked={formData.isQualified}
                onChange={handleChange}
              />
              <label htmlFor="isQualified" className="ml-2 text-sm text-gray-700">
                Mark as Qualified Lead
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner h-4 w-4 mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Lead' : 'Create Lead'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LeadForm