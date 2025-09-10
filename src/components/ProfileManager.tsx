import React, { useState } from 'react'
import { useAuthContext } from '../context/AuthContext'

export function ProfileManager() {
  const { user, profile, updateProfile, loading } = useAuthContext()
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    nim_nip: profile?.nim_nip || ''
  })

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await updateProfile(formData)
    if (result.success) {
      alert('Profile updated successfully!')
    } else {
      alert('Error: ' + result.error)
    }
  }

  const testProfileWorkflows = () => {
    console.log('Testing profile workflows...')
    console.log('Current user:', user?.email)
    console.log('Current profile:', profile)
    console.log('Profile loading state:', loading)
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd' }}>
      <h3>Profile Management Test</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <p>User ID: {user?.id}</p>
        <p>Email: {user?.email}</p>
        <p>Profile loaded: {profile ? 'Yes' : 'No'}</p>
      </div>

      <form onSubmit={handleUpdate}>
        <div>
          <label>Full Name:</label>
          <input 
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
          />
        </div>
        <div>
          <label>Phone:</label>
          <input 
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>
        <div>
          <label>NIM/NIP:</label>
          <input 
            type="text"
            value={formData.nim_nip}
            onChange={(e) => setFormData({...formData, nim_nip: e.target.value})}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>

      <button onClick={testProfileWorkflows} style={{ marginTop: '10px' }}>
        Test Profile Workflows
      </button>
    </div>
  )
}