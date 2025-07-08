// static/js/add_customer.js
document.addEventListener('DOMContentLoaded', function() {
    const addCustomerForm = document.getElementById('add-customer-form');
    const interestTypeSelect = document.getElementById('interestType');
    const compoundOptionsDiv = document.getElementById('compound-options');

    // Function to toggle visibility of compounding options
    function toggleCompoundOptions() {
        if (interestTypeSelect.value === 'Compound') {
            compoundOptionsDiv.classList.remove('hidden');
        } else {
            compoundOptionsDiv.classList.add('hidden');
        }
    }

    // Initial call to set visibility based on default value
    toggleCompoundOptions();

    // Event listener for interest type change
    interestTypeSelect.addEventListener('change', toggleCompoundOptions);

    addCustomerForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission

        const formData = new FormData(addCustomerForm);
        const customerData = {};
        for (const [key, value] of formData.entries()) {
            if (key === 'tdsApplicable') {
                customerData[key] = true; // Checkbox is present if checked
            } else if (key === 'annualRate') {
                customerData[key] = parseFloat(value);
            } else if (key === 'firstCompoundingDate' && value === '') {
                customerData[key] = null; // Store empty date as null
            } else {
                customerData[key] = value;
            }
        }
        // Handle unchecked checkbox explicitly
        if (!formData.has('tdsApplicable')) {
            customerData['tdsApplicable'] = false;
        }

        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customerData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Customer added:', result);
            window.location.href = '/'; // Redirect to customer list on success
        } catch (error) {
            console.error('Error adding customer:', error);
            alert('Failed to add customer: ' + error.message); // Use alert for simplicity, consider custom modal
        }
    });
});
