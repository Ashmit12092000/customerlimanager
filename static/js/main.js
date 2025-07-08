// static/js/main.js
document.addEventListener('DOMContentLoaded', function() {
    const customerListContainer = document.getElementById('customer-list-container');
    // USER_ROLE is now passed from Flask template

    async function fetchCustomers() {
        try {
            const response = await fetch('/api/customers');
            if (!response.ok) {
                // If not logged in, Flask will redirect to login page.
                // For API calls, it might return a 401 or 403.
                // We'll rely on Flask's redirect for page loads.
                // For API, just show an error.
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const customers = await response.json();
            renderCustomerList(customers);
        } catch (error) {
            console.error('Error fetching customers:', error);
            customerListContainer.innerHTML = '<p class="text-red-500">Failed to load customers. Please ensure you are logged in.</p>';
        }
    }

    function renderCustomerList(customers) {
        if (customers.length === 0) {
            customerListContainer.innerHTML = '<p class="text-gray-500">No customers added yet. Click "Add New Customer" to get started.</p>';
            return;
        }

        let tableHtml = `
            <table class="min-w-full bg-white rounded-lg shadow-md">
                <thead class="bg-indigo-50 border-b border-indigo-200">
                    <tr>
                        <th class="py-3 px-4 text-left text-sm font-medium text-gray-700">ICL No</th>
                        <th class="py-3 px-4 text-left text-sm font-medium text-gray-700">Customer Name</th>
                        <th class="py-3 px-4 text-left text-sm font-medium text-gray-700">Interest Rate</th>
                        <th class="py-3 px-4 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        customers.forEach(customer => {
            tableHtml += `
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                    <td class="py-3 px-4 text-sm text-gray-800">${customer.iclNo}</td>
                    <td class="py-3 px-4 text-sm text-gray-800">${customer.customerName}</td>
                    <td class="py-3 px-4 text-sm text-gray-800">${customer.annualRate}%</td>
                    <td class="py-3 px-4">
                        <a href="/customer_detail_page/${customer.id}" class="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition duration-200">
                            View Details
                        </a>
                    </td>
                </tr>
            `;
        });

        tableHtml += `
                </tbody>
            </table>
        `;
        customerListContainer.innerHTML = tableHtml;
    }

    fetchCustomers();
});
