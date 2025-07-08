// Loan Management System - Main JavaScript File

// Global Application Object
const LoanApp = {
    // Configuration
    config: {
        dateFormat: 'DD-MM-YYYY',
        currencySymbol: '₹',
        decimalPlaces: 2,
        tablePageLength: 10
    },
    
    // Utility Functions
    utils: {
        // Format currency
        formatCurrency: function(amount) {
            if (amount === null || amount === undefined || amount === '') {
                return '-';
            }
            const formatted = parseFloat(amount).toLocaleString('en-IN', {
                minimumFractionDigits: LoanApp.config.decimalPlaces,
                maximumFractionDigits: LoanApp.config.decimalPlaces
            });
            return LoanApp.config.currencySymbol + formatted;
        },
        
        // Format date
        formatDate: function(date) {
            if (!date) return '-';
            return new Date(date).toLocaleDateString('en-IN');
        },
        
        // Calculate days between dates
        daysBetween: function(date1, date2) {
            const oneDay = 24 * 60 * 60 * 1000;
            const firstDate = new Date(date1);
            const secondDate = new Date(date2);
            return Math.round(Math.abs((firstDate - secondDate) / oneDay));
        },
        
        // Show loading overlay
        showLoading: function() {
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border loading-spinner" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3 text-light">Processing...</p>
                </div>
            `;
            document.body.appendChild(overlay);
        },
        
        // Hide loading overlay
        hideLoading: function() {
            const overlay = document.querySelector('.loading-overlay');
            if (overlay) {
                overlay.remove();
            }
        },
        
        // Show toast notification
        showToast: function(message, type = 'success') {
            const toast = document.createElement('div');
            toast.className = `toast align-items-center text-white bg-${type} border-0`;
            toast.setAttribute('role', 'alert');
            toast.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            `;
            
            // Add to toast container or create one
            let container = document.querySelector('.toast-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'toast-container position-fixed top-0 end-0 p-3';
                document.body.appendChild(container);
            }
            
            container.appendChild(toast);
            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();
            
            // Remove toast after it's hidden
            toast.addEventListener('hidden.bs.toast', function() {
                toast.remove();
            });
        },
        
        // Confirm action
        confirmAction: function(message, callback) {
            if (confirm(message)) {
                callback();
            }
        },
        
        // Validate form
        validateForm: function(formId) {
            const form = document.getElementById(formId);
            if (!form) return false;
            
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('is-invalid');
                    isValid = false;
                } else {
                    input.classList.remove('is-invalid');
                }
            });
            
            return isValid;
        }
    },
    
    // Interest Calculation Functions
    calculations: {
        // Calculate simple interest
        simpleInterest: function(principal, rate, days) {
            if (!principal || !rate || !days) return 0;
            return (principal * rate * days) / (100 * 365);
        },
        
        // Calculate compound interest
        compoundInterest: function(principal, rate, days, frequency = 'yearly') {
            if (!principal || !rate || !days) return 0;
            
            let n = 1; // Default yearly
            switch (frequency.toLowerCase()) {
                case 'monthly':
                    n = 12;
                    break;
                case 'quarterly':
                    n = 4;
                    break;
                case 'yearly':
                    n = 1;
                    break;
            }
            
            const t = days / 365;
            const amount = principal * Math.pow((1 + rate / (100 * n)), n * t);
            return amount - principal;
        },
        
        // Calculate TDS
        calculateTDS: function(interestAmount, tdsRate = 10) {
            if (!interestAmount || !tdsRate) return 0;
            return (interestAmount * tdsRate) / 100;
        },
        
        // Calculate net amount
        calculateNetAmount: function(interestAmount, tdsAmount) {
            return interestAmount - tdsAmount;
        }
    },
    
    // DataTable initialization
    tables: {
        init: function() {
            // Initialize all DataTables
            $('.table').each(function() {
                const tableId = $(this).attr('id');
                if (tableId && !$.fn.DataTable.isDataTable('#' + tableId)) {
                    LoanApp.tables.initTable(tableId);
                }
            });
        },
        
        initTable: function(tableId) {
            const table = $('#' + tableId);
            if (table.length === 0) return;
            
            const config = {
                responsive: true,
                pageLength: LoanApp.config.tablePageLength,
                language: {
                    search: "Search records:",
                    lengthMenu: "Show _MENU_ records per page",
                    info: "Showing _START_ to _END_ of _TOTAL_ records",
                    paginate: {
                        first: "First",
                        last: "Last",
                        next: "Next",
                        previous: "Previous"
                    }
                },
                dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>' +
                     '<"row"<"col-sm-12"tr>>' +
                     '<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
                order: [[0, 'asc']]
            };
            
            // Table-specific configurations
            if (tableId === 'transactionsTable') {
                config.order = [[0, 'desc']]; // Sort by date descending
                config.columnDefs = [
                    {
                        targets: [1, 2, 3, 8, 9, 10], // Amount columns
                        render: function(data, type, row) {
                            if (type === 'display' && data) {
                                return LoanApp.utils.formatCurrency(data);
                            }
                            return data;
                        }
                    }
                ];
            }
            
            if (tableId === 'customersTable') {
                config.columnDefs = [
                    {
                        targets: [4], // Balance column
                        render: function(data, type, row) {
                            if (type === 'display' && data) {
                                return LoanApp.utils.formatCurrency(data);
                            }
                            return data;
                        }
                    }
                ];
            }
            
            table.DataTable(config);
        }
    },
    
    // Form handling
    forms: {
        init: function() {
            // Initialize form validations
            $('form').on('submit', function(e) {
                const form = $(this);
                if (!LoanApp.forms.validateForm(form)) {
                    e.preventDefault();
                    return false;
                }
            });
            
            // Initialize date inputs
            LoanApp.forms.initDateInputs();
            
            // Initialize number inputs
            LoanApp.forms.initNumberInputs();
        },
        
        validateForm: function(form) {
            let isValid = true;
            
            // Check required fields
            form.find('input[required], select[required], textarea[required]').each(function() {
                const input = $(this);
                if (!input.val().trim()) {
                    input.addClass('is-invalid');
                    isValid = false;
                } else {
                    input.removeClass('is-invalid');
                }
            });
            
            // Validate email fields
            form.find('input[type="email"]').each(function() {
                const input = $(this);
                const email = input.val().trim();
                if (email && !LoanApp.forms.isValidEmail(email)) {
                    input.addClass('is-invalid');
                    isValid = false;
                } else {
                    input.removeClass('is-invalid');
                }
            });
            
            return isValid;
        },
        
        isValidEmail: function(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        
        initDateInputs: function() {
            // Set max date to today for most date inputs
            const today = new Date().toISOString().split('T')[0];
            $('input[type="date"]').each(function() {
                const input = $(this);
                if (!input.attr('max') && input.attr('id') !== 'icl_end_date') {
                    input.attr('max', today);
                }
            });
        },
        
        initNumberInputs: function() {
            // Format number inputs on blur
            $('input[type="number"]').on('blur', function() {
                const input = $(this);
                const value = parseFloat(input.val());
                if (!isNaN(value) && input.attr('step') === '0.01') {
                    input.val(value.toFixed(2));
                }
            });
        }
    },
    
    // Customer-specific functions
    customer: {
        init: function() {
            // Initialize customer form handlers
            $('#interest_type').on('change', LoanApp.customer.toggleCompoundFields);
            $('#period_from, #period_to').on('change', LoanApp.customer.calculatePeriodDays);
            $('#amount_paid, #amount_repaid').on('input', LoanApp.customer.calculateBalance);
            
            // Initialize on page load
            LoanApp.customer.toggleCompoundFields();
        },
        
        toggleCompoundFields: function() {
            const interestType = $('#interest_type').val();
            const compoundDiv = $('#compound_frequency_div');
            const firstCompoundDiv = $('#first_compounding_div');
            
            if (interestType === 'compound') {
                compoundDiv.show();
                firstCompoundDiv.show();
            } else {
                compoundDiv.hide();
                firstCompoundDiv.hide();
            }
        },
        
        calculatePeriodDays: function() {
            const fromDate = $('#period_from').val();
            const toDate = $('#period_to').val();
            
            if (fromDate && toDate) {
                const days = LoanApp.utils.daysBetween(fromDate, toDate);
                $('#calculated_days').val(days);
                
                // Calculate interest if we have the necessary data
                LoanApp.customer.calculateInterest(days);
            } else {
                $('#calculated_days').val('');
                $('#calculated_interest').val('');
            }
        },
        
        calculateBalance: function() {
            const currentBalance = parseFloat($('#current_balance').data('value')) || 0;
            const amountPaid = parseFloat($('#amount_paid').val()) || 0;
            const amountRepaid = parseFloat($('#amount_repaid').val()) || 0;
            
            const newBalance = currentBalance + amountPaid - amountRepaid;
            $('#calculated_balance').val(LoanApp.utils.formatCurrency(newBalance));
        },
        
        calculateInterest: function(days) {
            const principal = parseFloat($('#current_balance').data('value')) || 0;
            const rate = parseFloat($('#interest_rate').data('value')) || 0;
            const interestType = $('#interest_type').data('value') || 'simple';
            const frequency = $('#compound_frequency').data('value') || 'yearly';
            
            if (days > 0 && principal > 0 && rate > 0) {
                let interest = 0;
                
                if (interestType === 'simple') {
                    interest = LoanApp.calculations.simpleInterest(principal, rate, days);
                } else {
                    interest = LoanApp.calculations.compoundInterest(principal, rate, days, frequency);
                }
                
                $('#calculated_interest').val(LoanApp.utils.formatCurrency(interest));
            }
        }
    },
    
    // Admin panel functions
    admin: {
        init: function() {
            // Initialize admin-specific handlers
            $('#createUserForm').on('submit', LoanApp.admin.handleUserCreation);
            $('#interestRateForm').on('submit', LoanApp.admin.handleRateUpdate);
            $('#tdsRateForm').on('submit', LoanApp.admin.handleTDSUpdate);
        },
        
        handleUserCreation: function(e) {
            e.preventDefault();
            
            if (!LoanApp.forms.validateForm($(this))) {
                LoanApp.utils.showToast('Please fill in all required fields', 'danger');
                return;
            }
            
            LoanApp.utils.showLoading();
            // Form will be submitted normally after validation
            setTimeout(() => {
                this.submit();
            }, 500);
        },
        
        handleRateUpdate: function(e) {
            e.preventDefault();
            
            if (!LoanApp.forms.validateForm($(this))) {
                LoanApp.utils.showToast('Please fill in all required fields', 'danger');
                return;
            }
            
            LoanApp.utils.confirmAction('Are you sure you want to update the interest rate? This will affect all new calculations.', () => {
                LoanApp.utils.showLoading();
                setTimeout(() => {
                    this.submit();
                }, 500);
            });
        },
        
        handleTDSUpdate: function(e) {
            e.preventDefault();
            
            if (!LoanApp.forms.validateForm($(this))) {
                LoanApp.utils.showToast('Please fill in all required fields', 'danger');
                return;
            }
            
            LoanApp.utils.confirmAction('Are you sure you want to update the TDS rate? This will affect all new calculations.', () => {
                LoanApp.utils.showLoading();
                setTimeout(() => {
                    this.submit();
                }, 500);
            });
        }
    },
    
    // Reports functions
    reports: {
        init: function() {
            // Initialize report handlers
            $('#generateReportBtn').on('click', LoanApp.reports.generateReport);
            $('#exportReportBtn').on('click', LoanApp.reports.exportReport);
        },
        
        generateReport: function() {
            const startDate = $('#start_date').val();
            const endDate = $('#end_date').val();
            
            if (!startDate || !endDate) {
                LoanApp.utils.showToast('Please select both start and end dates', 'warning');
                return;
            }
            
            if (new Date(startDate) > new Date(endDate)) {
                LoanApp.utils.showToast('Start date cannot be later than end date', 'danger');
                return;
            }
            
            LoanApp.utils.showLoading();
            // Simulate report generation
            setTimeout(() => {
                LoanApp.utils.hideLoading();
                LoanApp.utils.showToast('Report generated successfully', 'success');
            }, 2000);
        },
        
        exportReport: function() {
            LoanApp.utils.showLoading();
            // Export will be handled by the backend
            setTimeout(() => {
                LoanApp.utils.hideLoading();
                LoanApp.utils.showToast('Report exported successfully', 'success');
            }, 1000);
        }
    },
    
    // Animation functions
    animations: {
        init: function() {
            // Add fade-in animation to cards
            $('.card').addClass('fade-in');
            
            // Add slide-up animation to rows
            $('.table tbody tr').addClass('slide-up');
            
            // Animate numbers
            LoanApp.animations.animateNumbers();
        },
        
        animateNumbers: function() {
            $('.dashboard-stat-number').each(function() {
                const element = $(this);
                const finalValue = element.text().replace(/[^0-9.-]+/g, '');
                if (finalValue) {
                    element.text('0');
                    LoanApp.animations.countUp(element, parseInt(finalValue));
                }
            });
        },
        
        countUp: function(element, target) {
            const increment = target / 50;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.text(target.toLocaleString());
                    clearInterval(timer);
                } else {
                    element.text(Math.floor(current).toLocaleString());
                }
            }, 30);
        }
    }
};

// Initialize application when DOM is ready
$(document).ready(function() {
    // Initialize core components
    LoanApp.tables.init();
    LoanApp.forms.init();
    LoanApp.customer.init();
    LoanApp.admin.init();
    LoanApp.reports.init();
    LoanApp.animations.init();
    
    // Initialize tooltips
    $('[data-bs-toggle="tooltip"]').tooltip();
    
    // Initialize popovers
    $('[data-bs-toggle="popover"]').popover();
    
    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        $('.alert').fadeOut();
    }, 5000);
    
    // Handle delete confirmations
    $('a[onclick*="confirm"]').on('click', function(e) {
        e.preventDefault();
        const href = $(this).attr('href');
        const message = $(this).attr('onclick').match(/'([^']+)'/)[1];
        
        LoanApp.utils.confirmAction(message, function() {
            window.location.href = href;
        });
    });
    
    // Handle form resets
    $('button[type="reset"]').on('click', function() {
        const form = $(this).closest('form');
        form.find('.is-invalid').removeClass('is-invalid');
    });
    
    // Handle modal cleanup
    $('.modal').on('hidden.bs.modal', function() {
        $(this).find('form')[0]?.reset();
        $(this).find('.is-invalid').removeClass('is-invalid');
    });
    
    // Initialize search functionality
    if ($('#searchInput').length) {
        $('#searchInput').on('input', function() {
            const searchTerm = $(this).val().toLowerCase();
            $('.searchable-row').each(function() {
                const text = $(this).text().toLowerCase();
                $(this).toggle(text.indexOf(searchTerm) > -1);
            });
        });
    }
    
    // Handle print functionality
    $('.print-btn').on('click', function() {
        window.print();
    });
    
    // Handle back button
    $('.back-btn').on('click', function() {
        history.back();
    });
    
    // Initialize keyboard shortcuts
    $(document).keydown(function(e) {
        // Ctrl+S to save forms
        if (e.ctrlKey && e.which === 83) {
            e.preventDefault();
            $('form:visible').first().submit();
        }
        
        // Escape to close modals
        if (e.which === 27) {
            $('.modal:visible').modal('hide');
        }
    });
});

// Global error handler
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    LoanApp.utils.showToast('An error occurred. Please try again.', 'danger');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled Promise Rejection:', e.reason);
    LoanApp.utils.showToast('An error occurred. Please try again.', 'danger');
});
