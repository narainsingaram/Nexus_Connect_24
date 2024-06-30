import React from 'react';
import { useState } from 'react';

const Help = () => {
  const [adminMode, setAdminMode] = useState(false);

  // Function to toggle admin mode
  const toggleAdminMode = () => {
    setAdminMode(!adminMode);
  };

  return (
    <div className="container mx-auto ml-64 py-8 ">
    <h1 className="text-3xl font-bold mb-4 !ml-8">Business and Community Partner Management System - Help & Instructions</h1>
      <div className="bg-slate-100 rounded-2xl m-4 p-6">
        <h2 className="text-xl font-bold mb-4">Table of Contents</h2>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">1. Getting Started</h3>
          <p>Upon launching the application, you'll see a dashboard displaying all your business and community partners. The system is pre-loaded with at least 25 partners to get you started.</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">2. Viewing Partner Information</h3>
          <p><strong>Card View:</strong> By default, partners are displayed in a card format. Each card shows key information such as the partner's name, business type, and industry sector.</p>
          <p><strong>Table View:</strong> Toggle to table view for a more compact display of partner information.</p>
          <p><strong>Detailed View:</strong> Click on a partner's card or row to open a modal with comprehensive information about that partner.</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">3. Searching and Filtering</h3>
          <p><strong>Search Bar:</strong> Use the search bar at the top of the page to find partners by name, information, or tags.</p>
          <p><strong>Business Type Filter:</strong> Use the dropdown menu to filter partners by their business type.</p>
          <p><strong>Industry Sector Filter:</strong> Filter partners based on their industry sector using the provided dropdown.</p>
          <p><strong>Sorting:</strong> Sort the partner list by organization size, timestamp, or name in ascending or descending order.</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">4. Advanced Search Features</h3>
          <p><strong>Voice Search:</strong> Click the microphone icon next to the search bar to use voice commands for searching.</p>
          <p><strong>Autocomplete:</strong> As you type in the search bar, the system will suggest matching partner names or business types.</p>
          <p><strong>Tag-based Search:</strong> Search for partners using tags associated with their profiles.</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">5. Admin Mode</h3>
          <p><strong>Enabling Admin Mode:</strong> Toggle the admin mode switch and enter your admin credentials.</p>
          <p><strong>Admin Functions:</strong> In admin mode, you can add new partners, edit existing partner information, and delete partner profiles.</p>
          <div className="flex items-center mt-2">
            <input type="checkbox" id="adminMode" checked={adminMode} onChange={toggleAdminMode} className="form-checkbox h-5 w-5 text-blue-500"/>
            <label htmlFor="adminMode" className="ml-2">Enable Admin Mode</label>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">6. Data Export and Reporting</h3>
          <p><strong>JSON Export:</strong> Export the current filtered list of partners as a JSON file for further analysis or backup.</p>
          <p><strong>PDF Report:</strong> Generate a PDF report of the current partner list, including all or selected fields.</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">7. Data Visualization</h3>
          <p><strong>Charts and Graphs:</strong> Access visual representations of partner data, such as distribution by industry sector or organization size.</p>
          <p><strong>Interactive Visualizations:</strong> Interact with the charts to filter data directly from the visualization interface.</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">8. Managing Partner Information</h3>
          <p><strong>Adding a New Partner:</strong> In admin mode, click the "Add New Partner" button and fill in the required information.</p>
          <p><strong>Editing Partner Information:</strong> Open a partner's detailed view and click the edit icon to modify their information.</p>
          <p><strong>Deleting a Partner:</strong> In admin mode, you can delete a partner's profile from their detailed view or the main list.</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">9. Troubleshooting</h3>
          <p><strong>Loading Issues:</strong> If the partner list doesn't load, check your internet connection and refresh the page.</p>
          <p><strong>Search Not Working:</strong> Clear all filters and try your search again. Ensure you're not in admin mode if you're having issues.</p>
          <p><strong>Export Failures:</strong> If exports fail, check your browser's download settings and try again.</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">10. Best Practices</h3>
          <p><strong>Regular Updates:</strong> Keep partner information up-to-date for the most effective use of the system.</p>
          <p><strong>Use Tags:</strong> Utilize tags to categorize partners for easier searching and filtering.</p>
          <p><strong>Backup Data:</strong> Regularly export your data as a JSON file for backup purposes.</p>
          <p><strong>Respect Privacy:</strong> Only share partner information with authorized personnel within your organization.</p>
        </div>

        <p className="text-sm text-gray-600">Remember, this system is designed to help you manage your business and community partnerships effectively. By keeping the information current and utilizing the various features, you can maximize the benefits of these partnerships for your Career and Technical Education programs.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
  <div className="bg-slate-100 rounded-2xl  hover:shadow-lg transition-shadow duration-300 p-6">
    <h3 className="text-xl font-semibold text-gray-800 mb-3">Dashboard</h3>
    <p className="text-gray-600">
      Get a comprehensive overview of all your business partners. View key metrics, recent activities, and quick access to partner information.
    </p>
    <a href="/" className="text-blue-500 hover:text-blue-700 mt-4 inline-block">Explore Dashboard</a>
  </div>

  <div className="bg-slate-100 rounded-2xl  hover:shadow-lg transition-shadow duration-300 p-6">
    <h3 className="text-xl font-semibold text-gray-800 mb-3">Graphs</h3>
    <p className="text-gray-600">
      Visualize your partner data with interactive charts and graphs. Analyze trends, compare sectors, and gain valuable insights.
    </p>
    <a href="graph" className="text-blue-500 hover:text-blue-700 mt-4 inline-block">View Graphs</a>
  </div>

  <div className="bg-slate-100 rounded-2xl  hover:shadow-lg transition-shadow duration-300 p-6">
    <h3 className="text-xl font-semibold text-gray-800 mb-3">Map</h3>
    <p className="text-gray-600">
      Explore the geographical distribution of your partners. Identify regional clusters and potential areas for expansion.
    </p>
    <a href="/map" className="text-blue-500 hover:text-blue-700 mt-4 inline-block">Open Map</a>
  </div>

  <div className="bg-slate-100 rounded-2xl  hover:shadow-lg transition-shadow duration-300 p-6">
    <h3 className="text-xl font-semibold text-gray-800 mb-3">Q&A AI Chatbot</h3>
    <p className="text-gray-600">
      Get instant answers to your questions about partners or the system. Our AI-powered chatbot is here to assist you 24/7.
    </p>
    <a href="/ai" className="text-blue-500 hover:text-blue-700 mt-4 inline-block">Chat Now</a>
  </div>

  <div className="bg-slate-100 rounded-2xl  hover:shadow-lg transition-shadow duration-300 p-6">
    <h3 className="text-xl font-semibold text-gray-800 mb-3">Instructions/Guide</h3>
    <p className="text-gray-600">
      New to the system? Check out our comprehensive guide to learn how to make the most of all features and functionalities.
    </p>
    <a href="#" className="text-blue-500 hover:text-blue-700 mt-4 inline-block">Read Guide (this page)</a>
  </div>
</div>

    </div>
  );
};

export default Help;
