document.addEventListener('DOMContentLoaded', function() {
    // Predefined credentials
    const predefinedEmail = 'admin@example.com';
    const predefinedPassword = 'password123';

    // Handle sign in form submission
    const signinForm = document.getElementById('signinForm');
    if (signinForm) {
        signinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Simple validation
            if (!email || !password) {
                alert('Please fill in all fields!');
                return;
            }

            // Check against predefined credentials
            if (email === predefinedEmail && password === predefinedPassword) {
                alert('Sign in successful!');
                window.location.href = 'index.html'; // Redirect to homepage or dashboard
            } else {
                alert('Invalid email or password!');
            }
        });
    }

    // Handle social login buttons (optional)
    const googleBtn = document.querySelector('.btn-google');
    const linkedinBtn = document.querySelector('.btn-linkedin');

    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            alert('Google authentication would be implemented here!');
        });
    }

    if (linkedinBtn) {
        linkedinBtn.addEventListener('click', function() {
            alert('LinkedIn authentication would be implemented here!');
        });
    }

    // Handle forgot password link
    const forgotPassword = document.querySelector('.forgot-password a');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Password reset functionality would be implemented here!');
        });
    }
});
