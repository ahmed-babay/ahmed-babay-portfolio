// Toggle job descriptions
document.querySelectorAll('.toggle-btn').forEach(button => {
  button.addEventListener('click', () => {
    const details = button.nextElementSibling;
    if (details.style.display === 'none') {
      details.style.display = 'block';
      button.textContent = 'Show less';
    } else {
      details.style.display = 'none';
      button.textContent = 'Show more';
    }
  });
});


const typewriter = document.getElementById('typewriter');
const roles = [
  "Software Engineer", 
  "Data Scientist",
  "Machine Learning Engineer",
  "Computer Scientist",
];

let currentRoleIndex = 0;

function changeRole() {
  const currentRole = roles[currentRoleIndex];
  const nextRole = roles[(currentRoleIndex + 1) % roles.length];
  
  // Smooth fade out
  typewriter.style.opacity = "0";
  typewriter.style.transform = "translateY(-10px)";
  
  setTimeout(() => {
    // Change text completely
    typewriter.textContent = nextRole;
    
    // Smooth fade in
    typewriter.style.opacity = "1";
    typewriter.style.transform = "translateY(0)";
    
    // Move to next role
    currentRoleIndex = (currentRoleIndex + 1) % roles.length;
    
    // Schedule next change
    setTimeout(changeRole, 4000); // Change every 4 seconds
  }, 300); // Wait 300ms for fade out
}

// Initialize with first role
typewriter.textContent = roles[0];
setTimeout(changeRole, 4000); // Start changing after 4 seconds

// Contact Modal Functionality
const contactBtn = document.getElementById('contact-btn');
const contactModal = document.getElementById('contact-modal');
const closeModal = document.getElementById('close-modal');
const contactForm = document.getElementById('contact-form');

// Open modal (only if contact button exists)
if (contactBtn && contactModal) {
  contactBtn.addEventListener('click', () => {
    contactModal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  });
}

// Close modal (only if elements exist)
if (closeModal && contactModal) {
  closeModal.addEventListener('click', () => {
    contactModal.classList.remove('show');
    document.body.style.overflow = 'auto';
  });

  // Close modal when clicking outside
  contactModal.addEventListener('click', (e) => {
    if (e.target === contactModal) {
      contactModal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactModal.classList.contains('show')) {
      contactModal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }
  });
}

// Handle form submission (only if form exists)
if (contactForm && contactModal) {
  contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Get form data
  const formData = new FormData(contactForm);
  const name = formData.get('name');
  const email = formData.get('email');
  const subject = formData.get('subject');
  const message = formData.get('message');
  
  // Create email content
  const emailContent = `
    Name: ${name}
    Email: ${email}
    Subject: ${subject}
    
    Message:
    ${message}
  `;
  
  // Open default email client
  const mailtoLink = `mailto:ahmed.babay.personal@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailContent)}`;
  window.open(mailtoLink);
  
  // Show success message
  const submitBtn = contactForm.querySelector('.submit-btn');
  const originalText = submitBtn.innerHTML;
  
  submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
  submitBtn.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
  
  // Reset form
  contactForm.reset();
  
  // Reset button after 3 seconds
  setTimeout(() => {
    submitBtn.innerHTML = originalText;
    submitBtn.style.background = 'linear-gradient(135deg, #d1b89d, #b59e7c)';
  }, 3000);
  
  // Close modal after a short delay
  setTimeout(() => {
    contactModal.classList.remove('show');
    document.body.style.overflow = 'auto';
  }, 2000);
});
}

// Theme toggle functionality with proper initialization
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById("theme-toggle");
  
  if (themeToggle) {
    console.log("Theme toggle button found!"); // Debug log
    
    themeToggle.addEventListener("click", () => {
      console.log("Theme toggle clicked!"); // Debug log
      
      // Only toggle dark-mode class
      document.body.classList.toggle("dark-mode");
      
      const isDark = document.body.classList.contains("dark-mode");
      themeToggle.textContent = isDark ? "☀️" : "🌙";
      
      console.log("Dark mode is now:", isDark); // Debug log
    });
  } else {
    console.log("Theme toggle button NOT found!"); // Debug log
  }
});

// Skills animation and tooltip functionality
document.addEventListener('DOMContentLoaded', function() {
  const skillItems = document.querySelectorAll(".skill-item");

  const animateSkills = () => {
    skillItems.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = "1";
        item.style.transform = "translateY(0)";
      }, index * 100);
    });
  };

  // Enhanced tooltip functionality
  skillItems.forEach(item => {
    // Add touch support for mobile devices
    let touchTimeout;
    
    item.addEventListener('touchstart', (e) => {
      e.preventDefault();
      touchTimeout = setTimeout(() => {
        item.classList.add('tooltip-active');
      }, 500); // Show tooltip after 500ms touch
    });
    
    item.addEventListener('touchend', () => {
      clearTimeout(touchTimeout);
      setTimeout(() => {
        item.classList.remove('tooltip-active');
      }, 2000); // Hide tooltip after 2 seconds
    });
    
    // Add keyboard support for accessibility
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.classList.toggle('tooltip-active');
      }
    });
  });

  window.addEventListener("scroll", () => {
    const skills = document.getElementById("skills");
    if (skills) {
      const rect = skills.getBoundingClientRect();
      if (rect.top < window.innerHeight && !skills.classList.contains("animated")) {
        skills.classList.add("animated");
        animateSkills();
      }
    }
  });
});




// Professional summary animation
const summaryContainer = document.querySelector(".summary-container");

const animateSummary = () => {
  if (summaryContainer && !summaryContainer.classList.contains("animated")) {
    summaryContainer.classList.add("animated");
    summaryContainer.style.opacity = "1";
    summaryContainer.style.transform = "translateY(0)";
  }
};

window.addEventListener("scroll", () => {
  const summary = document.getElementById("professional-summary");
  if (summary) {
    const rect = summary.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.8) {
      animateSummary();
    }
  }
});
