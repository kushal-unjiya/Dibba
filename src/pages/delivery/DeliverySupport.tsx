import React from 'react';
import Sidebar from '../../components/Sidebar'; // Adjust path
import { useAuth } from '../../contexts/AuthContext'; // Adjust path

const DeliverySupport: React.FC = () => {
   const { user } = useAuth();

   if (!user || user.role !== 'delivery') {
       return <div className="p-6 text-center">Access Denied. Please log in as a Delivery Partner.</div>;
   }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="delivery" />
      <main className="flex-grow p-6 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Support Center</h1>

        <div className="bg-white p-6 rounded-lg shadow space-y-6">
            {/* FAQ Section Placeholder */}
            <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Frequently Asked Questions</h2>
                <div className="space-y-2 text-sm">
                    <details className="p-2 border rounded hover:bg-gray-50">
                        <summary className="font-medium cursor-pointer">How do I update my bank details?</summary>
                        <p className="mt-1 text-gray-600 pl-4">You can update your bank details in the 'Profile' section of the app.</p>
                    </details>
                     <details className="p-2 border rounded hover:bg-gray-50">
                        <summary className="font-medium cursor-pointer">What happens if the customer is not available?</summary>
                        <p className="mt-1 text-gray-600 pl-4">Please try contacting the customer via the provided phone number. If unreachable after 5 minutes, contact support through the app.</p>
                    </details>
                     <details className="p-2 border rounded hover:bg-gray-50">
                        <summary className="font-medium cursor-pointer">How are earnings calculated?</summary>
                        <p className="mt-1 text-gray-600 pl-4">Earnings are based on distance, delivery time, and potential incentives. You can see the estimated earning for each order before accepting.</p>
                    </details>
                    {/* Add more FAQs */}
                </div>
            </section>

            {/* Contact Support Section */}
             <section className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Contact Support</h2>
                <p className="text-gray-600 mb-4">If you need immediate assistance or your question isn't answered above, please reach out.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded text-center">
                        Live Chat (Mock)
                    </button>
                     <a href="tel:+1234567890" className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded text-center">
                        Call Support (Mock)
                    </a>
                </div>
                 <p className="text-xs text-gray-500 mt-4 text-center">Support available 24/7 for active deliveries.</p>
            </section>
        </div>
      </main>
    </div>
  );
};

export default DeliverySupport;