"use strict";

// -- GLOBAL --

const MAX_CHARS = 150;
const API_URL = "https://bytegrad.com/course-assets/js/1/api";

const textareaEl = document.querySelector(".form__textarea");
const counterEl = document.querySelector(".counter");
const formEl = document.querySelector(".form");
const feedbackListEl = document.querySelector(".feedbacks");
const submitBtn = document.querySelector(".submit-btn");
const spinnerEl = document.querySelector(".spinner");
const hashtagListEl = document.querySelector(".hashtags");

// -- FEEDBACK ITEM RENDERING --

/**
 * Create HTML for a feedback item
 */
const createFeedbackHTML = (feedbackItem) => `
  <li class="feedback">
    <button class="upvote">
      <i class="fa-solid fa-caret-up upvote__icon"></i>
      <span class="upvote__count">${feedbackItem.upvoteCount}</span>
    </button>
    <section class="feedback__badge">
      <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
    </section>
    <div class="feedback__content">
      <p class="feedback__company">${feedbackItem.company}</p>
      <p class="feedback__text">${feedbackItem.text}</p>
    </div>
    <p class="feedback__date">${
      feedbackItem.daysAgo === 0 ? "NEW" : `${feedbackItem.daysAgo}d`
    }</p>
  </li>
`;

/**
 * Render a feedback item
 */
const renderFeedbackItem = (feedbackItem) => {
  const feedbackItemHTML = createFeedbackHTML(feedbackItem);
  feedbackListEl.insertAdjacentHTML("beforeend", feedbackItemHTML);
};

// -- COUNTER COMPONENT --

/**
 * Update the character counter
 */
const updateCounter = () => {
  const nrCharsTyped = textareaEl.value.length;
  const charsLeft = MAX_CHARS - nrCharsTyped;
  counterEl.textContent = charsLeft;
};

textareaEl.addEventListener("input", updateCounter);

// -- FORM COMPONENT --

/**
 * Show a visual indicator for form validity
 */
const showVisualIndicator = (isValid) => {
  const className = isValid ? "form--valid" : "form--invalid";
  formEl.classList.add(className);
  setTimeout(() => formEl.classList.remove(className), 2000);
};

/**
 * Check if the input text is valid
 */
const isValidText = (text) => text.includes("#") && text.trim().length >= 5;

/**
 * Extract feedback data from the input text
 */
const extractFeedbackData = (text) => {
  const hashtag = text.split(" ").find((word) => word.includes("#"));
  const company = hashtag.substring(1);
  return {
    company,
    badgeLetter: company[0].toUpperCase(),
    upvoteCount: 0,
    daysAgo: 0,
    text,
  };
};

/**
 * Submit feedback to the server
 */
const submitFeedback = async (feedbackItem) => {
  try {
    const response = await fetch(`${API_URL}/feedbacks`, {
      method: "POST",
      body: JSON.stringify(feedbackItem),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Something went wrong");
    console.log("Successfully submitted");
  } catch (error) {
    console.error(error);
  }
};

/**
 * Clear the form
 */
const clearForm = () => {
  textareaEl.value = "";
  submitBtn.blur();
  counterEl.textContent = MAX_CHARS;
};

/**
 * Handle form submission
 */
const submitHandler = (e) => {
  e.preventDefault();
  const text = textareaEl.value;
  if (!isValidText(text)) {
    showVisualIndicator(false);
    return;
  }
  showVisualIndicator(true);
  const feedbackItem = extractFeedbackData(text);
  renderFeedbackItem(feedbackItem);
  submitFeedback(feedbackItem);
  clearForm();
};

formEl.addEventListener("submit", submitHandler);

// -- FEEDBACK LIST COMPONENT --

/**
 * Increment upvote count
 */
const incrementUpvote = (upvoteBtnEl) => {
  const upvoteCountEl = upvoteBtnEl.querySelector(".upvote__count");
  upvoteCountEl.textContent = +upvoteCountEl.textContent + 1;
};

/**
 * Handle feedback item click
 */
const handleFeedbackClick = (e) => {
  const clickedEl = e.target;
  const upvoteBtnEl = clickedEl.closest(".upvote");
  if (upvoteBtnEl) {
    upvoteBtnEl.disabled = true;
    incrementUpvote(upvoteBtnEl);
  } else {
    clickedEl.closest(".feedback").classList.toggle("feedback--expand");
  }
};

feedbackListEl.addEventListener("click", handleFeedbackClick);

/**
 * Fetch and display feedback items from the server
 */
const fetchFeedbackItems = async () => {
  try {
    const response = await fetch(`${API_URL}/feedbacks`);
    if (!response.ok) throw new Error("Failed to fetch feedback items");
    const data = await response.json();
    spinnerEl.remove();
    data.feedbacks.forEach(renderFeedbackItem);
  } catch (error) {
    feedbackListEl.textContent = `Failed to fetch Feedback Items. Error message: ${error.message}`;
  }
};

fetchFeedbackItems();

// -- HASHTAG LIST COMPONENT --

/**
 * Filter feedback items by company name
 */
const filterFeedbackItemsByCompany = (companyName) => {
  feedbackListEl.childNodes.forEach((childNode) => {
    if (childNode.nodeType === 3) return;
    const feedbackCompany = childNode
      .querySelector(".feedback__company")
      .textContent.toLowerCase()
      .trim();
    if (companyName !== feedbackCompany) childNode.remove();
  });
};

/**
 * Handle hashtag click
 */
const handleHashtagClick = (e) => {
  const clickedEl = e.target;
  if (clickedEl.className === "hashtags") return;
  const companyName = clickedEl.textContent.substring(1).toLowerCase().trim();
  filterFeedbackItemsByCompany(companyName);
};

hashtagListEl.addEventListener("click", handleHashtagClick);
