// Toggle job descriptions
document.querySelectorAll('.toggle-btn').forEach(button => {
  button.addEventListener('click', () => {
    const details = button.nextElementSibling;
    const btnText = button.querySelector('.btn-text');
    
    if (details.style.display === 'none' || !details.style.display) {
      details.style.display = 'block';
      btnText.textContent = 'Show less';
      button.classList.add('active');
    } else {
      details.style.display = 'none';
      btnText.textContent = 'Show more';
      button.classList.remove('active');
    }
  });
});


const typewriter = document.getElementById('typewriter');
if (typewriter) {
  const roles = [
    "AI Consultant",
    "Software Engineer",
    "AI Engineer",
  ];

  let currentRoleIndex = 0;

  function changeRole() {
    typewriter.style.opacity = "0";
    typewriter.style.transform = "translateY(-10px)";
    
    setTimeout(() => {
      currentRoleIndex = (currentRoleIndex + 1) % roles.length;
      typewriter.textContent = roles[currentRoleIndex];
      typewriter.style.opacity = "1";
      typewriter.style.transform = "translateY(0)";
      setTimeout(changeRole, 4000);
    }, 300);
  }

  typewriter.textContent = roles[0];
  setTimeout(changeRole, 4000);
}

// Contact Modal Functionality
const contactModal = document.getElementById('contact-modal');
const closeModal = document.getElementById('close-modal');
const contactForm = document.getElementById('contact-form');

if (closeModal && contactModal) {
  closeModal.addEventListener('click', () => {
    contactModal.classList.remove('show');
    document.body.style.overflow = 'auto';
  });

  contactModal.addEventListener('click', (e) => {
    if (e.target === contactModal) {
      contactModal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactModal.classList.contains('show')) {
      contactModal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }
  });
}

if (contactForm && contactModal) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    const emailContent = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`;
    const mailtoLink = `mailto:ahmed.babay.personal@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailContent)}`;
    window.open(mailtoLink);
    
    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
    submitBtn.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
    contactForm.reset();
    
    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.style.background = 'linear-gradient(135deg, #2d7d7d, #1a5a5a)';
      contactModal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }, 2000);
  });
}

// Theme toggle and Skills functionality
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    // Apply persisted preference (default: dark — class is already on body)
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.body.classList.remove('dark-mode');
    } else {
      document.body.classList.add('dark-mode');
    }
    themeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";

    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");
      themeToggle.textContent = isDark ? "☀️" : "🌙";
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }
  
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
    
    item.addEventListener('touchstart', () => {
      touchTimeout = setTimeout(() => {
        item.classList.add('tooltip-active');
      }, 500);
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

// Constellation network background — subtle drifting nodes with proximity-based
// connecting lines. Reads as a clean "neural network / data graph" backdrop.
class ConstellationBackground {
  constructor() {
    this.canvas = document.getElementById('particle-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null };
    this.maxDistance = 175;
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
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  createParticles() {
    const density = Math.min(110, Math.floor((this.width * this.height) / 11000));
    this.particles = [];
    for (let i = 0; i < density; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.6 + 1.2,
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.createParticles();
    });
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  accentRGB() {
    return document.body.classList.contains('dark-mode')
      ? '45, 212, 191'   // teal-400 — pops on slate
      : '15, 118, 110';  // teal-700 — confident on light bg
  }

  draw() {
    const { ctx, width: w, height: h, particles, maxDistance } = this;
    const isDark = document.body.classList.contains('dark-mode');
    const accent = this.accentRGB();
    const lineAlphaScale = isDark ? 0.42 : 0.28;
    const nodeAlpha = isDark ? 0.85 : 0.7;

    ctx.clearRect(0, 0, w, h);

    // advance positions
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }

    // connections between nearby nodes
    ctx.lineWidth = 0.85;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < maxDistance * maxDistance) {
          const t = 1 - Math.sqrt(distSq) / maxDistance;
          ctx.strokeStyle = `rgba(${accent}, ${t * lineAlphaScale})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // cursor halo — connect nearby nodes to the pointer
    if (this.mouse.x !== null) {
      const reach = maxDistance * 1.5;
      ctx.lineWidth = 1.1;
      for (const p of particles) {
        const dx = p.x - this.mouse.x, dy = p.y - this.mouse.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < reach * reach) {
          const t = 1 - Math.sqrt(distSq) / reach;
          ctx.strokeStyle = `rgba(${accent}, ${t * (isDark ? 0.55 : 0.4)})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(this.mouse.x, this.mouse.y);
          ctx.stroke();
        }
      }
    }

    // nodes — luminous core + soft halo
    const haloAlpha = isDark ? 0.22 : 0.14;
    for (const p of particles) {
      const haloRadius = p.radius * 4;
      const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloRadius);
      halo.addColorStop(0, `rgba(${accent}, ${haloAlpha})`);
      halo.addColorStop(1, `rgba(${accent}, 0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(p.x, p.y, haloRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${accent}, ${nodeAlpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  animate() {
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.matchMedia('(min-width: 769px)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    new ConstellationBackground();
  }
});
