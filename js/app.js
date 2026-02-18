// ============================================
// APP.JS - Página Web Psicólogo
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollEffects();
  initCalendar();
  initBookingForm();
  initPaymentForm();
  initCertificateModal();
});

// ============================================
// ESTADO GLOBAL
// ============================================
const bookingState = {
  selectedPlan: null,
  planName: '',
  planPrice: 0,
  selectedDate: null,
  selectedTime: null,
};

// Horarios disponibles (simulados)
const availableSlots = [
  '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00', '18:00'
];

// ============================================
// NAVEGACIÓN
// ============================================
function initNavigation() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  const navOverlay = document.getElementById('nav-overlay');
  const navLinks = document.querySelectorAll('.header__nav-link');

  // Toggle menú móvil
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    nav.classList.toggle('active');
    navOverlay.classList.toggle('active');
    document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
  });

  // Cerrar menú al click en overlay
  navOverlay.addEventListener('click', closeMenu);

  // Cerrar menú al click en link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
      // Actualizar link activo
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Header con scroll
  window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    header.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Actualizar nav activo al hacer scroll
  window.addEventListener('scroll', updateActiveNav);

  function closeMenu() {
    hamburger.classList.remove('active');
    nav.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.header__nav-link');
  const scrollPos = window.scrollY + 100;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollPos >= top && scrollPos < top + height) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

// ============================================
// EFECTOS DE SCROLL (Fade In)
// ============================================
function initScrollEffects() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ============================================
// CALENDARIO
// ============================================
let currentMonth, currentYear;

function initCalendar() {
  const today = new Date();
  currentMonth = today.getMonth();
  currentYear = today.getFullYear();

  document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
  });

  document.getElementById('next-month').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  });

  renderCalendar();
}

function renderCalendar() {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  document.getElementById('calendar-month-year').textContent =
    `${monthNames[currentMonth]} ${currentYear}`;

  const daysContainer = document.getElementById('calendar-days');
  daysContainer.innerHTML = '';

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Días vacíos al inicio
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement('button');
    emptyDay.className = 'calendar__day calendar__day--empty';
    emptyDay.disabled = true;
    daysContainer.appendChild(emptyDay);
  }

  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dayBtn = document.createElement('button');
    dayBtn.className = 'calendar__day';
    dayBtn.textContent = day;

    // Deshabilitar domingos y días pasados
    const isSunday = date.getDay() === 0;
    const isPast = date < today;

    if (isSunday || isPast) {
      dayBtn.classList.add('calendar__day--disabled');
      dayBtn.disabled = true;
    } else {
      dayBtn.addEventListener('click', () => selectDate(date, dayBtn));
    }

    // Marcar día actual
    if (date.getTime() === today.getTime()) {
      dayBtn.classList.add('calendar__day--today');
    }

    // Marcar día seleccionado
    if (bookingState.selectedDate &&
        date.getTime() === bookingState.selectedDate.getTime()) {
      dayBtn.classList.add('calendar__day--selected');
    }

    daysContainer.appendChild(dayBtn);
  }
}

function selectDate(date, element) {
  // Remover selección anterior
  document.querySelectorAll('.calendar__day--selected')
    .forEach(el => el.classList.remove('calendar__day--selected'));

  element.classList.add('calendar__day--selected');
  bookingState.selectedDate = date;
  bookingState.selectedTime = null;

  // Mostrar horarios
  const dateText = formatDate(date);
  document.getElementById('selected-date-text').textContent = dateText;

  renderTimeslots();
  updateBookingSummary();
}

function renderTimeslots() {
  const container = document.getElementById('timeslots-grid');
  const timeslotsSection = document.getElementById('timeslots');
  container.innerHTML = '';
  timeslotsSection.classList.add('active');

  // Simular algunos horarios no disponibles (aleatorio basado en fecha)
  const seed = bookingState.selectedDate.getDate();

  availableSlots.forEach((slot, index) => {
    const btn = document.createElement('button');
    btn.className = 'timeslot';
    btn.textContent = slot;
    btn.type = 'button';

    // Simular disponibilidad
    const isUnavailable = (seed + index) % 4 === 0;

    if (isUnavailable) {
      btn.classList.add('timeslot--unavailable');
      btn.disabled = true;
    } else {
      btn.addEventListener('click', () => selectTimeslot(slot, btn));
    }

    if (bookingState.selectedTime === slot) {
      btn.classList.add('timeslot--selected');
    }

    container.appendChild(btn);
  });
}

function selectTimeslot(time, element) {
  document.querySelectorAll('.timeslot--selected')
    .forEach(el => el.classList.remove('timeslot--selected'));

  element.classList.add('timeslot--selected');
  bookingState.selectedTime = time;
  updateBookingSummary();
}

// ============================================
// FORMULARIO DE RESERVA
// ============================================
function initBookingForm() {
  const form = document.getElementById('booking-form');
  const planSelect = document.getElementById('plan-select');

  planSelect.addEventListener('change', (e) => {
    const plans = {
      individual: { name: 'Consulta Individual', price: 800 },
      pack: { name: 'Pack 4 Sesiones', price: 2800 },
      pareja: { name: 'Terapia de Pareja', price: 1200 },
    };

    const plan = plans[e.target.value];
    if (plan) {
      bookingState.selectedPlan = e.target.value;
      bookingState.planName = plan.name;
      bookingState.planPrice = plan.price;
    } else {
      bookingState.selectedPlan = null;
    }
    updateBookingSummary();
  });

  // Validar campos en tiempo real
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('input', updateBookingSummary);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateBooking()) {
      openPaymentModal();
    }
  });
}

function updateBookingSummary() {
  const summary = document.getElementById('booking-summary');
  const submitBtn = document.getElementById('booking-submit');

  const hasPlan = bookingState.selectedPlan;
  const hasDate = bookingState.selectedDate;
  const hasTime = bookingState.selectedTime;

  if (hasPlan || hasDate || hasTime) {
    summary.classList.add('active');
  }

  document.getElementById('summary-plan').textContent =
    bookingState.planName || '-';
  document.getElementById('summary-date').textContent =
    bookingState.selectedDate ? formatDate(bookingState.selectedDate) : '-';
  document.getElementById('summary-time').textContent =
    bookingState.selectedTime || '-';
  document.getElementById('summary-total').textContent =
    bookingState.planPrice ? `$${bookingState.planPrice.toLocaleString()}` : '-';

  // Habilitar botón solo si todo está completo
  const form = document.getElementById('booking-form');
  const allFieldsFilled = form.checkValidity() && hasPlan && hasDate && hasTime;
  submitBtn.disabled = !allFieldsFilled;
}

function validateBooking() {
  if (!bookingState.selectedPlan) {
    showAlert('Por favor selecciona un plan.');
    return false;
  }
  if (!bookingState.selectedDate) {
    showAlert('Por favor selecciona una fecha.');
    return false;
  }
  if (!bookingState.selectedTime) {
    showAlert('Por favor selecciona un horario.');
    return false;
  }
  return true;
}

// Función global para seleccionar plan desde las tarjetas
function selectPlan(planId, planName, planPrice) {
  bookingState.selectedPlan = planId;
  bookingState.planName = planName;
  bookingState.planPrice = planPrice;

  // Actualizar el select
  document.getElementById('plan-select').value = planId;

  // Scroll a la sección de agendar
  document.getElementById('agendar').scrollIntoView({ behavior: 'smooth' });

  updateBookingSummary();
}

// ============================================
// PAGO SIMULADO
// ============================================
function initPaymentForm() {
  const cardNumber = document.getElementById('card-number');
  const cardName = document.getElementById('card-name');
  const cardExpiry = document.getElementById('card-expiry');
  const cardCvv = document.getElementById('card-cvv');
  const paymentForm = document.getElementById('payment-form');

  // Formatear número de tarjeta
  cardNumber.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(.{4})/g, '$1 ').trim();
    e.target.value = value;

    // Actualizar visual
    document.getElementById('card-display').textContent =
      value || '**** **** **** ****';
  });

  // Actualizar nombre en visual
  cardName.addEventListener('input', (e) => {
    document.getElementById('card-name-display').textContent =
      e.target.value.toUpperCase() || 'TU NOMBRE';
  });

  // Formatear fecha de vencimiento
  cardExpiry.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    e.target.value = value;

    document.getElementById('card-expiry-display').textContent =
      value || 'MM/AA';
  });

  // Solo números en CVV
  cardCvv.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  // Cerrar modal
  document.getElementById('payment-close').addEventListener('click', closePaymentModal);
  document.getElementById('payment-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      closePaymentModal();
    }
  });

  // Submit pago
  paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    processPayment();
  });
}

function openPaymentModal() {
  const modal = document.getElementById('payment-modal');

  // Llenar resumen
  document.getElementById('pay-plan').textContent = bookingState.planName;
  document.getElementById('pay-date').textContent =
    formatDate(bookingState.selectedDate);
  document.getElementById('pay-time').textContent = bookingState.selectedTime;
  document.getElementById('pay-total').textContent =
    `$${bookingState.planPrice.toLocaleString()}`;

  // Mostrar formulario, ocultar éxito
  document.getElementById('payment-form-section').style.display = 'block';
  document.getElementById('payment-success').classList.remove('active');

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
  const modal = document.getElementById('payment-modal');
  modal.classList.remove('active');
  document.body.style.overflow = '';

  // Resetear formulario de pago
  document.getElementById('payment-form').reset();
  document.getElementById('card-display').textContent = '**** **** **** ****';
  document.getElementById('card-name-display').textContent = 'TU NOMBRE';
  document.getElementById('card-expiry-display').textContent = 'MM/AA';
}

function processPayment() {
  const btn = document.querySelector('.payment__btn');
  btn.textContent = 'Procesando...';
  btn.disabled = true;

  // Simular procesamiento
  setTimeout(() => {
    document.getElementById('payment-form-section').style.display = 'none';
    document.getElementById('payment-success').classList.add('active');

    btn.innerHTML = '<span class="btn-lock">&#128274;</span> Pagar Ahora';
    btn.disabled = false;
  }, 2000);
}

// ============================================
// CERTIFICADOS
// ============================================
function initCertificateModal() {
  const modal = document.getElementById('certificate-modal');
  const closeBtn = document.getElementById('cert-modal-close');

  closeBtn.addEventListener('click', closeCertificateModal);
  modal.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      closeCertificateModal();
    }
  });
}

function openCertificate(btn) {
  const card = btn.closest('.certificate-card');
  const title = card.querySelector('h4').textContent;
  const issuer = card.querySelector('.certificate-card__issuer').textContent;
  const img = card.querySelector('.certificate-card__image img');

  document.getElementById('cert-modal-title').textContent = title;
  document.getElementById('cert-modal-issuer').textContent = issuer;

  // Si hay imagen real, mostrarla en el modal
  const modalImage = document.getElementById('cert-modal-image');
  if (img) {
    modalImage.innerHTML = `<img src="${img.src}" alt="${title}">`;
  }

  const modal = document.getElementById('certificate-modal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCertificateModal() {
  const modal = document.getElementById('certificate-modal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// ============================================
// UTILIDADES
// ============================================
function formatDate(date) {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
}

function showAlert(message) {
  alert(message);
}
