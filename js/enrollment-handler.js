// Form submission handler for enrollment
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.enroll-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            const currentLang = document.documentElement.lang || 'ar';
            
            // Get form values
            const fullName = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const pathPreference = document.getElementById('path').value;
            
            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = currentLang === 'ar' ? 'جاري الإرسال...' : 'Submitting...';
            
            try {
                // Insert data into Supabase
                const { data, error } = await window.supabaseClient
                    .from('enrollments')
                    .insert([
                        {
                            full_name: fullName,
                            email: email,
                            path_preference: pathPreference
                        }
                    ]);
                
                if (error) {
                    throw error;
                }
                
                // Success message
                alert(currentLang === 'ar' 
                    ? 'تم استلام طلب الالتحاق! سنتواصل معك قريباً.' 
                    : 'Enrollment received! We will contact you soon.');
                
                // Reset form
                form.reset();
                
            } catch (error) {
                console.error('Error submitting enrollment:', error);
                alert(currentLang === 'ar' 
                    ? 'حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.' 
                    : 'An error occurred. Please try again.');
            } finally {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
});
