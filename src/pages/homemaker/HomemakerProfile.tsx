import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar'; // Adjust path
import { useAuth } from '../../contexts/AuthContext'; // Adjust path
import { Homemaker, BankDetails } from '../../interfaces/Homemaker'; // Adjust path
import { Address } from '../../interfaces/Order'; // Adjust path

// Mock API Calls
const fetchMockHomemakerProfile = (homemakerId: string): Promise<Homemaker> => {
    console.log("Fetching profile for homemaker:", homemakerId);
    return new Promise((resolve) => {
        setTimeout(() => resolve({
            id: homemakerId,
            userId: homemakerId,
            name: 'Test Homemaker',
            email: 'homemaker@example.com',
            phone: '1234567890',
            role: 'homemaker',
            kitchenName: 'Mom\'s Kitchen',
            address: { street: '123 Cook St', city: 'Foodville', postalCode: '12345' },
            isActive: true,
            fssaiLicense: '12345678901234',
            bankDetails: {
                accountNumber: '**** **** 1234',
                ifscCode: 'ABCD0123456',
                accountHolderName: 'Test Homemaker',
                upiId: 'homemaker@upi'
            },
            ratings: {
                overall: 4.6,
                taste: 4.7,
                packaging: 4.5,
                hygiene: 4.6,
                delivery: 4.4,
                value: 4.5
            },
            stats: {
                totalOrders: 150,
                completedOrders: 145,
                cancelledOrders: 5,
                totalEarnings: 25000,
                avgRating: 4.6,
                activeMenuItems: 12
            },
            specialties: ['North Indian', 'Home Style'],
            isVerified: true,
            verificationStatus: 'verified',
            registrationDate: new Date(),
            schedule: []
        }), 400);
    });
};

const updateMockHomemakerProfile = (profileData: Partial<Homemaker>): Promise<Homemaker> => {
     console.log("Updating homemaker profile:", profileData);
     const currentProfile = {} as Homemaker;
     const updatedData = { ...currentProfile, ...profileData };
     return new Promise((resolve) => {
        setTimeout(() => resolve(updatedData), 300);
     });
};


const HomemakerProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Homemaker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState<Partial<Homemaker>>({});

  useEffect(() => {
    if (user?.id && user.role === 'homemaker') {
      setIsLoading(true);
      fetchMockHomemakerProfile(user.id)
        .then(data => {
            setProfile(data);
            setEditableProfile(JSON.parse(JSON.stringify(data)));
        })
        .catch(err => console.error("Failed to load profile", err))
        .finally(() => setIsLoading(false));
    } else {
        setIsLoading(false);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setEditableProfile(prev => {
        const newProfile = { ...prev };

        if (name.startsWith('address.')) {
            const field = name.split('.')[1] as keyof Address;
            if (!newProfile.address) newProfile.address = {} as Address;
            (newProfile.address as any)[field] = value;
        }
        else if (name.startsWith('bankDetails.')) {
             const field = name.split('.')[1] as keyof BankDetails;
             if (!newProfile.bankDetails) newProfile.bankDetails = {} as BankDetails;
             (newProfile.bankDetails as any)[field] = value;
        }
        else if (type === 'checkbox') {
             const checked = (e.target as HTMLInputElement).checked;
             (newProfile as any)[name] = checked;
        }
        else {
            (newProfile as any)[name] = value;
        }
        return newProfile;
    });
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsLoading(true);
    try {
        const dataToSave = { ...editableProfile, id: profile.id, userId: profile.userId };
        const updatedProfile = await updateMockHomemakerProfile(dataToSave);
        setProfile(updatedProfile);
        setEditableProfile(JSON.parse(JSON.stringify(updatedProfile)));
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
          setEditableProfile(JSON.parse(JSON.stringify(profile)));
      }
  };

   if (!user || user.role !== 'homemaker') {
       return <div className="p-6 text-center">Access Denied. Please log in as a Homemaker.</div>;
   }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="homemaker" />
      <main className="flex-grow p-6 bg-gray-50 ml-64">
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
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    {isEditing ? <input type="text" name="name" value={editableProfile.name || ''} onChange={handleInputChange} className="mt-1 input-field"/> : <p className="mt-1 text-gray-900">{profile.name}</p>}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">{profile.email}</p>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    {isEditing ? <input type="tel" name="phone" value={editableProfile.phone || ''} onChange={handleInputChange} className="mt-1 input-field"/> : <p className="mt-1 text-gray-900">{profile.phone}</p>}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Kitchen Name</label>
                    {isEditing ? <input type="text" name="kitchenName" value={editableProfile.kitchenName || ''} onChange={handleInputChange} className="mt-1 input-field"/> : <p className="mt-1 text-gray-900">{profile.kitchenName || 'N/A'}</p>}
                </div>

                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Kitchen Address</label>
                    {isEditing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                            <input type="text" name="address.street" placeholder="Street" value={editableProfile.address?.street || ''} onChange={handleInputChange} className="input-field"/>
                            <input type="text" name="address.city" placeholder="City" value={editableProfile.address?.city || ''} onChange={handleInputChange} className="input-field"/>
                            <input type="text" name="address.postalCode" placeholder="Postal Code" value={editableProfile.address?.postalCode || ''} onChange={handleInputChange} className="input-field"/>
                        </div>
                    ) : <p className="mt-1 text-gray-900">{profile.address ? `${profile.address.street}, ${profile.address.city}, ${profile.address.postalCode}` : 'N/A'}</p>}
                </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700">FSSAI License</label>
                    {isEditing ? <input type="text" name="fssaiLicense" value={editableProfile.fssaiLicense || ''} onChange={handleInputChange} className="mt-1 input-field"/> : <p className="mt-1 text-gray-900">{profile.fssaiLicense || 'N/A'}</p>}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Average Rating</label>
                    <p className="mt-1 text-gray-900">{profile.ratings?.overall ? `${profile.ratings.overall.toFixed(1)} ★` : 'N/A'}</p>
                </div>
                 <div className="flex items-center">
                     <input type="checkbox" id="isActive" name="isActive" checked={isEditing ? !!editableProfile.isActive : !!profile.isActive} onChange={handleInputChange} disabled={!isEditing} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2"/>
                     <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Accepting Orders</label>
                 </div>

                 <div className="md:col-span-2 border-t pt-4 mt-4">
                     <h3 className="text-lg font-medium text-gray-800 mb-2">Bank Details (For Payouts)</h3>
                     {isEditing ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <input
                                type="text"
                                name="bankDetails.accountHolderName"
                                placeholder="Account Holder Name"
                                value={editableProfile.bankDetails?.accountHolderName || ''}
                                onChange={handleInputChange}
                                className="input-field"
                             />
                             <input
                                type="text"
                                name="bankDetails.accountNumber"
                                placeholder="Account Number"
                                value={editableProfile.bankDetails?.accountNumber || ''}
                                onChange={handleInputChange}
                                className="input-field"
                             />
                             <input
                                type="text"
                                name="bankDetails.ifscCode"
                                placeholder="IFSC Code"
                                value={editableProfile.bankDetails?.ifscCode || ''}
                                onChange={handleInputChange}
                                className="input-field"
                             />
                             <input
                                type="text"
                                name="bankDetails.upiId"
                                placeholder="UPI ID (Optional)"
                                value={editableProfile.bankDetails?.upiId || ''}
                                onChange={handleInputChange}
                                className="input-field"
                             />
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
          <p className="text-red-500">Failed to load profile data or access denied.</p>
        )}
        <style>{`.input-field { display: block; width: 100%; padding: 0.5rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: sm; }`}</style>
      </main>
    </div>
  );
};

export default HomemakerProfile;