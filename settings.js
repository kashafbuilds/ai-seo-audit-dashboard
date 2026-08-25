// ========================================
// AI SEO Audit Dashboard - Settings Page
// ========================================

const STORAGE_KEY = 'seoAuditSettings';

// DOM Elements
const settingsForm = document.getElementById('settingsForm');
const saveStatus = document.getElementById('saveStatus');
const resetSettingsBtn = document.getElementById('resetSettingsBtn');

const websiteUrlInput = document.getElementById('websiteUrl');
const crawlDepthInput = document.getElementById('crawlDepth');
const alertEmailInput = document.getElementById('alertEmail');
const webhookUrlInput = document.getElementById('webhookUrl');

const qualityThresholdInput = document.getElementById('qualityThreshold');
const qualityThresholdValue = document.getElementById('qualityThresholdValue');

const apiKeyInput = document.getElementById('apiKey');
const toggleApiKeyBtn = document.getElementById('toggleApiKeyBtn');

const keywordInput = document.getElementById('keywordInput');
const addKeywordBtn = document.getElementById('addKeywordBtn');
const keywordsList = document.getElementById('keywordsList');
const keywordsError = document.getElementById('keywords-error');

const competitorInput = document.getElementById('competitorInput');
const addCompetitorBtn = document.getElementById('addCompetitorBtn');
const competitorsList = document.getElementById('competitorsList');
const competitorsError = document.getElementById('competitors-error');

let focusKeywords = [];
let competitorUrls = [];

// ========================================
// Utility: URL / Email validation
// ========================================

function isValidUrl(value) {
    if (!value || !value.trim()) return false;
    let candidate = value.trim();
    if (!/^https?:\/\//i.test(candidate)) {
        candidate = 'https://' + candidate;
    }
    try {
        const parsed = new URL(candidate);
        return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && !!parsed.hostname && parsed.hostname.includes('.');
    } catch (error) {
        return false;
    }
}

function isValidEmail(value) {
    if (!value || !value.trim()) return false;
    // Reasonably strict, dependency-free email check.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value.trim());
}

// ========================================
// Field error helpers
// ========================================

function setFieldError(inputEl, errorEl, message) {
    const row = inputEl.closest('.form-row');
    if (errorEl) errorEl.textContent = message || '';
    if (row) {
        if (message) {
            row.classList.add('has-error');
        } else {
            row.classList.remove('has-error');
        }
    }
    if (inputEl) {
        inputEl.setAttribute('aria-invalid', message ? 'true' : 'false');
    }
}

function clearAllErrors() {
    document.querySelectorAll('.field-error').forEach((el) => { el.textContent = ''; });
    document.querySelectorAll('.form-row.has-error').forEach((el) => el.classList.remove('has-error'));
    document.querySelectorAll('[aria-invalid="true"]').forEach((el) => el.setAttribute('aria-invalid', 'false'));
}

function showSaveStatus(type, message) {
    saveStatus.classList.remove('hidden', 'success', 'error');
    saveStatus.classList.add(type);
    saveStatus.textContent = message;
}

function hideSaveStatus() {
    saveStatus.classList.add('hidden');
    saveStatus.textContent = '';
}

// ========================================
// Dynamic list rendering (focus keywords / competitor URLs)
// ========================================

function renderDynamicList(listEl, items, kind) {
    listEl.innerHTML = '';
    items.forEach((value, index) => {
        const li = document.createElement('li');

        const span = document.createElement('span');
        span.className = 'item-text';
        span.textContent = value;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.setAttribute('aria-label', `Remove ${kind} "${value}"`);
        removeBtn.textContent = '✕';
        removeBtn.addEventListener('click', () => {
            items.splice(index, 1);
            renderDynamicList(listEl, items, kind);
        });

        li.appendChild(span);
        li.appendChild(removeBtn);
        listEl.appendChild(li);
    });
}

function addKeyword() {
    const value = keywordInput.value.trim();
    if (!value) {
        keywordsError.textContent = 'Enter a keyword before adding it.';
        keywordInput.focus();
        return;
    }
    if (focusKeywords.some((k) => k.toLowerCase() === value.toLowerCase())) {
        keywordsError.textContent = 'That keyword has already been added.';
        keywordInput.focus();
        return;
    }
    keywordsError.textContent = '';
    focusKeywords.push(value);
    renderDynamicList(keywordsList, focusKeywords, 'keyword');
    keywordInput.value = '';
    keywordInput.focus();
}

function addCompetitor() {
    const value = competitorInput.value.trim();
    if (!value) {
        competitorsError.textContent = 'Enter a competitor URL before adding it.';
        competitorInput.focus();
        return;
    }
    if (!isValidUrl(value)) {
        competitorsError.textContent = 'Enter a valid URL (e.g. https://competitor.com).';
        competitorInput.focus();
        return;
    }
    if (competitorUrls.some((u) => u.toLowerCase() === value.toLowerCase())) {
        competitorsError.textContent = 'That competitor URL has already been added.';
        competitorInput.focus();
        return;
    }
    competitorsError.textContent = '';
    competitorUrls.push(value);
    renderDynamicList(competitorsList, competitorUrls, 'competitor URL');
    competitorInput.value = '';
    competitorInput.focus();
}

addKeywordBtn.addEventListener('click', addKeyword);
addCompetitorBtn.addEventListener('click', addCompetitor);

// Allow Enter key inside the add-item text inputs without submitting the whole form
keywordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addKeyword();
    }
});
competitorInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addCompetitor();
    }
});

// ========================================
// Quality threshold live output
// ========================================

qualityThresholdInput.addEventListener('input', () => {
    qualityThresholdValue.textContent = qualityThresholdInput.value;
});

// ========================================
// API key show / hide
// ========================================

toggleApiKeyBtn.addEventListener('click', () => {
    const isHidden = apiKeyInput.type === 'password';
    apiKeyInput.type = isHidden ? 'text' : 'password';
    toggleApiKeyBtn.setAttribute('aria-pressed', String(isHidden));
    toggleApiKeyBtn.setAttribute('aria-label', isHidden ? 'Hide API key' : 'Show API key');
    toggleApiKeyBtn.textContent = '';
    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = isHidden ? '🙈' : '👁';
    toggleApiKeyBtn.appendChild(icon);
});

// ========================================
// Toggle switch state text (avoid relying on color alone)
// ========================================

function syncToggleStateText(checkbox) {
    const stateEl = document.querySelector(`.toggle-state[data-for="${checkbox.id}"]`);
    if (stateEl) {
        stateEl.textContent = checkbox.checked ? 'On' : 'Off';
    }
}

document.querySelectorAll('.toggle-input').forEach((checkbox) => {
    checkbox.addEventListener('change', () => syncToggleStateText(checkbox));
});

// ========================================
// Validation
// ========================================

function validateForm() {
    clearAllErrors();
    let isValid = true;
    let firstInvalidField = null;

    // Website URL - required
    if (!websiteUrlInput.value.trim()) {
        setFieldError(websiteUrlInput, document.getElementById('websiteUrl-error'), 'Website URL is required.');
        isValid = false;
        firstInvalidField = firstInvalidField || websiteUrlInput;
    } else if (!isValidUrl(websiteUrlInput.value)) {
        setFieldError(websiteUrlInput, document.getElementById('websiteUrl-error'), 'Enter a valid URL, e.g. https://example.com.');
        isValid = false;
        firstInvalidField = firstInvalidField || websiteUrlInput;
    }

    // Crawl depth - required, 1-10
    const depthValue = Number(crawlDepthInput.value);
    if (!crawlDepthInput.value.trim() || Number.isNaN(depthValue) || depthValue < 1 || depthValue > 10 || !Number.isInteger(depthValue)) {
        setFieldError(crawlDepthInput, document.getElementById('crawlDepth-error'), 'Crawl depth must be a whole number between 1 and 10.');
        isValid = false;
        firstInvalidField = firstInvalidField || crawlDepthInput;
    }

    // Alert email - optional, but must be valid if provided
    if (alertEmailInput.value.trim() && !isValidEmail(alertEmailInput.value)) {
        setFieldError(alertEmailInput, document.getElementById('alertEmail-error'), 'Enter a valid email address.');
        isValid = false;
        firstInvalidField = firstInvalidField || alertEmailInput;
    }

    // Webhook URL - optional, but must be valid if provided
    if (webhookUrlInput.value.trim() && !isValidUrl(webhookUrlInput.value)) {
        setFieldError(webhookUrlInput, document.getElementById('webhookUrl-error'), 'Enter a valid webhook URL.');
        isValid = false;
        firstInvalidField = firstInvalidField || webhookUrlInput;
    }

    if (firstInvalidField) {
        firstInvalidField.focus();
    }

    return isValid;
}

// ========================================
// Save / Load
// ========================================

function collectFormData() {
    return {
        websiteUrl: websiteUrlInput.value.trim(),
        crawlFrequency: document.getElementById('crawlFrequency').value,
        crawlDepth: Number(crawlDepthInput.value),
        includeSubdomains: document.getElementById('includeSubdomains').checked,
        respectRobots: document.getElementById('respectRobots').checked,
        aiModel: document.getElementById('aiModel').value,
        qualityThreshold: Number(qualityThresholdInput.value),
        focusKeywords: [...focusKeywords],
        competitorUrls: [...competitorUrls],
        alertEmail: alertEmailInput.value.trim(),
        criticalAlerts: document.getElementById('criticalAlerts').checked,
        weeklySummary: document.getElementById('weeklySummary').checked,
        apiKey: apiKeyInput.value,
        webhookUrl: webhookUrlInput.value.trim(),
        reportFormat: document.getElementById('reportFormat').value,
        pageScreenshots: document.getElementById('pageScreenshots').checked,
        whiteLabel: document.getElementById('whiteLabel').checked
    };
}

function applyFormData(data) {
    if (!data) return;
    if (data.websiteUrl) websiteUrlInput.value = data.websiteUrl;
    if (data.crawlFrequency) document.getElementById('crawlFrequency').value = data.crawlFrequency;
    if (data.crawlDepth) crawlDepthInput.value = data.crawlDepth;
    document.getElementById('includeSubdomains').checked = !!data.includeSubdomains;
    document.getElementById('respectRobots').checked = data.respectRobots !== false;
    if (data.aiModel) document.getElementById('aiModel').value = data.aiModel;
    if (data.qualityThreshold !== undefined) {
        qualityThresholdInput.value = data.qualityThreshold;
        qualityThresholdValue.textContent = data.qualityThreshold;
    }
    focusKeywords = Array.isArray(data.focusKeywords) ? [...data.focusKeywords] : [];
    competitorUrls = Array.isArray(data.competitorUrls) ? [...data.competitorUrls] : [];
    renderDynamicList(keywordsList, focusKeywords, 'keyword');
    renderDynamicList(competitorsList, competitorUrls, 'competitor URL');
    if (data.alertEmail) alertEmailInput.value = data.alertEmail;
    document.getElementById('criticalAlerts').checked = data.criticalAlerts !== false;
    document.getElementById('weeklySummary').checked = data.weeklySummary !== false;
    if (data.apiKey) apiKeyInput.value = data.apiKey;
    if (data.webhookUrl) webhookUrlInput.value = data.webhookUrl;
    if (data.reportFormat) document.getElementById('reportFormat').value = data.reportFormat;
    document.getElementById('pageScreenshots').checked = !!data.pageScreenshots;
    document.getElementById('whiteLabel').checked = !!data.whiteLabel;

    document.querySelectorAll('.toggle-input').forEach(syncToggleStateText);
}

function loadSavedSettings() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        applyFormData(data);
    } catch (error) {
        console.error('Could not load saved settings:', error);
    }
}

function saveSettings(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Could not save settings:', error);
        return false;
    }
}

// ========================================
// Form submit
// ========================================

settingsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    hideSaveStatus();

    const isValid = validateForm();

    if (!isValid) {
        showSaveStatus('error', 'Some fields need attention before settings can be saved. Review the highlighted fields below.');
        return;
    }

    const data = collectFormData();
    const saved = saveSettings(data);

    if (saved) {
        showSaveStatus('success', 'Settings saved successfully.');
    } else {
        showSaveStatus('error', 'Settings could not be saved. Please try again.');
    }
});

// ========================================
// Reset to defaults
// ========================================

resetSettingsBtn.addEventListener('click', () => {
    const confirmed = window.confirm('Reset all settings to their defaults? This cannot be undone.');
    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEY);
    settingsForm.reset();
    focusKeywords = [];
    competitorUrls = [];
    renderDynamicList(keywordsList, focusKeywords, 'keyword');
    renderDynamicList(competitorsList, competitorUrls, 'competitor URL');
    qualityThresholdValue.textContent = qualityThresholdInput.value;
    apiKeyInput.type = 'password';
    toggleApiKeyBtn.setAttribute('aria-pressed', 'false');
    toggleApiKeyBtn.setAttribute('aria-label', 'Show API key');
    clearAllErrors();
    document.querySelectorAll('.toggle-input').forEach(syncToggleStateText);
    showSaveStatus('success', 'Settings reset to defaults.');
    websiteUrlInput.focus();
});

// ========================================
// Init
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    loadSavedSettings();
    document.querySelectorAll('.toggle-input').forEach(syncToggleStateText);
    websiteUrlInput.focus();
});