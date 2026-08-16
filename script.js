// ========================================
// AI SEO Audit Dashboard - JavaScript
// ========================================

// DOM Elements
const auditForm = document.getElementById('auditForm');
const urlInput = document.getElementById('urlInput');
const loadingState = document.getElementById('loadingState');
const resultsSection = document.getElementById('resultsSection');
const emptyState = document.getElementById('emptyState');
const newAuditBtn = document.getElementById('newAuditBtn');
const downloadReportBtn = document.getElementById('downloadReportBtn');

// Event Listeners
auditForm.addEventListener('submit', handleAuditSubmit);
newAuditBtn.addEventListener('click', resetAudit);
downloadReportBtn.addEventListener('click', downloadReport);

/**
 * Call the real backend API to perform SEO audit
 */
async function performAudit(url) {
    try {
        const response = await fetch('/api/audit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to perform audit');
        }

        return result.data;
    } catch (error) {
        throw error;
    }
}

// Handle Form Submission
async function handleAuditSubmit(e) {
    e.preventDefault();

    const url = urlInput.value.trim();

    if (!url) {
        alert('Please enter a valid URL');
        return;
    }

    // Show loading state
    emptyState.classList.add('hidden');
    resultsSection.classList.add('hidden');
    loadingState.classList.remove('hidden');

    try {
        // Call real backend API
        const auditData = await performAudit(url);
        displayResults(auditData);
    } catch (error) {
        loadingState.classList.add('hidden');
        emptyState.classList.remove('hidden');
        alert(`Error performing audit: ${error.message}`);
        console.error('Audit error:', error);
    }
}

// Display Results
function displayResults(data) {
    loadingState.classList.add('hidden');
    resultsSection.classList.remove('hidden');

    const normalizedIssues = data && data.issues ? data.issues : { total: 0, critical: 0, warning: 0, info: 0, items: [] };
    const safeIssueItems = Array.isArray(normalizedIssues.items) ? normalizedIssues.items : [];
    data.issues = {
        total: Number(normalizedIssues.total ?? safeIssueItems.length ?? 0),
        critical: Number(normalizedIssues.critical ?? 0),
        warning: Number(normalizedIssues.warning ?? 0),
        info: Number(normalizedIssues.info ?? 0),
        items: safeIssueItems
    };

    // Use real scores from backend (all based on actual measured data)
    const technicalScore = data.technicalScore || 0;
    const onPageScore = data.onPageScore || 0;
    const performanceScore = data.performanceScore || 0;
    const overallScore = data.overallScore || 0;

    // Update overall score
    const scoreElement = document.getElementById('overallScore');
    scoreElement.textContent = '0';
    animateCounter(scoreElement, overallScore, 1000);

    // Update score summary
    let summary = 'Your website SEO analysis is complete. ';
    if (overallScore >= 80) {
        summary = 'Your website has excellent SEO! ';
    } else if (overallScore >= 60) {
        summary = 'Your website needs some SEO improvements. ';
    } else {
        summary = 'Your website requires significant SEO improvements. ';
    }
    document.getElementById('scoreSummary').textContent = summary + `Last analyzed: ${data.timestamp}`;

    // Update progress bars
    updateProgressBar('technicalProgress', technicalScore);
    updateProgressBar('onPageProgress', onPageScore);
    updateProgressBar('performanceProgress', performanceScore);

    // Update badges
    document.getElementById('technicalBadge').textContent = `${technicalScore}/100`;
    document.getElementById('onPageBadge').textContent = `${onPageScore}/100`;
    document.getElementById('performanceBadge').textContent = `${performanceScore}/100`;

    // Display real performance metrics from backend
    displayPerformanceMetrics(data);

    // Display real technical results from backend
    displayTechnicalResults(data);
    
    // Display on-page results from metadata
    displayOnPageResults(data);
    
    // Display mobile results from metadata
    displayMobileResults(data);

    // Display dynamic recommendations from actual findings
    displayRecommendations(data);

    // Scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    // Store current audit data for download
    window.currentAuditData = {
        url: data.url,
        timestamp: data.timestamp,
        technicalScore: technicalScore,
        onPageScore: onPageScore,
        performanceScore: performanceScore,
        overallScore: overallScore,
        metadata: data.metadata,
        technicalResults: data.technicalResults,
        issues: data.issues || { total: 0, critical: 0, warning: 0, info: 0, items: [] }
    };
}

// Animate Counter
function animateCounter(element, end, duration) {
    let current = 0;
    const increment = end / (duration / 50);
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 50);
}

// Update Progress Bar
function updateProgressBar(elementId, percentage) {
    const bar = document.getElementById(elementId);
    setTimeout(() => {
        bar.style.width = percentage + '%';
    }, 100);
}

// Display real performance metrics from backend
function displayPerformanceMetrics(data) {
    const metadata = data.metadata || {};
    const perfMetrics = metadata.performanceMetrics || {};

    // Update Performance Metrics section with real measurements
    if (perfMetrics.responseTimeMs !== undefined) {
        document.getElementById('pageLoadTime').textContent = `${perfMetrics.responseTimeMs}ms`;
    } else {
        document.getElementById('pageLoadTime').textContent = 'N/A';
    }
    
    if (perfMetrics.htmlDocumentSize !== undefined) {
        document.getElementById('lcp').textContent = perfMetrics.htmlDocumentSize;
    } else {
        document.getElementById('lcp').textContent = 'N/A';
    }
    
    if (perfMetrics.totalImages !== undefined) {
        document.getElementById('fid').textContent = `${perfMetrics.totalImages} images`;
    } else {
        document.getElementById('fid').textContent = 'N/A';
    }
    
    if (perfMetrics.imagesWithoutAlt !== undefined) {
        document.getElementById('cls').textContent = `${perfMetrics.imagesWithoutAlt} missing alt`;
    } else {
        document.getElementById('cls').textContent = 'N/A';
    }
}

// Display real technical results from backend
function displayTechnicalResults(data) {
    const container = document.getElementById('technicalResults');
    
    if (data.technicalResults && Array.isArray(data.technicalResults)) {
        renderResultsList(container, data.technicalResults);
    } else {
        renderResultsList(container, [
            { status: 'warning', text: 'No technical results available' }
        ]);
    }
}

// Display on-page results based on metadata
function displayOnPageResults(data) {
    const container = document.getElementById('onPageResults');
    const metadata = data && data.metadata ? data.metadata : {};
    const titleAnalysis = metadata.titleAnalysis || {};
    const descriptionAnalysis = metadata.descriptionAnalysis || {};
    const content = metadata.content || {};
    const headings = metadata.headings || {};
    const links = metadata.links || {};
    const images = metadata.images || {};

    const safeValue = (value, fallback = 'N/A') => {
        if (value === null || value === undefined || value === '') return fallback;
        return String(value);
    };

    const results = [];

    const titleText = safeValue(titleAnalysis.text || metadata.title, 'No title text available');
    const titleStatus = safeValue(titleAnalysis.status, metadata.titleLength === 0 ? 'missing' : 'unknown');
    const titleLength = Number(metadata.titleLength || titleAnalysis.length || 0);

    results.push({
        status: !titleAnalysis.exists ? 'error' : titleAnalysis.status === 'optimal' ? 'pass' : 'warning',
        text: `Title: ${titleStatus} (${titleLength} chars) | ${titleText}`
    });

    const descriptionText = safeValue(descriptionAnalysis.text || metadata.metaDescription, 'No description text available');
    const descriptionStatus = safeValue(descriptionAnalysis.status, metadata.descriptionLength === 0 ? 'missing' : 'unknown');
    const descriptionLength = Number(metadata.descriptionLength || descriptionAnalysis.length || 0);

    results.push({
        status: !descriptionAnalysis.exists ? 'error' : descriptionAnalysis.status === 'optimal' ? 'pass' : 'warning',
        text: `Meta description: ${descriptionStatus} (${descriptionLength} chars) | ${descriptionText}`
    });

    results.push({
        status: 'pass',
        text: `Content: ${safeValue(content.wordCount, 0)} words | ${safeValue(content.characterCount, 0)} chars | ${safeValue(content.paragraphCount, 0)} paragraphs | ${safeValue(content.lengthCategory, 'unknown')}`
    });

    const h1Count = Number(headings.h1 || 0);
    const h2Count = Number(headings.h2 || 0);
    const h3Count = Number(headings.h3 || 0);
    const h4Count = Number(headings.h4 || 0);
    const h5Count = Number(headings.h5 || 0);
    const h6Count = Number(headings.h6 || 0);
    const hierarchyIssues = Array.isArray(headings.issues) ? headings.issues : [];

    results.push({
        status: hierarchyIssues.length ? 'warning' : 'pass',
        text: `Headings: H1 ${h1Count} | H2 ${h2Count} | H3 ${h3Count} | H4 ${h4Count} | H5 ${h5Count} | H6 ${h6Count} | hierarchy: ${hierarchyIssues.length ? 'issues detected' : 'clean'}`
    });

    const totalLinks = Number(links.totalLinks || 0);
    const internalLinks = Number(links.internalLinks || 0);
    const externalLinks = Number(links.externalLinks || 0);
    const emptyHrefLinks = Number(links.emptyHrefLinks || 0);
    const hashLinks = Number(links.hashLinks || 0);

    results.push({
        status: totalLinks > 0 ? 'pass' : 'info',
        text: `Links: ${totalLinks} total | ${internalLinks} internal | ${externalLinks} external | ${emptyHrefLinks} empty | ${hashLinks} hash links`
    });

    const totalImages = Number(images.totalImages || 0);
    const imagesWithAlt = Number(images.imagesWithAlt || 0);
    const imagesMissingAlt = Number(images.imagesMissingAlt || 0);
    const imagesWithEmptyAlt = Number(images.imagesWithEmptyAlt || 0);
    const modernFormats = Number(images.modernFormats || 0);

    results.push({
        status: imagesMissingAlt > 0 ? 'warning' : 'pass',
        text: `Images: ${totalImages} total | ${imagesWithAlt} with alt | ${imagesMissingAlt} missing alt | ${imagesWithEmptyAlt} empty alt | WebP/AVIF: ${modernFormats}`
    });

    const canonicalStatus = metadata.hasCanonical ? 'present' : 'missing';
    const canonicalWarning = metadata.multipleCanonicalTags ? 'multiple canonical tags detected' : '';
    results.push({
        status: metadata.hasCanonical ? 'pass' : 'info',
        text: `Canonical: ${canonicalStatus}${canonicalWarning ? ` | ${canonicalWarning}` : ''}`
    });

    if (!container) return;
    renderResultsList(container, results);
}

function generateRecommendations(data) {
    const metadata = data && data.metadata ? data.metadata : {};
    const titleAnalysis = metadata.titleAnalysis || {};
    const descriptionAnalysis = metadata.descriptionAnalysis || {};
    const headings = metadata.headings || {};
    const links = metadata.links || {};
    const images = metadata.images || {};
    const content = metadata.content || {};
    const recommendations = [];

    if (!titleAnalysis.exists) {
        recommendations.push({
            severity: 'warning',
            title: 'Add a page title',
            description: 'Add a clear, unique title to describe the page topic and improve search visibility.'
        });
    } else if (titleAnalysis.multipleTitleTags) {
        recommendations.push({
            severity: 'warning',
            title: 'Keep exactly one title tag',
            description: 'This page has multiple title tags. Keep one clear title to avoid conflicting signals.'
        });
    }

    if (!descriptionAnalysis.exists) {
        recommendations.push({
            severity: 'warning',
            title: 'Add a meta description',
            description: 'Write a unique meta description to improve CTR and give search engines a useful summary.'
        });
    } else if (descriptionAnalysis.multipleDescriptions) {
        recommendations.push({
            severity: 'warning',
            title: 'Keep only one meta description',
            description: 'This page has multiple meta descriptions. Keep a single, high-quality summary.'
        });
    }

    if ((headings.h1 || 0) === 0) {
        recommendations.push({
            severity: 'critical',
            title: 'Add a primary H1',
            description: 'Add one clear H1 to define the main page topic for both users and search engines.'
        });
    } else if ((headings.h1 || 0) > 1) {
        recommendations.push({
            severity: 'warning',
            title: 'Use one primary H1',
            description: 'Multiple H1 headings can dilute the page topic. Keep a single primary heading.'
        });
    }

    if (Array.isArray(headings.issues) && headings.issues.length > 0) {
        recommendations.push({
            severity: 'warning',
            title: 'Fix heading hierarchy',
            description: 'The page has heading structure issues. Adjust the order so it follows a logical hierarchy.'
        });
    }

    if ((images.imagesMissingAlt || 0) > 0) {
        recommendations.push({
            severity: 'warning',
            title: 'Add alt text to images',
            description: 'Images without descriptive alt text reduce accessibility and can weaken SEO context.'
        });
    }

    if ((content.wordCount || 0) < 150) {
        recommendations.push({
            severity: 'info',
            title: 'Add more useful content',
            description: 'The page has very short content. Expand it with relevant, actionable information.'
        });
    }

    if ((links.internalLinks || 0) === 0 && (links.totalLinks || 0) > 0) {
        recommendations.push({
            severity: 'info',
            title: 'Add more internal links',
            description: 'This page has no internal links. Connect related pages to improve crawlability and navigation.'
        });
    }

    if (metadata.multipleCanonicalTags) {
        recommendations.push({
            severity: 'warning',
            title: 'Keep a single canonical tag',
            description: 'This page has multiple canonical tags. Keep only one canonical URL to avoid duplicate signal conflicts.'
        });
    }

    return recommendations;
}

function displayRecommendations(data) {
    const issueContainer = document.querySelector('.issues-container');
    if (!issueContainer) return;

    const issueSummary = data && data.issues ? data.issues : { total: 0, critical: 0, warning: 0, info: 0, items: [] };
    const issueItems = Array.isArray(issueSummary.items) ? issueSummary.items : [];
    const badge = document.getElementById('issueCount');
    if (badge) {
        badge.textContent = String(issueSummary.total ?? issueItems.length ?? 0);
    }

    if (!issueItems.length) {
        issueContainer.innerHTML = `
            <div class="issue-item issue-info">
                <div class="issue-header">
                    <span class="issue-severity">Info</span>
                    <h4>No major SEO issues detected.</h4>
                </div>
                <p class="issue-description">This page appears to be in good standing based on the real audit data collected from the live site.</p>
            </div>
        `;
        return;
    }

    const severityCounts = [
        { label: 'Critical', count: issueSummary.critical || 0 },
        { label: 'Warning', count: issueSummary.warning || 0 },
        { label: 'Info', count: issueSummary.info || 0 }
    ].filter(entry => entry.count > 0);

    const summaryMarkup = severityCounts.length
        ? `<div class="issue-summary" style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem;">
            ${severityCounts.map(({ label, count }) => `<span class="badge badge-${label === 'Critical' ? 'warning' : label === 'Warning' ? 'warning' : 'info'}" style="display:inline-flex;align-items:center;gap:0.35rem;">${label}: ${count}</span>`).join('')}
          </div>`
        : '';

    issueContainer.innerHTML = `
        ${summaryMarkup}
        ${issueItems.map((issue) => {
            const severity = issue.severity === 'critical' ? 'Critical' : issue.severity === 'warning' ? 'Warning' : 'Info';
            const className = issue.severity === 'critical' ? 'issue-critical' : issue.severity === 'warning' ? 'issue-warning' : 'issue-info';
            return `
                <div class="issue-item ${className}">
                    <div class="issue-header">
                        <span class="issue-severity">${severity}</span>
                        <h4>${issue.title}</h4>
                    </div>
                    <p class="issue-description">${issue.description}</p>
                    <p class="issue-recommendation"><strong>Recommendation:</strong> ${issue.recommendation}</p>
                </div>
            `;
        }).join('')}
    `;
}

// Display mobile results based on metadata
function displayMobileResults(data) {
    const container = document.getElementById('mobileResults');
    const results = [];
    const metadata = data.metadata || {};

    // Viewport check
    if (metadata.hasViewport) {
        results.push({ status: 'pass', text: 'Viewport meta tag configured' });
    } else {
        results.push({ status: 'warning', text: 'Missing viewport meta tag' });
    }

    // HTTPS check
    if (metadata.isHttps) {
        results.push({ status: 'pass', text: 'HTTPS/SSL enabled' });
    } else {
        results.push({ status: 'error', text: 'Not using HTTPS' });
    }

    // Open Graph check
    if (metadata.ogTitle && metadata.ogDescription) {
        results.push({ status: 'pass', text: 'Open Graph tags present' });
    } else {
        results.push({ status: 'warning', text: 'Open Graph tags missing' });
    }

    renderResultsList(container, results);
}

// Render Results List
function renderResultsList(container, results) {
    container.innerHTML = results.map(result => {
        let icon = '✓';
        let className = 'result-pass';
        
        if (result.status === 'error') {
            icon = '✕';
            className = 'result-error';
        } else if (result.status === 'warning') {
            icon = '⚠';
            className = 'result-warning';
        } else if (result.status === 'info') {
            icon = 'ℹ';
            className = 'result-info';
        }
        
        return `
            <li class="result-item ${className}">
                <span class="icon">${icon}</span>
                <span>${result.text}</span>
            </li>
        `;
    }).join('');
}

// Reset Audit
function resetAudit() {
    emptyState.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    loadingState.classList.add('hidden');
    urlInput.value = '';
    urlInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Download Report
function downloadReport() {
    if (!window.currentAuditData) return;

    const data = window.currentAuditData;
    const issueSummary = data && data.issues ? data.issues : { total: 0, critical: 0, warning: 0, info: 0, items: [] };
    const issueItems = Array.isArray(issueSummary.items) ? issueSummary.items : [];
    const issuesMarkup = issueItems.length
        ? issueItems.map((issue) => `
            <li>
                <strong>[${(issue.severity || 'info').toUpperCase()}]</strong> ${issue.title}
                <div>${issue.description}</div>
                <div><strong>Recommendation:</strong> ${issue.recommendation}</div>
            </li>
        `).join('')
        : '<li>No major SEO issues detected.</li>';

    let reportHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>SEO Audit Report - ${data.url}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 2rem; color: #333; }
        .header { border-bottom: 2px solid #0066cc; padding-bottom: 1rem; margin-bottom: 2rem; }
        .header h1 { color: #0066cc; margin: 0; }
        .section { margin-bottom: 2rem; page-break-inside: avoid; }
        .section h2 { color: #0066cc; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; }
        .score-box { background: #e6f0ff; padding: 1rem; border-radius: 0.5rem; text-align: center; }
        .score-value { font-size: 2.5rem; font-weight: bold; color: #0066cc; }
        .metric { margin: 0.5rem 0; }
        .metric-label { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background-color: #f9fafb; font-weight: bold; }
        .pass { color: #10b981; }
        .warning { color: #f59e0b; }
        .critical { color: #ef4444; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 AI SEO Audit Report</h1>
        <p><strong>Website:</strong> ${data.url}</p>
        <p><strong>Date:</strong> ${data.timestamp}</p>
    </div>

    <div class="section">
        <h2>Overall SEO Score</h2>
        <div class="score-box">
            <div class="score-value">${data.overallScore}</div>
            <p>out of 100</p>
        </div>
    </div>

    <div class="section">
        <h2>Score Breakdown</h2>
        <table>
            <tr>
                <th>Category</th>
                <th>Score</th>
                <th>Status</th>
            </tr>
            <tr>
                <td>Technical SEO</td>
                <td>${data.technicalScore}/100</td>
                <td class="${data.technicalScore >= 75 ? 'pass' : 'warning'}">
                    ${data.technicalScore >= 75 ? '✓ Good' : '⚠ Needs Improvement'}
                </td>
            </tr>
            <tr>
                <td>On-Page SEO</td>
                <td>${data.onPageScore}/100</td>
                <td class="${data.onPageScore >= 75 ? 'pass' : 'warning'}">
                    ${data.onPageScore >= 75 ? '✓ Good' : '⚠ Needs Improvement'}
                </td>
            </tr>
            <tr>
                <td>Performance</td>
                <td>${data.performanceScore}/100</td>
                <td class="${data.performanceScore >= 75 ? 'pass' : 'warning'}">
                    ${data.performanceScore >= 75 ? '✓ Good' : '⚠ Needs Improvement'}
                </td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h2>Performance Metrics</h2>
        <div class="metric">
            <span class="metric-label">Server Response Time:</span> ${data.metadata?.performanceMetrics?.responseTimeMs || 'N/A'}ms
        </div>
        <div class="metric">
            <span class="metric-label">HTML Document Size:</span> ${data.metadata?.performanceMetrics?.htmlDocumentSize || 'N/A'}
        </div>
        <div class="metric">
            <span class="metric-label">Total Images:</span> ${data.metadata?.performanceMetrics?.totalImages || 'N/A'}
        </div>
        <div class="metric">
            <span class="metric-label">Images Missing Alt Text:</span> ${data.metadata?.performanceMetrics?.imagesWithoutAlt || 'N/A'}
        </div>
    </div>

    <div class="section">
        <h2>Issues & Recommendations</h2>
        <ul>
            ${issuesMarkup}
        </ul>
    </div>

    <p style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; color: #999; font-size: 0.9rem;">
        Generated by AI SEO Audit Dashboard
    </p>
</body>
</html>
    `;

    // Create blob and download
    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SEO_Audit_Report_${new Date().getTime()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show feedback
    alert('Report downloaded successfully!');
}

// Initialize
console.log('AI SEO Audit Dashboard loaded');
document.addEventListener('DOMContentLoaded', () => {
    urlInput.focus();
});
