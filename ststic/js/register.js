$(document).ready(function() {
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

    // Form validation and animation
    $('#registerForm').on('submit', function(e) {
        const password = $('#password').val();
        const confirmPassword = $('#confirm_password').val();

        if (password !== confirmPassword) {
            e.preventDefault();
            
            // Shake animation for password mismatch
            $('.input-group').has('#confirm_password').addClass('shake');
            setTimeout(() => {
                $('.input-group').has('#confirm_password').removeClass('shake');
            }, 500);

            alert('Passwords do not match!');
            return false;
        }

        // Button loading animation
        $('.btn-register').html('<i class="fas fa-spinner fa-spin"></i> Processing...');
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
