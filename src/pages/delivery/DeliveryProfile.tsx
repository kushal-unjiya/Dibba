import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DeliveryPartner } from '../../interfaces/DeliveryPartner';
import { usersAPI } from '../../services/api';

const DeliveryProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DeliveryPartner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState<Partial<DeliveryPartner>>({});

  useEffect(() => {
    if (user?.id && user.role === 'delivery') {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');

      const profileData = await usersAPI.getCurrentUser(token);
      setProfile(profileData);
      setEditableProfile(profileData);
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name.startsWith('vehicleDetails.')) {
      const field = name.split('.')[1];
      setEditableProfile(prev => ({
        ...prev,
        vehicleDetails: { ...prev?.vehicleDetails, [field]: value }
      }));
    } else if (name.startsWith('bankDetails.')) {
      const field = name.split('.')[1];
      setEditableProfile(prev => ({
        ...prev,
        bankDetails: { ...prev?.bankDetails, [field]: value }
      }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEditableProfile(prev => ({ ...prev, [name]: checked }));
    } else {
      setEditableProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');

      const updatedProfile = await usersAPI.updateProfile(profile.id, editableProfile, token);
      setProfile(updatedProfile);
      setEditableProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setEditableProfile(profile);
    }
  };

  if (!user || user.role !== 'delivery') {
    return <div className="p-6 text-center text-red-600">Access Denied. Please log in as a Delivery Partner.</div>;
  }

  return (
    <div className="flex min-h-screen">
      <main className="flex-grow p-6 bg-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Your Profile</h1>
          {!isEditing && profile && (
            <button onClick={() => setIsEditing(true)} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm">Edit Profile</button>
          )}
        </div>

        {isLoading && !profile ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading profile...</p>
          </div>
        ) : profile ? (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                {isEditing ? (
                  <input type="text" name="name" value={editableProfile.name || ''} onChange={handleInputChange} className="input-field"/>
                ) : (
                  <p className="mt-1 text-gray-900">{profile.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{profile.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                {isEditing ? (
                  <input type="tel" name="phone" value={editableProfile.phone || ''} onChange={handleInputChange} className="input-field"/>
                ) : (
                  <p className="mt-1 text-gray-900">{profile.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Average Rating</label>
                <p className="mt-1 text-gray-900">{profile.rating?.toFixed(1) || 'N/A'} ★</p>
              </div>

              <div className="flex items-center">
                <input type="checkbox" id="isAvailable" name="isAvailable" checked={isEditing ? editableProfile.isAvailable : profile.isAvailable} onChange={handleInputChange} disabled={!isEditing} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2"/>
                <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">Available for Deliveries</label>
              </div>

              {/* Vehicle Details */}
              <div className="md:col-span-2 border-t pt-4 mt-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Vehicle Details</h3>
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                    <select name="vehicleDetails.type" value={editableProfile.vehicleDetails?.type || ''} onChange={handleInputChange} className="input-field">
                      <option value="">Select Type</option>
                      <option value="bicycle">Bicycle</option>
                      <option value="motorcycle">Motorcycle</option>
                      <option value="scooter">Scooter</option>
                      <option value="car">Car</option>
                    </select>
                    <input type="text" name="vehicleDetails.registrationNumber" placeholder="Registration No." value={editableProfile.vehicleDetails?.registrationNumber || ''} onChange={handleInputChange} className="input-field"/>
                    <input type="text" name="vehicleDetails.model" placeholder="Model (Optional)" value={editableProfile.vehicleDetails?.model || ''} onChange={handleInputChange} className="input-field"/>
                  </div>
                ) : (
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Type:</strong> {profile.vehicleDetails?.type || 'N/A'}</p>
                    <p><strong>Registration:</strong> {profile.vehicleDetails?.registrationNumber || 'N/A'}</p>
                    <p><strong>Model:</strong> {profile.vehicleDetails?.model || 'N/A'}</p>
                  </div>
                )}
              </div>

              {/* Bank Details */}
              <div className="md:col-span-2 border-t pt-4 mt-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Bank Details (For Payouts)</h3>
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" name="bankDetails.accountHolderName" placeholder="Account Holder Name" value={editableProfile.bankDetails?.accountHolderName || ''} onChange={handleInputChange} className="input-field"/>
                    <input type="text" name="bankDetails.accountNumber" placeholder="Account Number" value={editableProfile.bankDetails?.accountNumber || ''} onChange={handleInputChange} className="input-field"/>
                    <input type="text" name="bankDetails.ifscCode" placeholder="IFSC Code" value={editableProfile.bankDetails?.ifscCode || ''} onChange={handleInputChange} className="input-field"/>
                    <input type="text" name="bankDetails.upiId" placeholder="UPI ID (Optional)" value={editableProfile.bankDetails?.upiId || ''} onChange={handleInputChange} className="input-field"/>
                  </div>
                ) : (
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Account Holder:</strong> {profile.bankDetails?.accountHolderName || 'N/A'}</p>
                    <p><strong>Account Number:</strong> {profile.bankDetails?.accountNumber || 'N/A'}</p>
                    <p><strong>IFSC Code:</strong> {profile.bankDetails?.ifscCode || 'N/A'}</p>
                    <p><strong>UPI ID:</strong> {profile.bankDetails?.upiId || 'N/A'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-3 mt-6 border-t pt-4">
                <button onClick={handleCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded text-sm">Cancel</button>
                <button onClick={handleSave} disabled={isLoading} className={`bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-red-500">Failed to load profile data.</p>
        )}
        <style>{`.input-field { display: block; width: 100%; padding: 0.5rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: sm; }`}</style>
      </main>
    </div>
  );
};

export default DeliveryProfile;