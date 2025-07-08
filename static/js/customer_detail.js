// static/js/customer_detail.js
document.addEventListener('DOMContentLoaded', function() {
    // CUSTOMER_ID and USER_ROLE are globally available from the HTML script tag
    const customerId = CUSTOMER_ID;
    const userRole = USER_ROLE; // Get the user's role

    const customerNameDisplay = document.getElementById('customer-name-display');
    const customerDetailsContainer = document.getElementById('customer-details-container');
    const addTransactionForm = document.getElementById('add-transaction-form');
    const cumulativeTableContainer = document.getElementById('cumulative-table-container');

    // Function to fetch and display customer details
    async function fetchCustomerDetails() {
        try {
            const response = await fetch(`/api/customers/${customerId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const customer = await response.json();
            renderCustomerDetails(customer);
        } catch (error) {
            console.error('Error fetching customer details:', error);
            customerDetailsContainer.innerHTML = '<p class="text-red-500">Failed to load customer details.</p>';
        }
    }

    // Function to render customer details
    function renderCustomerDetails(customer) {
        customerNameDisplay.textContent = customer.customerName;
        customerDetailsContainer.innerHTML = `
            <p><strong>ICL No:</strong> ${customer.iclNo}</p>
            <p><strong>Address:</strong> ${customer.customerAddress || 'N/A'}</p>
            <p><strong>Contact:</strong> ${customer.contactDetails || 'N/A'}</p>
            <p><strong>Annual Rate:</strong> ${customer.annualRate}%</p>
            <p><strong>TDS Applicable:</strong> ${customer.tdsApplicable ? 'Yes' : 'No'}</p>
            <p><strong>Interest Type:</strong> ${customer.interestType}</p>
            ${customer.interestType === 'Compound' ? `
                <p><strong>Compound Frequency:</strong> ${customer.compoundFrequency || 'N/A'}</p>
                <p><strong>1st Compounding Date:</strong> ${customer.firstCompoundingDate || 'N/A'}</p>
            ` : ''}
        `;
    }

    // Function to fetch and display transactions and cumulative data
    async function fetchTransactionsAndCalculations() {
        try {
            const response = await fetch(`/api/customers/${customerId}/transactions`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json(); // Contains 'transactions' and 'calculatedPeriods'
            renderCumulativeTable(data.calculatedPeriods);
        } catch (error) {
            console.error('Error fetching transactions or calculations:', error);
            cumulativeTableContainer.innerHTML = '<p class="text-red-500">Failed to load transactions and calculations.</p>';
        }
    }

    // Function to render the cumulative table
    function renderCumulativeTable(calculatedPeriods) {
        if (calculatedPeriods.length === 0) {
            cumulativeTableContainer.innerHTML = '<p class="text-gray-500">No transactions recorded for this customer yet. Add a transaction above to see the calculation.</p>';
            return;
        }

        // Calculate totals for the summary row
        const totalIntAmount = calculatedPeriods.reduce((sum, p) => sum + parseFloat(p.intAmount), 0);
        const totalTds = calculatedPeriods.reduce((sum, p) => sum + parseFloat(p.tds), 0);
        const totalNetAmount = calculatedPeriods.reduce((sum, p) => sum + parseFloat(p.netAmount), 0);
        const totalDays = calculatedPeriods.reduce((sum, p) => sum + p.noOfDays, 0);

        let tableHtml = `
            <table class="min-w-full bg-white rounded-lg shadow-md">
                <thead class="bg-indigo-50 border-b border-indigo-200">
                    <tr>
                        <th class="py-3 px-4 text-left text-sm font-medium text-gray-700">Date</th>
                        <th class="py-3 px-4 text-left text-sm font-medium text-gray-700">Amount Paid</th>
                        <th class="py-3 px-4 text-left text-sm font-medium text-gray-700">Amount Repaid</th>
                        <th class="py-3 px-4 text-left text-sm font-medium text-gray-700">Balance</th>
                        <th class="py-3 px-4 text-left text-sm font-medium text-gray-700">From</th>
                        <th class="py-3 px-4 text-left text-sm font-medium text-gray-700">To</th>
                        <th class="py-3 px-4 text-left text-sm font-medium text-gray-700">No of days</th>
                        <th class="py-3 px-4 text-left text-sm font-medium text-gray-700">Int Rate (%)</th>
                        <th class="py-3 px-4 text-left text-sm font-medium text-gray-700">Int Amount</th>
                        <th class="py-3 px-4 text-left text-sm font-medium text-gray-700">TDS</th>
                        <th class="py-3 px-4 text-left text-sm font-medium text-gray-700">Net Amount</th>
                    </tr>
                </thead>
                <tbody>
        `;

        calculatedPeriods.forEach(period => {
            tableHtml += `
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                    <td class="py-3 px-4 text-sm text-gray-800">${period.date}</td>
                    <td class="py-3 px-4 text-sm text-gray-800">${period.amountPaid}</td>
                    <td class="py-3 px-4 text-sm text-gray-800">${period.amountRepaid}</td>
                    <td class="py-3 px-4 text-sm text-gray-800">${period.balance}</td>
                    <td class="py-3 px-4 text-sm text-gray-800">${period.from}</td>
                    <td class="py-3 px-4 text-sm text-gray-800">${period.to}</td>
                    <td class="py-3 px-4 text-sm text-gray-800">${period.noOfDays}</td>
                    <td class="py-3 px-4 text-sm text-gray-800">${period.intRate}</td>
                    <td class="py-3 px-4 text-sm text-gray-800">${period.intAmount}</td>
                    <td class="py-3 px-4 text-sm text-gray-800">${period.tds}</td>
                    <td class="py-3 px-4 text-sm text-gray-800">${period.netAmount}</td>
                </tr>
            `;
        });

        tableHtml += `
                </tbody>
                <tfoot>
                    <tr class="bg-indigo-100 font-bold">
                        <td colSpan="7" class="py-3 px-4 text-right text-sm text-gray-800">Total:</td>
                        <td class="py-3 px-4 text-sm text-gray-800">${totalDays} days</td>
                        <td class="py-3 px-4 text-sm text-gray-800">${totalIntAmount.toFixed(2)}</td>
                        <td class="py-3 px-4 text-sm text-gray-800">${totalTds.toFixed(2)}</td>
                        <td class="py-3 px-4 text-sm text-gray-800">${totalNetAmount.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
        `;
        cumulativeTableContainer.innerHTML = tableHtml;
    }

    // Event listener for adding a new transaction
    // Only attach if the user has appropriate role
    if (userRole === 'admin' || userRole === 'deo') {
        addTransactionForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const formData = new FormData(addTransactionForm);
            const transactionData = {
                date: formData.get('transactionDate'),
                amountPaid: formData.get('amountPaid') ? parseFloat(formData.get('amountPaid')) : 0,
                amountRepaid: formData.get('amountRepaid') ? parseFloat(formData.get('amountRepaid')) : 0,
            };

            // Basic validation
            if (!transactionData.date || (transactionData.amountPaid === 0 && transactionData.amountRepaid === 0)) {
                alert('Please enter a date and at least one amount (Paid or Repaid).');
                return;
            }

            try {
                const response = await fetch(`/api/customers/${customerId}/transactions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(transactionData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Transaction added:', result);
                // Clear form fields
                addTransactionForm.reset();
                // Re-fetch and re-render data after adding transaction
                fetchTransactionsAndCalculations();
            } catch (error) {
                console.error('Error adding transaction:', error);
                alert('Failed to add transaction: ' + error.message); // Consider custom modal
            }
        });
    }


    // Initial data load on page load
    fetchCustomerDetails();
    fetchTransactionsAndCalculations();
});
