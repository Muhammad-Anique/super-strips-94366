'use strict';

/**
 * Super Strips - Landing Page Logic
 * Handles Supabase integration, form validation, and UI states.
 */

// --- Configuration ---
// These should ideally be environment variables during a build step, 
// but for a static vanilla JS setup, they are defined here.
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
const TABLE_NAME = 'leads';

// --- DOM Elements ---
const waitlistForm = document.getElementById('waitlistForm');
const emailInput = document.getElementById('emailInput');
const submitBtn = document.getElementById('submitBtn');
const messageBox = document.getElementById('messageBox');
const messageText = document.getElementById('messageText');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initFormHandler();
    initSmoothScrolling();
});

/**
 * Handles the email submission to Supabase
 */
function initFormHandler() {
    if (!waitlistForm) return;

    waitlistForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();

        // 1. Basic Validation
        if (!validateEmail(email)) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }

        // 2. Prepare UI for loading
        setLoading(true);

        try {
            // 3. Supabase REST API Call
            // We use the 'Prefer: resolution=merge-duplicates' or handle 409 Conflict
            const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Prefer': 'return=minimal' 
                },
                body: JSON.stringify({ email: email })
            });

            if (response.ok) {
                showMessage('Thank you! You\'ve been added to the elite list.', 'success');
                waitlistForm.reset();
            } else {
                const errorData = await response.json();
                
                // Handle Postgres Unique Constraint Violation (Error code 23505)
                if (response.status === 409 || (errorData.code === '23505')) {
                    showMessage('You are already registered!', 'info');
                } else {
                    throw new Error('Submission failed');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Something went wrong. Please try again later.', 'error');
        } finally {
            setLoading(false);
        }
    });
}

/**
 * Email Regex Validation
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
}

/**
 * UI Feedback Logic
 */
function showMessage(text, type) {
    messageBox.classList.remove('hidden', 'error', 'success', 'info');
    messageBox.classList.add(type);
    messageText.textContent = text;

    // Accessibility: announce message to screen readers
    messageBox.setAttribute('role', 'alert');
}

function setLoading(isLoading) {
    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'JOINING...';
        messageBox.classList.add('hidden');
    } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'NOTIFY ME';
    }
}

/**
 * Smooth scrolling for any anchor links
 */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}