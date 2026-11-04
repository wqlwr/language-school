/* =============================================================
   Language School — скрипты сайта
   1) Модальное окно быстрой записи
   2) Валидация форм (включая формы в модальных окнах)
   3) Живые фильтры каталога курсов
   4) Сортировка курсов по цене
   5) Закрытие мобильного меню после перехода
   ============================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initEnrollModal();
  initFormValidation();
  initCatalogFilters();
  initCatalogSort();
  initMobileNav();
});

/* 1. Модальное окно быстрой записи.
   Любая кнопка с атрибутом data-enroll просто открывает форму. */
function initEnrollModal() {
  const modalEl = document.getElementById('enrollModal');
  if (!modalEl) return; // на страницах без модалки ничего не делаем

  const modal = new bootstrap.Modal(modalEl);
  const form = document.getElementById('enrollModalForm');
  const successBox = document.getElementById('modalSuccess');

  // Все кнопки записи открывают одно и то же окно
  document.querySelectorAll('[data-enroll]').forEach((button) => {
    button.addEventListener('click', () => modal.show());
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault(); // backend пока не подключён — имитируем отправку
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }
    successBox.hidden = false;
    form.reset();
    form.classList.remove('was-validated');
    window.setTimeout(() => modal.hide(), 2200);
  });

  modalEl.addEventListener('hidden.bs.modal', () => {
    successBox.hidden = true;
    form.classList.remove('was-validated');
  });
}

/* 2. Валидация всех форм с классом needs-validation.
   При успехе показываем блок .js-form-success внутри формы.
   Если форма лежит в модальном окне — окно закрывается автоматически. */
function initFormValidation() {
  document.querySelectorAll('form.needs-validation').forEach((form) => {
    if (form.closest('#enrollModal')) return; // форма быстрой записи обрабатывается отдельно

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      const success = form.querySelector('.js-form-success');
      if (success) {
        success.hidden = false;
      }
      form.reset();
      form.classList.remove('was-validated');

      // Если форма находится в модальном окне — закрываем его
      const modalEl = form.closest('.modal');
      if (modalEl) {
        window.setTimeout(() => {
          const modalInstance = bootstrap.Modal.getInstance(modalEl);
          if (modalInstance) modalInstance.hide();
        }, 2000);
      }
    });
  });
}

/* 3. Живые фильтры каталога курсов.
   Карточки скрываются/показываются по data-атрибутам:
   data-language, data-level, data-format, data-price. */
function initCatalogFilters() {
  const filterForm = document.getElementById('filterForm');
  if (!filterForm) return;

  const cards = Array.from(document.querySelectorAll('[data-course-card]'));
  const counter = document.getElementById('coursesCount');
  const noResults = document.getElementById('noResults');
  const resetButton = document.getElementById('resetFilters');

  const getChecked = (name) =>
    Array.from(filterForm.querySelectorAll(`input[name="${name}"]:checked`)).map((input) => input.value);

  function applyFilters() {
    const languages = getChecked('lang');
    const formats = getChecked('format');
    const level = filterForm.querySelector('#levelFilter').value;
    const priceFrom = parseInt(filterForm.querySelector('#priceFrom').value, 10) || 0;
    const priceTo = parseInt(filterForm.querySelector('#priceTo').value, 10) || Number.MAX_VALUE;

    let visibleCount = 0;

    cards.forEach((card) => {
      const cardFormats = card.dataset.format.split(' ');
      const okLanguage = languages.length === 0 || languages.includes(card.dataset.language);
      const okFormat = formats.length === 0 || formats.some((format) => cardFormats.includes(format));
      const okLevel = !level || card.dataset.level === level || card.dataset.level === 'all';
      const price = parseInt(card.dataset.price, 10);
      const okPrice = price >= priceFrom && price <= priceTo;

      const isVisible = okLanguage && okFormat && okLevel && okPrice;
      card.classList.toggle('d-none', !isVisible);
      if (isVisible) visibleCount += 1;
    });

    counter.textContent = visibleCount;
    noResults.hidden = visibleCount !== 0;
  }

  filterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    applyFilters();
  });
  filterForm.addEventListener('change', applyFilters);
  filterForm.addEventListener('reset', () => window.setTimeout(applyFilters, 0));
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      filterForm.reset();
      applyFilters();
    });
  }

  applyFilters();
}

/* 4. Сортировка курсов по цене (по возрастанию/убыванию)
   и возврат к исходному порядку. */
function initCatalogSort() {
  const sortSelect = document.getElementById('sortSelect');
  const list = document.getElementById('courseList');
  if (!sortSelect || !list) return;

  // Запоминаем исходный порядок карточек
  const originalOrder = Array.from(list.querySelectorAll('[data-course-card]'));

  sortSelect.addEventListener('change', () => {
    let sorted;

    if (sortSelect.value === 'asc') {
      sorted = [...originalOrder].sort(
        (a, b) => parseInt(a.dataset.price, 10) - parseInt(b.dataset.price, 10)
      );
    } else if (sortSelect.value === 'desc') {
      sorted = [...originalOrder].sort(
        (a, b) => parseInt(b.dataset.price, 10) - parseInt(a.dataset.price, 10)
      );
    } else {
      sorted = [...originalOrder];
    }

    // Переставляем карточки в DOM
    sorted.forEach((card) => list.appendChild(card));
  });
}

/* 5. Закрываем мобильное меню после клика по ссылке. */
function initMobileNav() {
  const collapseEl = document.getElementById('mainNav');
  if (!collapseEl) return;

  collapseEl.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (collapseEl.classList.contains('show')) {
        bootstrap.Collapse.getOrCreateInstance(collapseEl).hide();
      }
    });
  });
}