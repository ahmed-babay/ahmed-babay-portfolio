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
if (typewriter) {
  const roles = [
    "Software Engineer", 
    "AI Engineer",
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
}

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
    themeToggle.addEventListener("click", () => {
      // Only toggle dark-mode class
      document.body.classList.toggle("dark-mode");
      
      const isDark = document.body.classList.contains("dark-mode");
      themeToggle.textContent = isDark ? "☀️" : "🌙";
    });
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

// Mobile Navigation Functions
function toggleMobileMenu() {
  const navMenu = document.querySelector('.nav-menu');
  const navToggle = document.querySelector('.nav-toggle');
  
  navMenu.classList.toggle('active');
  navToggle.classList.toggle('active');
}

function closeMobileMenu() {
  const navMenu = document.querySelector('.nav-menu');
  const navToggle = document.querySelector('.nav-toggle');
  
  navMenu.classList.remove('active');
  navToggle.classList.remove('active');
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
  const navMenu = document.querySelector('.nav-menu');
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('nav');
  
  if (!nav.contains(event.target) && navMenu.classList.contains('active')) {
    closeMobileMenu();
  }
});

// Particle Background Animation
class ParticleSystem {
  constructor() {
    this.canvas = document.getElementById('particle-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    
    this.init();
  }
  
  init() {
    this.resizeCanvas();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }
  
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  createParticles() {
    const particleCount = Math.min(50, Math.floor(window.innerWidth / 20));
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: 3,
        opacity: Math.random() * 0.5 + 0.3,
        type: Math.random() > 0.5 ? 'code' : 'dot',
        code: this.getRandomCode(),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.001,
        color: this.getRandomColor()
      });
    }
  }
  
  getRandomCode() {
    const codeSnippets = [
      '{}', '∞', 'predict()', 'CI/CD', 'pip install', '404', '200 OK', 
      'fetch()', 'commit()', 'docker run', 'const', 'curl', 'deploy()',
      'import', 'export','async',
      'await', 'try', 'epoch=42', 'finally', 'new',
      'π', 'super', 'static', 'public', 'private',
      'React', 'Node', 'Python', 'Java', 'SQL',
      'API', 'JSON', '</code>', 'test()',
      'Git', 'AWS', 'Redis',
      'Spring', '{data}', '<dev>'
    ];
    return codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
  }
  
  getRandomColor() {
    const colors = [
      'rgba(45, 125, 125, ', // Teal
      'rgba(26, 90, 90, ',   // Dark teal
      'rgba(46, 74, 92, ',   // Blue-gray
      'rgba(74, 85, 104, ',  // Gray
      'rgba(26, 54, 93, '    // Navy
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  bindEvents() {
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.particles = [];
      this.createParticles();
    });
  }
  
  updateParticles() {
    this.particles.forEach(particle => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Update rotation
      particle.rotation += particle.rotationSpeed;
      
      // Keep particles within screen bounds (smooth circular movement)
      if (particle.x < 0) {
        particle.x = this.canvas.width;
      }
      if (particle.x > this.canvas.width) {
        particle.x = 0;
      }
      if (particle.y < 0) {
        particle.y = this.canvas.height;
      }
      if (particle.y > this.canvas.height) {
        particle.y = 0;
      }
    });
  }
  
  drawParticles() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(particle => {
      this.ctx.save();
      this.ctx.translate(particle.x, particle.y);
      this.ctx.rotate(particle.rotation);
      
      if (particle.type === 'code') {
        // Draw code snippet with glow effect
        this.ctx.shadowColor = particle.color + '0.6)';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = particle.color + (particle.opacity + 0.2) + ')';
        this.ctx.font = `bold 24px 'Courier New', monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(particle.code, 0, 4);
      } else {
        // Draw dot with gradient and glow
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
        gradient.addColorStop(0, particle.color + (particle.opacity + 0.5) + ')');
        gradient.addColorStop(0.7, particle.color + (particle.opacity + 0.2) + ')');
        gradient.addColorStop(1, particle.color + (particle.opacity * 0.4) + ')');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add inner glow
        this.ctx.fillStyle = particle.color + '1.0)';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, particle.size * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      this.ctx.restore();
    });
  }
  
  
  
  animate() {
    this.updateParticles();
    this.drawParticles();
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Initialize particle system when page loads
document.addEventListener('DOMContentLoaded', () => {
  if (window.matchMedia('(min-width: 769px)').matches) {
    new ParticleSystem();
  }
});
