document.addEventListener('DOMContentLoaded', function() {
  setActiveNav();
  initTheme();
  initValidation();
  initCountUp();
});

function setActiveNav() {
  var path = window.location.pathname;
  document.querySelectorAll('.sidebar-nav-link[data-page]').forEach(function(link) {
    var href = link.getAttribute('href');
    if (href === path || (path.startsWith(href) && href !== '/')) {
      link.classList.add('active');
    }
  });
}

function toggleSidebar() {
  var sidebar = document.querySelector('.sidebar');
  var overlay = document.querySelector('.sidebar-overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
}

function initTheme() {
  var theme = localStorage.getItem('plantech-theme') || 'dark';
  applyTheme(theme);
}

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme') || 'dark';
  var next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('plantech-theme', next);
  applyTheme(next);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  var icon = document.getElementById('themeIcon');
  var label = document.getElementById('themeLabel');
  if (icon) {
    icon.className = theme === 'dark' ? 'bi bi-moon' : 'bi bi-sun';
  }
  if (label) {
    label.textContent = theme === 'dark' ? 'Modo claro' : 'Modo escuro';
  }
}

function initValidation() {
  document.querySelectorAll('.needs-validation').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
      }
      form.classList.add('was-validated');
    });
  });
}

function initCountUp() {
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  document.querySelectorAll('[data-countup]').forEach(function(el) {
    var target = parseFloat(el.getAttribute('data-countup'));
    var prefix = el.getAttribute('data-prefix') || '';
    var isDecimal = String(target).indexOf('.') !== -1;
    var duration = 600;
    var start = performance.now();

    function step(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = target * eased;

      el.textContent = prefix + (isDecimal ? current.toFixed(2) : Math.round(current));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  });
}
