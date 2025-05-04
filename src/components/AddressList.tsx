import React from 'react';

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  default: boolean;
}

interface AddressListProps {
  addresses: Address[];
  onAddAddress?: (address: Omit<Address, 'id'>) => void;
  onEditAddress?: (id: string, address: Omit<Address, 'id'>) => void;
  onDeleteAddress?: (id: string) => void;
  onSetDefault?: (id: string) => void;
}

const AddressList: React.FC<AddressListProps> = ({ addresses, onAddAddress, onEditAddress, onDeleteAddress, onSetDefault }) => {
  return (
    <div className="border rounded p-4">
      <h3 className="text-lg font-semibold mb-2">Manage Addresses</h3>
      {addresses.map((address, index) => (
        <div key={index} className="mb-2 p-2 border-b flex justify-between items-center">
          <span>{address.street}, {address.city}</span>
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