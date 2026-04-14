const mobileToggle = document.getElementById("mobileToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-link");

const modal = document.getElementById("leadModal");
const openModalButtons = document.querySelectorAll(".open-modal-btn");
const closeModalButton = document.getElementById("closeModal");

const leadForm = document.getElementById("leadForm");
const successMessage = document.getElementById("successMessage");

const contactForm = document.getElementById("contactForm");
const contactSuccessMessage = document.getElementById("contactSuccessMessage");

/* Google Apps Script Web App URL */
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwHqQyuQMpgJ5O3WgLyRJ30z6GREcWIkzb6198vzQn5KHGjUYY1bfFfAyUJmAVA6mrE/exec";

const modalFormFields = {
  fullName: document.getElementById("fullName"),
  email: document.getElementById("email"),
  phone: document.getElementById("phone"),
  serviceType: document.getElementById("serviceType"),
  businessName: document.getElementById("businessName"),
  message: document.getElementById("message"),
};

const contactFormFields = {
  fullName: document.getElementById("contactFullName"),
  email: document.getElementById("contactEmail"),
  phone: document.getElementById("contactPhone"),
  serviceType: document.getElementById("contactServiceType"),
  businessName: document.getElementById("contactBusinessName"),
  message: document.getElementById("contactMessage"),
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
  if (!modal) return;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("body-lock");

  setTimeout(() => {
    if (modalFormFields.fullName) {
      modalFormFields.fullName.focus();
    }
  }, 150);
}

function closeModal() {
  if (!modal) return;

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
  if (event.key === "Escape" && modal && modal.classList.contains("show")) {
    closeModal();
  }
});

/* FAQ toggle */
const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
  const question = item.querySelector(".faq-question");

  if (!question) return;

  question.addEventListener("click", () => {
    const isActive = item.classList.contains("active");

    faqItems.forEach((faqItem) => {
      faqItem.classList.remove("active");
    });

    if (!isActive) {
      item.classList.add("active");
    }
  });
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

function bindLiveValidation(fieldsObject) {
  Object.entries(fieldsObject).forEach(([fieldName, field]) => {
    if (!field) return;

    field.addEventListener("input", () => {
      validateField(fieldName, field);
    });

    field.addEventListener("blur", () => {
      validateField(fieldName, field);
    });
  });
}

/* UTM tracking */
function getUTMData() {
  const params = new URLSearchParams(window.location.search);

  return {
    source: params.get("utm_source") || "direct",
    campaign: params.get("utm_campaign") || "",
    medium: params.get("utm_medium") || "",
  };
}

function buildPayload(fieldsObject) {
  const utm = getUTMData();

  return {
    fullName: fieldsObject.fullName.value.trim(),
    email: fieldsObject.email.value.trim(),
    phone: fieldsObject.phone.value.trim(),
    serviceType: fieldsObject.serviceType.value.trim(),
    businessName: fieldsObject.businessName.value.trim(),
    message: fieldsObject.message.value.trim(),
    source: utm.source,
    campaign: utm.campaign,
    medium: utm.medium,
    pageUrl: window.location.href,
  };
}

async function submitToGoogleSheet(payload) {
  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  const resultText = await response.text();

  try {
    return JSON.parse(resultText);
  } catch (error) {
    return {
      status: "success",
      message: "Lead submitted",
    };
  }
}

function handleFormSubmit(form, fieldsObject, successBox, onSuccess) {
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    let isFormValid = true;

    Object.entries(fieldsObject).forEach(([fieldName, field]) => {
      const valid = validateField(fieldName, field);
      if (!valid) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      successBox.classList.remove("show");
      successBox.textContent = "";
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : "";

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
      }

      const payload = buildPayload(fieldsObject);
      const result = await submitToGoogleSheet(payload);

      if (result.status !== "success") {
        throw new Error(result.message || "Submission failed");
      }

      successBox.textContent = "Thank you! Your requirement has been submitted successfully.";
      successBox.classList.add("show");

      form.reset();

      Object.values(fieldsObject).forEach((field) => {
        clearError(field);
      });

      if (typeof onSuccess === "function") {
        onSuccess(successBox);
      }
    } catch (error) {
      console.error("Google Sheet submission error:", error);
      successBox.textContent = "Something went wrong. Please try again.";
      successBox.classList.add("show");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
}

bindLiveValidation(modalFormFields);
bindLiveValidation(contactFormFields);

handleFormSubmit(leadForm, modalFormFields, successMessage, () => {
  setTimeout(() => {
    window.location.href = "thankyou.html";
  }, 1200);
});

handleFormSubmit(contactForm, contactFormFields, contactSuccessMessage, () => {
  setTimeout(() => {
    window.location.href = "thankyou.html";
  }, 1200);
});
