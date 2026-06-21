$(document).ready(function () {
    // Flash message function
    function showFlashMessage(message, type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };

        const flashHtml = `
            <div class="flash-message ${type}">
                <i class="fas ${icons[type]}"></i>
                <span>${message}</span>
                <i class="fas fa-times close-flash"></i>
            </div>
        `;

        const $flash = $(flashHtml);
        $('#flash-container').append($flash);

        $flash.find('.close-flash').on('click', function () {
            $(this).parent().css('animation', 'slideOutUp 0.3s forwards');
            setTimeout(() => {
                $(this).parent().remove();
            }, 300);
        });

        setTimeout(() => {
            $flash.css('animation', 'slideOutUp 0.3s forwards');
            setTimeout(() => {
                $flash.remove();
            }, 300);
        }, 4000);
    }

    // Toggle between login and register forms
    $('.show-register').on('click', function (e) {
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

    $('.show-login').on('click', function (e) {
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

    $('.show-forgot').on('click', function (e) {
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
    $('.password-toggle').on('click', function () {
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
    $('.input-group input, .input-group select').on('focus blur', function (e) {
        $(this).parent().toggleClass('focused', e.type === 'focus');
    });

    // Check if input has value
    $('.input-group input, .input-group select').on('input change', function () {
        if ($(this).val() && $(this).val().trim() !== '') {
            $(this).addClass('has-value');
        } else {
            $(this).removeClass('has-value');
        }
    });

    // Animate features on load
    $('.feature').each(function (index) {
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
    $('#loginForm form').on('submit', function (e) {
        e.preventDefault();
        const enrollment = $('#login-enrollment').val().trim();
        const password = $('#login-password').val().trim();

        if (!enrollment || !password) {
            if (!enrollment) {
                $('.input-group').has('#login-enrollment').addClass('shake');
                setTimeout(() => {
                    $('.input-group').has('#login-enrollment').removeClass('shake');
                }, 500);
            }
            if (!password) {
                $('.input-group').has('#login-password').addClass('shake');
                setTimeout(() => {
                    $('.input-group').has('#login-password').removeClass('shake');
                }, 500);
            }
            showFlashMessage('Please fill in all fields!', 'error');
            return false;
        }

        $('#loginForm .btn-submit').html('<i class="fas fa-spinner fa-spin"></i> Logging in...');

        $.ajax({
            url: '/login',
            method: 'POST',
            data: {
                enrollment: enrollment,
                password: password
            },
            success: function (response) {
                showFlashMessage('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = response.redirect;
                }, 1000);
            },
            error: function (xhr) {
                let response = xhr.responseJSON;

                showFlashMessage(
                    response?.message || 'Login failed!',
                    'error'
                );

                // Open Register Form Automatically
                if (response && response.show_register) {

                    // Clear login form
                    $('#loginForm form')[0].reset();

                    // Reset floating labels
                    $('#loginForm .input-group input').removeClass('has-value');
                    $('#loginForm .input-group').removeClass('focused input-focused');

                    $('#loginForm').addClass('hidden');
                    $('#forgotPasswordForm').addClass('hidden');
                    $('#verifyOtpForm').addClass('hidden');
                    $('#resetPasswordForm').addClass('hidden');

                    $('#registerForm').removeClass('hidden');
                }

                $('#loginForm .btn-submit').html('Login');
            }
        });
    });

    // Register form validation
    $('#registerForm form').on('submit', function (e) {
        e.preventDefault();
        const enrollment = $('#enrollment').val().trim();
        const email = $('#register-email').val().trim();
        const password = $('#register-password').val();
        const confirmPassword = $('#confirm_password').val();

        if (!enrollment || !email || !password || !confirmPassword) {
            alert('Please fill in all fields!');
            return false;
        }

        if (password !== confirmPassword) {
            $('.input-group').has('#confirm_password').addClass('shake');
            setTimeout(() => {
                $('.input-group').has('#confirm_password').removeClass('shake');
            }, 500);
            showFlashMessage('Passwords do not match!', 'error');
            return false;
        }

        $('#registerForm .btn-submit').html('<i class="fas fa-spinner fa-spin"></i> Processing...');

        $.ajax({
            url: '/register',
            method: 'POST',
            data: {
                enrollment: enrollment,
                email: email,
                password: password,
                confirm_password: confirmPassword
            },
            success: function (response) {
                showFlashMessage('Registration Successful! Please login.', 'success');
                $('#registerForm').addClass('slide-out-left');
                setTimeout(() => {
                    $('#registerForm').addClass('hidden').removeClass('slide-out-left');
                    $('#loginForm').removeClass('hidden').addClass('slide-in-right');
                    setTimeout(() => {
                        $('#loginForm').removeClass('slide-in-right');
                    }, 500);
                }, 500);
                $('#registerForm .btn-submit').html('Register');
                $('#registerForm form')[0].reset();
            },
            error: function (xhr) {
                let response = xhr.responseJSON;

                showFlashMessage(
                    response?.message || 'Registration failed!',
                    'error'
                );

                // If account already exists
                if (response && response.show_login) {

                    $('#registerForm form')[0].reset();
                    $('#registerForm .input-group input').removeClass('has-value');
                    $('#registerForm .input-group').removeClass('focused');

                    $('#registerForm').addClass('slide-out-left');

                    setTimeout(() => {

                        $('#registerForm')
                            .addClass('hidden')
                            .removeClass('slide-out-left');

                        $('#loginForm')
                            .removeClass('hidden')
                            .addClass('slide-in-right');

                        setTimeout(() => {
                            $('#loginForm').removeClass('slide-in-right');
                        }, 500);

                    }, 500);
                }

                $('#registerForm .btn-submit').html('Register');
            }
        });
    });

    // Forgot password form validation
    $('#forgotPasswordEmailForm').on('submit', function (e) {
        e.preventDefault();
        const email = $('#forgot-email').val().trim();

        if (!email) {
            $('.input-group').has('#forgot-email').addClass('shake');
            setTimeout(() => {
                $('.input-group').has('#forgot-email').removeClass('shake');
            }, 500);
            showFlashMessage('Please enter your email address!', 'error');
            return false;
        }

        $('#forgotPasswordForm .btn-submit').html('<i class="fas fa-spinner fa-spin"></i> Sending...');

        $.ajax({
            url: '/forgot-password',
            method: 'POST',
            data: { email: email },
            success: function (response) {
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
            error: function (xhr) {
                showFlashMessage(xhr.responseJSON?.message || 'Error sending OTP', 'error');
                $('#forgotPasswordForm .btn-submit').html('Send OTP');
            }
        });
    });

    // Verify OTP form
    $('#verifyOtpCodeForm').on('submit', function (e) {
        e.preventDefault();
        const otp = $('#otp-code').val().trim();
        const email = $('#forgot-email').val().trim();

        if (!otp) {
            $('.input-group').has('#otp-code').addClass('shake');
            setTimeout(() => {
                $('.input-group').has('#otp-code').removeClass('shake');
            }, 500);
            showFlashMessage('Please enter OTP!', 'error');
            return false;
        }

        $('#verifyOtpForm .btn-submit').html('<i class="fas fa-spinner fa-spin"></i> Verifying...');

        $.ajax({
            url: '/verify-otp',
            method: 'POST',
            data: { email: email, otp: otp },
            success: function (response) {
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
            error: function (xhr) {
                showFlashMessage(xhr.responseJSON?.message || 'Invalid OTP', 'error');
                $('#verifyOtpForm .btn-submit').html('Verify OTP');
            }
        });
    });

    // Reset password form
    $('#resetPasswordNewForm').on('submit', function (e) {
        e.preventDefault();
        const password = $('#new-password').val();
        const confirmPassword = $('#confirm-new-password').val();
        const email = $('#forgot-email').val().trim();

        if (password !== confirmPassword) {
            $('.input-group').has('#confirm-new-password').addClass('shake');
            setTimeout(() => {
                $('.input-group').has('#confirm-new-password').removeClass('shake');
            }, 500);
            showFlashMessage('Passwords do not match!', 'error');
            return false;
        }

        $('#resetPasswordForm .btn-submit').html('<i class="fas fa-spinner fa-spin"></i> Resetting...');

        $.ajax({
            url: '/reset-password',
            method: 'POST',
            data: { email: email, password: password },
            success: function (response) {
                showFlashMessage('Password reset successful! Please login.', 'success');
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
            error: function (xhr) {
                showFlashMessage(xhr.responseJSON?.message || 'Error resetting password', 'error');
                $('#resetPasswordForm .btn-submit').html('Reset Password');
            }
        });
    });

    // Input focus animation
    $('.input-group input, .input-group select').on('focus', function () {
        $(this).parent().addClass('input-focused');
    });

    $('.input-group input, .input-group select').on('blur', function () {
        $(this).parent().removeClass('input-focused');
    });

    // Check for pre-filled values on page load
    $('.input-group input, .input-group select').each(function () {
        if ($(this).val() && $(this).val().trim() !== '') {
            $(this).addClass('has-value');
        }
    });
});
