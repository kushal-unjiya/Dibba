import React from 'react';

interface AddressListProps {
  // Define props if needed, e.g., list of addresses, functions to add/edit/delete
}

const AddressList: React.FC<AddressListProps> = () => {
  // Mock data or fetch from props/context
  const addresses = ['123 Main St, Anytown', '456 Oak Ave, Otherville'];

  return (
    <div className="border rounded p-4">
      <h3 className="text-lg font-semibold mb-2">Manage Addresses</h3>
      {addresses.map((address, index) => (
        <div key={index} className="mb-2 p-2 border-b flex justify-between items-center">
          <span>{address}</span>
          <div>
            <button className="text-blue-500 hover:text-blue-700 mr-2 text-sm">Edit</button>
            <button className="text-red-500 hover:text-red-700 text-sm">Delete</button>
          </div>
        </div>
      ))}
      <button className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm">
        Add New Address
      </button>
    </div>
  );
};

export default AddressList;