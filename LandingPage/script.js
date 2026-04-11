const mobileToggle = document.getElementById("mobileToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-link");

const modal = document.getElementById("leadModal");
const openModalButtons = document.querySelectorAll(".open-modal-btn");
const closeModalButton = document.getElementById("closeModal");

const leadForm = document.getElementById("leadForm");
const successMessage = document.getElementById("successMessage");

const formFields = {
  fullName: document.getElementById("fullName"),
  email: document.getElementById("email"),
  phone: document.getElementById("phone"),
  serviceType: document.getElementById("serviceType"),
  businessName: document.getElementById("businessName"),
  message: document.getElementById("message"),
};

/* Mobile navigation toggle */
if (mobileToggle && navMenu) {
  mobileToggle.addEventListener("click", () => {
    const isExpanded = mobileToggle.getAttribute("aria-expanded") === "true";

    mobileToggle.classList.toggle("active");
    navMenu.classList.toggle("active");
    mobileToggle.setAttribute("aria-expanded", String(!isExpanded));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileToggle.classList.remove("active");
      navMenu.classList.remove("active");
      mobileToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* Modal controls */
function openModal() {
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("body-lock");

  setTimeout(() => {
    formFields.fullName.focus();
  }, 150);
}

function closeModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("body-lock");
}

openModalButtons.forEach((button) => {
  button.addEventListener("click", openModal);
});

if (closeModalButton) {
  closeModalButton.addEventListener("click", closeModal);
}

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("show")) {
    closeModal();
  }
});

/* Validation helpers */
function setError(field, message) {
  const formGroup = field.closest(".form-group");
  const errorText = formGroup.querySelector(".error-text");

  formGroup.classList.add("error");
  errorText.textContent = message;
}

function clearError(field) {
  const formGroup = field.closest(".form-group");
  const errorText = formGroup.querySelector(".error-text");

  formGroup.classList.remove("error");
  errorText.textContent = "";
}

function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email.trim());
}

function isValidPhone(phone) {
  const phonePattern = /^[0-9]{10}$/;
  return phonePattern.test(phone.trim());
}

function validateField(fieldName, field) {
  const value = field.value.trim();

  switch (fieldName) {
    case "fullName":
      if (value.length < 3) {
        setError(field, "Please enter a valid full name.");
        return false;
      }
      break;

    case "email":
      if (!isValidEmail(value)) {
        setError(field, "Please enter a valid email address.");
        return false;
      }
      break;

    case "phone":
      if (!isValidPhone(value)) {
        setError(field, "Please enter a valid 10-digit phone number.");
        return false;
      }
      break;

    case "serviceType":
      if (value === "") {
        setError(field, "Please select a service type.");
        return false;
      }
      break;

    case "businessName":
      if (value.length < 2) {
        setError(field, "Please enter your business name.");
        return false;
      }
      break;

    case "message":
      if (value.length < 10) {
        setError(field, "Please enter at least 10 characters.");
        return false;
      }
      break;

    default:
      return true;
  }

  clearError(field);
  return true;
}

/* Live validation */
Object.entries(formFields).forEach(([fieldName, field]) => {
  field.addEventListener("input", () => {
    validateField(fieldName, field);
  });

  field.addEventListener("blur", () => {
    validateField(fieldName, field);
  });
});

/* Form submission */
if (leadForm) {
  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();

    let isFormValid = true;

    Object.entries(formFields).forEach(([fieldName, field]) => {
      const valid = validateField(fieldName, field);
      if (!valid) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      successMessage.classList.remove("show");
      successMessage.textContent = "";
      return;
    }

    successMessage.textContent =
      "Thank you! Your requirement has been submitted successfully.";
    successMessage.classList.add("show");

    leadForm.reset();

    Object.values(formFields).forEach((field) => {
      clearError(field);
    });

    setTimeout(() => {
      closeModal();
      successMessage.classList.remove("show");
      successMessage.textContent = "";
    }, 2200);
  });
}