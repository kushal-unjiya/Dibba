import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Contact Us</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Form Placeholder */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Send us a Message</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" id="name" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
              <textarea id="message" rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"></textarea>
            </div>
            <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
          <div className="space-y-3 text-gray-700">
            <p><strong>Address:</strong> 123 Dibba Lane, Food City, FC 12345</p>
            <p><strong>Phone:</strong> <a href="tel:+1234567890" className="text-amber-600 hover:underline">+1 (234) 567-890</a></p>
            <p><strong>Email:</strong> <a href="mailto:support@dibba.com" className="text-amber-600 hover:underline">support@dibba.com</a></p>
            <p><strong>Support Hours:</strong> Mon - Fri, 9:00 AM - 6:00 PM</p>
          </div>
          <div className="mt-6">
             <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                Live Chat (Mock)
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;