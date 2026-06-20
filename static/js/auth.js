$(document).ready(function() {
    // Toggle between login and register forms
    $('.show-register').on('click', function(e) {
        e.preventDefault();
        const loginForm = $('#loginForm');
        const registerForm = $('#registerForm');
        
        loginForm.addClass('slide-out-left');
        setTimeout(() => {
            loginForm.addClass('hidden').removeClass('slide-out-left');
            registerForm.removeClass('hidden').addClass('slide-in-right');
            setTimeout(() => {
                registerForm.removeClass('slide-in-right');
            }, 500);
        }, 500);
    });

    $('.show-login').on('click', function(e) {
        e.preventDefault();
        const loginForm = $('#loginForm');
        const registerForm = $('#registerForm');
        const forgotForm = $('#forgotPasswordForm');
        const verifyForm = $('#verifyOtpForm');
        const resetForm = $('#resetPasswordForm');
        
        registerForm.addClass('slide-out-left');
        forgotForm.addClass('slide-out-left');
        verifyForm.addClass('slide-out-left');
        resetForm.addClass('slide-out-left');
        setTimeout(() => {
            registerForm.addClass('hidden').removeClass('slide-out-left');
            forgotForm.addClass('hidden').removeClass('slide-out-left');
            verifyForm.addClass('hidden').removeClass('slide-out-left');
            resetForm.addClass('hidden').removeClass('slide-out-left');
            loginForm.removeClass('hidden').addClass('slide-in-right');
            setTimeout(() => {
                loginForm.removeClass('slide-in-right');
            }, 500);
        }, 500);
    });

    $('.show-forgot').on('click', function(e) {
        e.preventDefault();
        const loginForm = $('#loginForm');
        const forgotForm = $('#forgotPasswordForm');
        
        loginForm.addClass('slide-out-left');
        setTimeout(() => {
            loginForm.addClass('hidden').removeClass('slide-out-left');
            forgotForm.removeClass('hidden').addClass('slide-in-right');
            setTimeout(() => {
                forgotForm.removeClass('slide-in-right');
            }, 500);
        }, 500);
    });

    // Password toggle functionality
    $('.password-toggle').on('click', function() {
        const targetId = $(this).data('target');
        const input = $('#' + targetId);
        const icon = $(this);

        if (input.attr('type') === 'password') {
            input.attr('type', 'text');
            icon.removeClass('fa-eye').addClass('fa-eye-slash');
        } else {
            input.attr('type', 'password');
            icon.removeClass('fa-eye-slash').addClass('fa-eye');
        }
    });

    // Floating label animation
    $('.input-group input').on('focus blur', function(e) {
        $(this).parent().toggleClass('focused', e.type === 'focus');
    });

    // Check if input has value
    $('.input-group input').on('input', function() {
        if ($(this).val().trim() !== '') {
            $(this).addClass('has-value');
        } else {
            $(this).removeClass('has-value');
        }
    });

    // Animate features on load
    $('.feature').each(function(index) {
        $(this).css({
            'opacity': '0',
            'transform': 'translateX(30px)'
        });
        $(this).delay(200 * index).animate({
            'opacity': '1'
        }, 500);
        setTimeout(() => {
            $(this).css('transform', 'translateX(0)');
        }, 200 * index);
    });

    // Login form validation
    $('#loginForm form').on('submit', function(e) {
        const email = $('#login-email').val().trim();
        const password = $('#login-password').val().trim();

        if (!email || !password) {
            e.preventDefault();
            
            if (!email) {
                $('.input-group').has('#login-email').addClass('shake');
                setTimeout(() => {
                    $('.input-group').has('#login-email').removeClass('shake');
                }, 500);
            }
            
            if (!password) {
                $('.input-group').has('#login-password').addClass('shake');
                setTimeout(() => {
                    $('.input-group').has('#login-password').removeClass('shake');
                }, 500);
            }

            alert('Please fill in all fields!');
            return false;
        }

        $('#loginForm .btn-submit').html('<i class="fas fa-spinner fa-spin"></i> Logging in...');
    });

    // Register form validation
    $('#registerForm form').on('submit', function(e) {
        const password = $('#register-password').val();
        const confirmPassword = $('#confirm_password').val();

        if (password !== confirmPassword) {
            e.preventDefault();
            
            $('.input-group').has('#confirm_password').addClass('shake');
            setTimeout(() => {
                $('.input-group').has('#confirm_password').removeClass('shake');
            }, 500);

            alert('Passwords do not match!');
            return false;
        }

        $('#registerForm .btn-submit').html('<i class="fas fa-spinner fa-spin"></i> Processing...');
    });

    // Forgot password form validation
    $('#forgotPasswordEmailForm').on('submit', function(e) {
        e.preventDefault();
        const email = $('#forgot-email').val().trim();

        if (!email) {
            $('.input-group').has('#forgot-email').addClass('shake');
            setTimeout(() => {
                $('.input-group').has('#forgot-email').removeClass('shake');
            }, 500);
            alert('Please enter your email address!');
            return false;
        }

        $('#forgotPasswordForm .btn-submit').html('<i class="fas fa-spinner fa-spin"></i> Sending...');

        $.ajax({
            url: '/forgot-password',
            method: 'POST',
            data: { email: email },
            success: function(response) {
                $('#forgotPasswordForm').addClass('slide-out-left');
                setTimeout(() => {
                    $('#forgotPasswordForm').addClass('hidden').removeClass('slide-out-left');
                    $('#verifyOtpForm').removeClass('hidden').addClass('slide-in-right');
                    setTimeout(() => {
                        $('#verifyOtpForm').removeClass('slide-in-right');
                    }, 500);
                }, 500);
                $('#forgotPasswordForm .btn-submit').html('Send OTP');
            },
            error: function(xhr) {
                alert(xhr.responseJSON?.message || 'Error sending OTP');
                $('#forgotPasswordForm .btn-submit').html('Send OTP');
            }
        });
    });

    // Verify OTP form
    $('#verifyOtpCodeForm').on('submit', function(e) {
        e.preventDefault();
        const otp = $('#otp-code').val().trim();
        const email = $('#forgot-email').val().trim();

        if (!otp) {
            $('.input-group').has('#otp-code').addClass('shake');
            setTimeout(() => {
                $('.input-group').has('#otp-code').removeClass('shake');
            }, 500);
            alert('Please enter OTP!');
            return false;
        }

        $('#verifyOtpForm .btn-submit').html('<i class="fas fa-spinner fa-spin"></i> Verifying...');

        $.ajax({
            url: '/verify-otp',
            method: 'POST',
            data: { email: email, otp: otp },
            success: function(response) {
                $('#verifyOtpForm').addClass('slide-out-left');
                setTimeout(() => {
                    $('#verifyOtpForm').addClass('hidden').removeClass('slide-out-left');
                    $('#resetPasswordForm').removeClass('hidden').addClass('slide-in-right');
                    setTimeout(() => {
                        $('#resetPasswordForm').removeClass('slide-in-right');
                    }, 500);
                }, 500);
                $('#verifyOtpForm .btn-submit').html('Verify OTP');
            },
            error: function(xhr) {
                alert(xhr.responseJSON?.message || 'Invalid OTP');
                $('#verifyOtpForm .btn-submit').html('Verify OTP');
            }
        });
    });

    // Reset password form
    $('#resetPasswordNewForm').on('submit', function(e) {
        e.preventDefault();
        const password = $('#new-password').val();
        const confirmPassword = $('#confirm-new-password').val();
        const email = $('#forgot-email').val().trim();

        if (password !== confirmPassword) {
            $('.input-group').has('#confirm-new-password').addClass('shake');
            setTimeout(() => {
                $('.input-group').has('#confirm-new-password').removeClass('shake');
            }, 500);
            alert('Passwords do not match!');
            return false;
        }

        $('#resetPasswordForm .btn-submit').html('<i class="fas fa-spinner fa-spin"></i> Resetting...');

        $.ajax({
            url: '/reset-password',
            method: 'POST',
            data: { email: email, password: password },
            success: function(response) {
                alert('Password reset successful! Please login.');
                $('#resetPasswordForm').addClass('slide-out-left');
                setTimeout(() => {
                    $('#resetPasswordForm').addClass('hidden').removeClass('slide-out-left');
                    $('#loginForm').removeClass('hidden').addClass('slide-in-right');
                    setTimeout(() => {
                        $('#loginForm').removeClass('slide-in-right');
                    }, 500);
                }, 500);
                $('#resetPasswordForm .btn-submit').html('Reset Password');
            },
            error: function(xhr) {
                alert(xhr.responseJSON?.message || 'Error resetting password');
                $('#resetPasswordForm .btn-submit').html('Reset Password');
            }
        });
    });

    // Input focus animation
    $('.input-group input').on('focus', function() {
        $(this).parent().addClass('input-focused');
    });

    $('.input-group input').on('blur', function() {
        $(this).parent().removeClass('input-focused');
    });

    // Check for pre-filled values on page load
    $('.input-group input').each(function() {
        if ($(this).val().trim() !== '') {
            $(this).addClass('has-value');
        }
    });
});
