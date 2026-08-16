// ========================================
// AI SEO Audit Dashboard Backend Server
// ========================================

const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');
const path = require('path');
const url = require('url');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Enable CORS for frontend requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    next();
});

// ========================================
// Utility Functions
// ========================================

/**
 * Validate if URL is properly formatted
 */
function isValidUrl(urlString) {
    try {
        const urlObj = new URL(urlString);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (error) {
        return false;
    }
}

/**
 * Normalize URL (add https:// if missing)
 */
function normalizeUrl(urlString) {
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
        return 'https://' + urlString;
    }
    return urlString;
}

/**
 * Extract origin from URL (protocol + domain)
 */
function getOrigin(targetUrl) {
    try {
        const urlObj = new URL(targetUrl);
        return `${urlObj.protocol}//${urlObj.hostname}`;
    } catch (error) {
        return null;
    }
}

/**
 * Check robots.txt availability and validity
 */
async function checkRobotsTxt(targetUrl, timeoutMs = 5000) {
    const origin = getOrigin(targetUrl);
    if (!origin) {
        return {
            exists: false,
            accessible: false,
            status: null,
            hasSitemapDirective: false,
            content: null,
            error: 'Could not extract domain'
        };
    }

    const robotsUrl = `${origin}/robots.txt`;
    
    try {
        const response = await axios.get(robotsUrl, {
            timeout: timeoutMs,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            validateStatus: (status) => true // Accept all status codes
        });

        if (response.status === 200) {
            const content = response.data || '';
            const hasSitemapDirective = /^sitemap:/im.test(content);
            return {
                exists: true,
                accessible: true,
                status: response.status,
                hasSitemapDirective: hasSitemapDirective,
                content: content,
                error: null
            };
        } else if (response.status === 404) {
            return {
                exists: false,
                accessible: false,
                status: response.status,
                hasSitemapDirective: false,
                content: null,
                error: 'robots.txt not found (404)'
            };
        } else {
            return {
                exists: false,
                accessible: false,
                status: response.status,
                hasSitemapDirective: false,
                content: null,
                error: `robots.txt returned status ${response.status}`
            };
        }
    } catch (error) {
        return {
            exists: false,
            accessible: false,
            status: null,
            hasSitemapDirective: false,
            content: null,
            error: `Error fetching robots.txt: ${error.message}`
        };
    }
}

/**
 * Check sitemap.xml availability and validity
 */
async function checkSitemapXml(targetUrl, timeoutMs = 5000) {
    const origin = getOrigin(targetUrl);
    if (!origin) {
        return {
            exists: false,
            accessible: false,
            status: null,
            isValidXml: false,
            urlCount: 0,
            type: null,
            error: 'Could not extract domain'
        };
    }

    const sitemapUrl = `${origin}/sitemap.xml`;
    
    try {
        const response = await axios.get(sitemapUrl, {
            timeout: timeoutMs,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            validateStatus: (status) => true // Accept all status codes
        });

        if (response.status === 200) {
            const content = response.data || '';
            const contentType = response.headers['content-type'] || '';
            
            // Check if it's valid XML
            if (!contentType.includes('xml')) {
                return {
                    exists: true,
                    accessible: true,
                    status: response.status,
                    isValidXml: false,
                    urlCount: 0,
                    type: null,
                    error: 'Response is not XML format'
                };
            }

            try {
                // Try to parse as XML using Cheerio
                const $ = cheerio.load(content, { xmlMode: true });
                
                // Check for urlset (standard sitemap)
                if ($('urlset').length > 0) {
                    const urlCount = $('url').length;
                    return {
                        exists: true,
                        accessible: true,
                        status: response.status,
                        isValidXml: true,
                        urlCount: urlCount,
                        type: 'urlset',
                        error: null
                    };
                }
                
                // Check for sitemapindex (sitemap index)
                if ($('sitemapindex').length > 0) {
                    const sitemapCount = $('sitemap').length;
                    return {
                        exists: true,
                        accessible: true,
                        status: response.status,
                        isValidXml: true,
                        urlCount: sitemapCount,
                        type: 'sitemapindex',
                        error: null
                    };
                }

                // Invalid XML structure
                return {
                    exists: true,
                    accessible: true,
                    status: response.status,
                    isValidXml: false,
                    urlCount: 0,
                    type: null,
                    error: 'XML file does not contain valid sitemap structure'
                };
            } catch (parseError) {
                return {
                    exists: true,
                    accessible: true,
                    status: response.status,
                    isValidXml: false,
                    urlCount: 0,
                    type: null,
                    error: 'Failed to parse XML'
                };
            }
        } else if (response.status === 404) {
            return {
                exists: false,
                accessible: false,
                status: response.status,
                isValidXml: false,
                urlCount: 0,
                type: null,
                error: 'sitemap.xml not found (404)'
            };
        } else {
            return {
                exists: false,
                accessible: false,
                status: response.status,
                isValidXml: false,
                urlCount: 0,
                type: null,
                error: `sitemap.xml returned status ${response.status}`
            };
        }
    } catch (error) {
        return {
            exists: false,
            accessible: false,
            status: null,
            isValidXml: false,
            urlCount: 0,
            type: null,
            error: `Error fetching sitemap.xml: ${error.message}`
        };
    }
}

/**
 * Fetch HTML content from URL with timeout
 */
async function fetchWebsite(targetUrl, timeoutMs = 10000) {
    try {
        const response = await axios.get(targetUrl, {
            timeout: timeoutMs,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            validateStatus: (status) => status < 500 // Don't throw on 4xx errors, but handle them
        });

        // Check if content is HTML
        const contentType = response.headers['content-type'] || '';
        if (!contentType.includes('text/html')) {
            throw new Error('Response is not HTML content');
        }

        return response.data;
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout - website took too long to respond');
        }
        if (error.code === 'ENOTFOUND') {
            throw new Error('Website not found - invalid domain or DNS error');
        }
        if (error.code === 'ECONNREFUSED') {
            throw new Error('Connection refused - website is unreachable');
        }
        if (error.response && error.response.status === 404) {
            throw new Error('Website returned 404 - page not found');
        }
        if (error.response && error.response.status === 403) {
            throw new Error('Website returned 403 - access forbidden');
        }
        if (error.message.includes('not HTML')) {
            throw error;
        }
        throw new Error(`Failed to fetch website: ${error.message}`);
    }
}

/**
 * Build a deterministic issue list from the actual audit data only.
 */
function generateIssuesAndRecommendations(data) {
    const emptyResult = {
        total: 0,
        critical: 0,
        warning: 0,
        info: 0,
        items: []
    };

    if (!data || !data.metadata) {
        return {
            ...emptyResult,
            critical: 1,
            total: 1,
            items: [{
                severity: 'critical',
                title: 'Website cannot be analyzed',
                description: 'The audit could not collect enough real page data to assess the site accurately.',
                recommendation: 'Verify the URL, confirm the page is accessible, and rerun the audit.',
                category: 'technical'
            }]
        };
    }

    const metadata = data.metadata || {};
    const technicalResults = Array.isArray(data.technicalResults) ? data.technicalResults : [];
    const titleAnalysis = metadata.titleAnalysis || {};
    const descriptionAnalysis = metadata.descriptionAnalysis || {};
    const content = metadata.content || {};
    const headings = metadata.headings || {};
    const links = metadata.links || {};
    const images = metadata.images || {};
    const performanceMetrics = metadata.performanceMetrics || {};
    const robots = metadata.robots || {};
    const sitemap = metadata.sitemap || {};
    const itemList = [];

    const addIssue = (severity, title, description, recommendation, category) => {
        if (!severity || !title || !description || !recommendation || !category) {
            return;
        }
        itemList.push({
            severity,
            title,
            description,
            recommendation,
            category
        });
    };

    if (!titleAnalysis.exists) {
        addIssue(
            'critical',
            'Missing title tag',
            'This page does not have a title tag, which reduces search relevance and weakens click-through performance in results.',
            'Add a unique title tag between 30 and 60 characters that accurately describes the page topic.',
            'technical'
        );
    } else if (titleAnalysis.status === 'too short' || titleAnalysis.status === 'too long') {
        addIssue(
            'warning',
            'Title length is not optimized',
            `The title tag is ${titleAnalysis.length} characters long, which falls outside the preferred 30-60 character range for search results.`,
            'Refine the title to a concise, relevant value that balances clarity and length.',
            'on-page'
        );
    }

    if (!descriptionAnalysis.exists) {
        addIssue(
            'critical',
            'Missing meta description',
            'This page does not include a meta description, meaning search results will have less context and lower click-through potential.',
            'Add a unique meta description between 120 and 160 characters that summarizes the page value clearly.',
            'on-page'
        );
    } else if (descriptionAnalysis.status === 'too short' || descriptionAnalysis.status === 'too long') {
        addIssue(
            'warning',
            'Meta description length is not optimized',
            `The meta description is ${descriptionAnalysis.length} characters long, which is outside the recommended 120-160 character range.`,
            'Rewrite the description to highlight the page purpose, benefits, and key target keyword in a compact summary.',
            'on-page'
        );
    }

    if ((headings.h1 || 0) === 0) {
        addIssue(
            'critical',
            'Missing H1',
            'The page does not contain an H1 heading, which weakens the primary content hierarchy for users and search engines.',
            'Add one clear H1 that reflects the main topic and supports the page structure.',
            'on-page'
        );
    } else if ((headings.h1 || 0) > 1) {
        addIssue(
            'warning',
            'Multiple H1 tags',
            `This page has ${headings.h1} H1 tags, which can dilute the page topic and confuse the content hierarchy.`,
            'Keep a single primary H1 and use lower-level headings for supporting sections.',
            'on-page'
        );
    }

    const hasH2StructureIssue = ((headings.h2 || 0) === 0) && ((content.wordCount || 0) >= 150) && ((headings.h1 || 0) > 0);
    if (hasH2StructureIssue) {
        addIssue(
            'warning',
            'Missing H2 structure',
            'The page has enough content to benefit from section headings, but no H2 tags are present to structure the topic clearly.',
            'Add H2 headings to organize the content into logical sections and improve scannability.',
            'on-page'
        );
    }

    if (Array.isArray(headings.issues) && headings.issues.length > 0) {
        addIssue(
            'warning',
            'Heading hierarchy problems',
            'The heading structure contains skipped or inconsistent levels, which can reduce clarity for both users and crawlers.',
            'Reorder the heading levels so they follow a clean, logical progression from H1 to H2 to H3 as needed.',
            'on-page'
        );
    }

    if ((images.imagesMissingAlt || 0) > 0) {
        addIssue(
            'warning',
            'Images missing alt text',
            `${images.imagesMissingAlt} image(s) are missing alt text, which can reduce accessibility and weaken image relevance signals.`,
            'Add concise, descriptive alt text to all important images and leave decorative images with empty alt attributes if appropriate.',
            'technical'
        );
    }

    if ((links.totalLinks || 0) > 0 && (links.internalLinks || 0) === 0) {
        addIssue(
            'warning',
            'No internal links',
            'This page has links but none of them point to other pages within the same site, reducing internal navigation value.',
            'Add relevant internal links to related pages so users and crawlers can navigate the site more effectively.',
            'on-page'
        );
    }

    if (!metadata.isHttps) {
        addIssue(
            'critical',
            'HTTPS not enabled',
            'The page is not served over HTTPS, which weakens security and can negatively affect search trust.',
            'Enable SSL and redirect the site to the secure HTTPS version of the URL.',
            'technical'
        );
    }

    if ((performanceMetrics.responseTimeMs || 0) >= 2000) {
        addIssue(
            'warning',
            'Slow server response time',
            `The page responds in ${performanceMetrics.responseTimeMs}ms, which is slower than the preferred threshold for a smooth user experience.`,
            'Improve server performance by optimizing backend delivery, reducing unnecessary work, and tightening caching or asset efficiency.',
            'performance'
        );
    }

    if ((performanceMetrics.htmlSizeBytes || 0) >= 200000) {
        addIssue(
            'warning',
            'Large HTML document',
            `The page HTML is ${(performanceMetrics.htmlSizeBytes || 0).toLocaleString()} bytes, which is larger than the typical efficient range.`,
            'Trim unnecessary code, reduce inline bloat, and streamline the HTML structure to improve page performance.',
            'performance'
        );
    }

    if (!(robots.exists && robots.accessible)) {
        addIssue(
            'warning',
            'robots.txt missing or inaccessible',
            'The site does not expose a usable robots.txt file, which can reduce crawl guidance and indexing clarity.',
            'Create a valid robots.txt file at the site root and ensure it is accessible to search engines.',
            'technical'
        );
    }

    if (!(sitemap.exists && sitemap.accessible && sitemap.isValidXml)) {
        addIssue(
            'warning',
            'sitemap.xml missing or invalid',
            'The site does not provide a valid sitemap.xml, which can limit discoverability for crawlers and indexing coverage.',
            'Publish a valid sitemap.xml at the root domain and ensure it is accessible and correctly structured.',
            'technical'
        );
    }

    if (!metadata.hasCanonical) {
        addIssue(
            'info',
            'Missing canonical tag',
            'The page does not declare a canonical URL, which can allow duplicate content signals or ambiguous indexing.',
            'Add a canonical tag pointing to the preferred version of the page to consolidate duplicate content signals.',
            'technical'
        );
    }

    if (!metadata.ogTitle || !metadata.ogDescription) {
        addIssue(
            'warning',
            'Missing Open Graph tags',
            'The page is missing Open Graph metadata, which reduces social summary quality and sharing consistency.',
            'Add og:title and og:description tags to improve social previews and sharing context.',
            'on-page'
        );
    }

    if (!metadata.twitterCard) {
        addIssue(
            'info',
            'Twitter Card missing',
            'The page does not define a Twitter Card meta tag, so social previews may be less informative on Twitter/X.',
            'Add a Twitter Card tag such as summary or summary_large_image to improve social presentation.',
            'on-page'
        );
    }

    if (!metadata.hasStructuredData) {
        addIssue(
            'info',
            'Structured data not detected',
            'No JSON-LD structured data was detected on the page, which may limit rich result eligibility and content understanding.',
            'Add relevant JSON-LD schema markup to describe the page entity, content, and business details clearly.',
            'technical'
        );
    }

    const grouped = {
        critical: itemList.filter(item => item.severity === 'critical'),
        warning: itemList.filter(item => item.severity === 'warning'),
        info: itemList.filter(item => item.severity === 'info')
    };

    const sortedItems = [...grouped.critical, ...grouped.warning, ...grouped.info];
    const counts = {
        total: sortedItems.length,
        critical: grouped.critical.length,
        warning: grouped.warning.length,
        info: grouped.info.length
    };

    return {
        ...counts,
        items: sortedItems
    };
}

/**
 * Analyze webpage HTML and extract SEO metrics
 */
function analyzeSeoDB(html, targetUrl, responseTimeMs = 0, robotsData = {}, sitemapData = {}) {
    try {
        const $ = cheerio.load(html);

        // ========================================
        // Performance Metrics
        // ========================================
        const htmlSizeBytes = Buffer.byteLength(html, 'utf8');
        const htmlSizeKB = (htmlSizeBytes / 1024).toFixed(2);

        // ========================================
        // Extract SEO Metrics
        // ========================================

        // 1. HTTPS Check
        const isHttps = targetUrl.startsWith('https://');

        // 2. Page Title and title duplicates
        const titleElements = $('title');
        const titleExists = titleElements.length > 0;
        const title = titleExists ? titleElements.first().text().trim() : '';
        const titleLength = title.length;
        const multipleTitleTags = titleElements.length > 1;
        const titleStatus = !titleExists ? 'missing' : titleLength < 30 ? 'too short' : titleLength > 60 ? 'too long' : 'optimal';
        const titleOptimal = titleStatus === 'optimal';

        // 3. Meta Description analysis and duplicate detection
        const descriptionElements = $('meta[name="description"]');
        const descriptionExists = descriptionElements.length > 0;
        const metaDescription = descriptionElements.first().attr('content') || '';
        const descriptionText = (metaDescription || '').trim();
        const descriptionLength = descriptionText.length;
        const multipleDescriptions = descriptionElements.length > 1;
        const descriptionStatus = !descriptionExists ? 'missing' : descriptionLength < 120 ? 'too short' : descriptionLength > 160 ? 'too long' : 'optimal';
        const descriptionOptimal = descriptionStatus === 'optimal';

        // 4. Content analysis - remove scripts/styles/navigation from content estimates where reasonable
        const contentRoot = $('body').clone();
        contentRoot.find('script, style, noscript, svg, iframe, canvas, nav, header, footer, aside, form, button, input, select, textarea, meta, link, template').remove();
        const visibleText = contentRoot.text().replace(/\s+/g, ' ').trim();
        const visibleWordCount = visibleText ? visibleText.split(/\s+/).filter(Boolean).length : 0;
        const visibleCharacterCount = visibleText.length;
        const totalParagraphs = $('body p').length;
        let contentLengthCategory = 'very short';
        if (visibleWordCount >= 1000) {
            contentLengthCategory = 'long';
        } else if (visibleWordCount >= 400) {
            contentLengthCategory = 'adequate';
        } else if (visibleWordCount >= 150) {
            contentLengthCategory = 'short';
        }

        // 5. Heading Analysis
        const headingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        const headingCounts = {};
        const headingTexts = {};
        headingLevels.forEach((level) => {
            const headingNodes = $(`body ${level}`);
            headingCounts[level] = headingNodes.length;
            headingTexts[level] = headingNodes.map((index, element) => $(element).text().trim()).get().filter(Boolean);
        });

        const h1Count = headingCounts.h1 || 0;
        const h2Count = headingCounts.h2 || 0;
        const h3Count = headingCounts.h3 || 0;
        const h4Count = headingCounts.h4 || 0;
        const h5Count = headingCounts.h5 || 0;
        const h6Count = headingCounts.h6 || 0;
        const h1Optimal = h1Count === 1;

        const headingHierarchyIssues = [];
        const seenIssues = new Set();

        const addIssue = (issue) => {
            const key = issue.toLowerCase();
            if (!seenIssues.has(key)) {
                seenIssues.add(key);
                headingHierarchyIssues.push(issue);
            }
        };

        if (h1Count === 0) addIssue('Missing H1');
        if (h1Count > 1) addIssue(`Multiple H1s (${h1Count})`);
        if (h1Count === 0 && h2Count > 0) addIssue('H2 used without H1');

        const headingSequence = [];
        $('body h1, body h2, body h3, body h4, body h5, body h6').each((index, element) => {
            const tagName = element.tagName.toLowerCase();
            const level = Number(tagName.replace('h', ''));
            headingSequence.push(level);
        });

        for (let i = 1; i < headingSequence.length; i++) {
            const previousLevel = headingSequence[i - 1];
            const currentLevel = headingSequence[i];
            if (currentLevel > previousLevel + 1) {
                addIssue(`Heading levels skipped: H${previousLevel} → H${currentLevel}`);
            }
        }

        // 6. Link Analysis
        const auditHostname = (() => {
            try {
                return new URL(targetUrl).hostname;
            } catch (error) {
                return '';
            }
        })();

        const links = $('a[href]');
        let totalLinks = links.length;
        let internalLinks = 0;
        let externalLinks = 0;
        let emptyHrefLinks = 0;
        let hashLinks = 0;
        let newTabLinks = 0;
        let nonHttpLinks = 0;

        links.each((index, element) => {
            const link = $(element);
            const href = link.attr('href') || '';
            const hasTargetBlank = link.attr('target') && link.attr('target').toLowerCase() === '_blank';

            if (hasTargetBlank) {
                newTabLinks++;
            }

            if (!href || href.trim() === '') {
                emptyHrefLinks++;
                return;
            }

            const trimmedHref = href.trim();
            if (trimmedHref === '#' || trimmedHref.startsWith('#')) {
                hashLinks++;
                return;
            }

            if (/^(mailto:|tel:|javascript:|data:|sms:)/i.test(trimmedHref)) {
                nonHttpLinks++;
                return;
            }

            try {
                const resolvedUrl = new URL(trimmedHref, targetUrl);
                const currentHostname = resolvedUrl.hostname;
                if (!/^https?:/i.test(resolvedUrl.protocol)) {
                    nonHttpLinks++;
                    return;
                }

                if (currentHostname === auditHostname) {
                    internalLinks++;
                } else {
                    externalLinks++;
                }
            } catch (error) {
                nonHttpLinks++;
            }
        });

        // 7. Image Analysis
        const allImages = $('body img');
        const totalImages = allImages.length;
        let imagesWithAlt = 0;
        let imagesMissingAlt = 0;
        let imagesWithEmptyAlt = 0;
        const formatBreakdown = {
            webp: 0,
            avif: 0,
            jpeg: 0,
            jpg: 0,
            png: 0,
            gif: 0,
            svg: 0,
            other: 0
        };

        allImages.each((index, element) => {
            const image = $(element);
            const src = image.attr('src') || '';
            const altText = image.attr('alt');

            if (altText === undefined || altText === null || altText.trim() === '') {
                imagesMissingAlt++;
                if (altText !== undefined && altText !== null && altText.trim() === '') {
                    imagesWithEmptyAlt++;
                }
            } else {
                imagesWithAlt++;
            }

            const match = src.match(/\.([a-z0-9]+)(?:[?#]|$)/i);
            const extension = match ? match[1].toLowerCase() : 'other';
            if (['webp', 'avif', 'jpeg', 'jpg', 'png', 'gif', 'svg'].includes(extension)) {
                formatBreakdown[extension] = (formatBreakdown[extension] || 0) + 1;
            } else if (src) {
                formatBreakdown.other++;
            }
        });

        const modernImageFormats = (formatBreakdown.webp || 0) + (formatBreakdown.avif || 0);
        const legacyImageFormats = (formatBreakdown.jpeg || 0) + (formatBreakdown.jpg || 0) + (formatBreakdown.png || 0) + (formatBreakdown.gif || 0);
        const imagesOptimal = totalImages === 0 || imagesMissingAlt === 0;
        const imagesWithoutAlt = imagesMissingAlt;

        // 8. Viewport Meta Tag
        const viewportMeta = $('head meta[name="viewport"]').attr('content') || '';
        const hasViewport = !!viewportMeta;

        // 9. Canonical Tag
        const canonicalTags = $('head link[rel="canonical"]');
        const canonicalUrl = canonicalTags.first().attr('href') || '';
        const hasCanonical = !!canonicalUrl;
        const multipleCanonicalTags = canonicalTags.length > 1;

        // 10. Robots Meta Tag
        const robotsMeta = $('head meta[name="robots"]').attr('content') || '';
        const hasRobotsMeta = !!robotsMeta;

        // 11. Other useful meta tags
        const ogTitle = $('head meta[property="og:title"]').attr('content') || '';
        const ogDescription = $('head meta[property="og:description"]').attr('content') || '';
        const twitterCard = $('head meta[name="twitter:card"]').attr('content') || '';
        const hasStructuredData = $('script[type="application/ld+json"]').length > 0;

        // ========================================
        // Calculate Technical SEO Score (0-100)
        // Scoring Rules (redistributed to include robots.txt and sitemap.xml):
        // - HTTPS: 12 pts
        // - Viewport Meta: 12 pts
        // - Title Optimization: 12 pts (0 if missing, 12 if 30-60 chars)
        // - Meta Description: 12 pts (0 if missing, 12 if 120-160 chars)
        // - H1 Structure: 9 pts (0 if >1, 9 if exactly 1)
        // - Canonical Tag: 9 pts
        // - robots.txt: 9 pts (if exists and accessible)
        // - sitemap.xml: 9 pts (if exists, accessible, and valid)
        // - Robots Meta: 4 pts
        // - Image Alt Text: 4 pts (only if images exist)
        // - Open Graph Tags: 4 pts
        // - Twitter Card: 4 pts
        // ========================================
        let technicalScore = 0;

        // HTTPS (12 points)
        if (isHttps) {
            technicalScore += 12;
        }

        // Viewport (12 points)
        if (hasViewport) {
            technicalScore += 12;
        }

        // Title (12 points)
        if (titleOptimal) {
            technicalScore += 12;
        }

        // Meta Description (12 points)
        if (descriptionOptimal) {
            technicalScore += 12;
        }

        // H1 Structure (9 points)
        if (h1Optimal) {
            technicalScore += 9;
        }

        // Canonical Tag (9 points)
        if (hasCanonical) {
            technicalScore += 9;
        }

        // robots.txt (9 points)
        if (robotsData.exists && robotsData.accessible) {
            technicalScore += 9;
        }

        // sitemap.xml (9 points)
        if (sitemapData.exists && sitemapData.accessible && sitemapData.isValidXml) {
            technicalScore += 9;
        }

        // Robots Meta (4 points)
        if (hasRobotsMeta) {
            technicalScore += 4;
        }

        // Image Alt Text (4 points - only if images exist)
        if (imagesOptimal && totalImages > 0) {
            technicalScore += 4;
        }

        // Open Graph Tags (4 points)
        if (ogTitle && ogDescription) {
            technicalScore += 4;
        }

        // Twitter Card (4 points)
        if (twitterCard) {
            technicalScore += 4;
        }

        // Cap at 100
        technicalScore = Math.min(100, technicalScore);

        // ========================================
        // Calculate On-Page SEO Score (0-100)
        // Deterministic rules based only on actual HTML content and metadata:
        // - Title quality: 20 pts
        //   * optimal = 20, too short/too long = 10, missing = 0
        // - Meta description quality: 20 pts
        //   * optimal = 20, too short/too long = 10, missing = 0
        // - H1 structure: 15 pts
        //   * exactly one H1 = 15, multiple H1s = 5, missing H1 = 0
        // - Heading hierarchy: 10 pts
        //   * no hierarchy issues = 10, some issues = 5, major problems = 0
        // - Content length/content presence: 10 pts
        //   * adequate/long = 10, short = 6, very short = 3, no visible text = 0
        // - Internal linking: 10 pts
        //   * 3+ internal links = 10, 1-2 = 6, 0 = 0
        // - Image alt text: 10 pts
        //   * no missing alt = 10, some missing = 5, all missing = 0, no images = 10
        // - Canonical tag: 5 pts
        //   * present = 5, otherwise 0
        // ========================================
        let onPageScore = 0;

        // Title quality (20 points max)
        if (titleStatus === 'optimal') {
            onPageScore += 20;
        } else if (titleStatus === 'too short' || titleStatus === 'too long') {
            onPageScore += 10;
        }

        // Meta description quality (20 points max)
        if (descriptionStatus === 'optimal') {
            onPageScore += 20;
        } else if (descriptionStatus === 'too short' || descriptionStatus === 'too long') {
            onPageScore += 10;
        }

        // H1 structure (15 points max)
        if (h1Count === 1) {
            onPageScore += 15;
        } else if (h1Count > 1) {
            onPageScore += 5;
        }

        // Heading hierarchy (10 points max)
        if (headingHierarchyIssues.length === 0) {
            onPageScore += 10;
        } else if (headingHierarchyIssues.length <= 2) {
            onPageScore += 5;
        }

        // Content length and content presence (10 points max)
        if (visibleWordCount === 0) {
            onPageScore += 0;
        } else if (contentLengthCategory === 'adequate' || contentLengthCategory === 'long') {
            onPageScore += 10;
        } else if (contentLengthCategory === 'short') {
            onPageScore += 6;
        } else {
            onPageScore += 3;
        }

        // Internal linking (10 points max)
        if (totalLinks === 0) {
            onPageScore += 0;
        } else if (internalLinks >= 3) {
            onPageScore += 10;
        } else if (internalLinks >= 1) {
            onPageScore += 6;
        }

        // Image alt text (10 points max)
        if (totalImages === 0) {
            onPageScore += 10;
        } else if (imagesMissingAlt === 0) {
            onPageScore += 10;
        } else if (imagesMissingAlt < totalImages) {
            onPageScore += 5;
        }

        // Canonical tag (5 points max)
        if (hasCanonical) {
            onPageScore += 5;
        }

        // Cap at 100
        onPageScore = Math.min(100, onPageScore);

        // ========================================
        // Calculate Performance Score (0-100)
        // Scoring Rules:
        // - Server Response Time: 0-40 pts
        //   (< 500ms = 40, < 1000ms = 30, < 2000ms = 20, < 3000ms = 10, >= 3000ms = 0)
        // - HTML Document Size: 0-35 pts
        //   (< 50KB = 35, < 100KB = 30, < 200KB = 20, < 500KB = 10, >= 500KB = 0)
        // - Image Optimization: 0-15 pts (based on % with alt)
        // - Image Count: 0-10 pts
        //   (0 images = 5, 1-10 = 10, 11-50 = 8, 51-100 = 5, > 100 = 2)
        // ========================================
        let performanceScore = 0;

        // Server Response Time (40 points max)
        if (responseTimeMs < 500) {
            performanceScore += 40;
        } else if (responseTimeMs < 1000) {
            performanceScore += 30;
        } else if (responseTimeMs < 2000) {
            performanceScore += 20;
        } else if (responseTimeMs < 3000) {
            performanceScore += 10;
        } else {
            performanceScore += 0;
        }

        // HTML Document Size (35 points max)
        if (htmlSizeBytes < 50000) {
            performanceScore += 35;
        } else if (htmlSizeBytes < 100000) {
            performanceScore += 30;
        } else if (htmlSizeBytes < 200000) {
            performanceScore += 20;
        } else if (htmlSizeBytes < 500000) {
            performanceScore += 10;
        } else {
            performanceScore += 0;
        }

        // Image Optimization (15 points max - only if images exist)
        if (totalImages > 0) {
            const imageAltPercentage = ((totalImages - imagesWithoutAlt) / totalImages) * 100;
            if (imageAltPercentage === 100) {
                performanceScore += 15;
            } else if (imageAltPercentage >= 75) {
                performanceScore += 12;
            } else if (imageAltPercentage >= 50) {
                performanceScore += 8;
            } else {
                performanceScore += 3;
            }
        }

        // Image Count (10 points max)
        if (totalImages === 0) {
            performanceScore += 5;
        } else if (totalImages <= 10) {
            performanceScore += 10;
        } else if (totalImages <= 50) {
            performanceScore += 8;
        } else if (totalImages <= 100) {
            performanceScore += 5;
        } else {
            performanceScore += 2;
        }

        // Cap at 100
        performanceScore = Math.min(100, performanceScore);

        // ========================================
        // Calculate Overall SEO Score (0-100)
        // Weighting:
        // - Technical SEO: 40%
        // - On-Page SEO: 40%
        // - Performance: 20%
        // ========================================
        const overallScore = Math.round(
            (technicalScore * 0.4) + (onPageScore * 0.4) + (performanceScore * 0.2)
        );

        // ========================================
        // Generate Results
        // ========================================
        const technicalResults = [];

        // HTTPS
        if (isHttps) {
            technicalResults.push({
                status: 'pass',
                text: 'SSL/HTTPS enabled'
            });
        } else {
            technicalResults.push({
                status: 'error',
                text: 'Not using HTTPS - connection is not secure'
            });
        }

        // Mobile Viewport
        if (hasViewport) {
            technicalResults.push({
                status: 'pass',
                text: 'Viewport meta tag configured for mobile'
            });
        } else {
            technicalResults.push({
                status: 'warning',
                text: 'Missing viewport meta tag - not mobile-friendly'
            });
        }

        // Page Title
        if (titleLength === 0) {
            technicalResults.push({
                status: 'error',
                text: 'Missing page title'
            });
        } else if (titleOptimal) {
            technicalResults.push({
                status: 'pass',
                text: `Page title optimized (${titleLength} characters)`
            });
        } else if (titleLength < 30) {
            technicalResults.push({
                status: 'warning',
                text: `Page title too short (${titleLength} characters, recommended 30-60)`
            });
        } else {
            technicalResults.push({
                status: 'warning',
                text: `Page title too long (${titleLength} characters, recommended 30-60)`
            });
        }

        // Meta Description
        if (metaDescription.length === 0) {
            technicalResults.push({
                status: 'error',
                text: 'Missing meta description'
            });
        } else if (descriptionOptimal) {
            technicalResults.push({
                status: 'pass',
                text: `Meta description optimized (${descriptionLength} characters)`
            });
        } else if (metaDescription.length < 120) {
            technicalResults.push({
                status: 'warning',
                text: `Meta description too short (${descriptionLength} characters, recommended 120-160)`
            });
        } else {
            technicalResults.push({
                status: 'warning',
                text: `Meta description too long (${descriptionLength} characters, recommended 120-160)`
            });
        }

        // H1 Tags
        if (h1Count === 0) {
            technicalResults.push({
                status: 'error',
                text: 'No H1 tag found on page'
            });
        } else if (h1Count === 1) {
            technicalResults.push({
                status: 'pass',
                text: 'Exactly one H1 tag found (optimal)'
            });
        } else {
            technicalResults.push({
                status: 'warning',
                text: `Multiple H1 tags found (${h1Count}) - should have only one`
            });
        }

        // H2 Tags
        if (h2Count === 0) {
            technicalResults.push({
                status: 'info',
                text: 'No H2 tags found - consider adding for content structure'
            });
        } else {
            technicalResults.push({
                status: 'pass',
                text: `${h2Count} H2 tag(s) found for content structure`
            });
        }

        // Canonical Tag
        if (hasCanonical) {
            technicalResults.push({
                status: 'pass',
                text: 'Canonical tag present - helps prevent duplicate content'
            });
        } else {
            technicalResults.push({
                status: 'info',
                text: 'No canonical tag - recommended for SEO'
            });
        }

        // Image Alt Text
        if (totalImages === 0) {
            technicalResults.push({
                status: 'info',
                text: 'No images found on page'
            });
        } else if (imagesOptimal) {
            technicalResults.push({
                status: 'pass',
                text: `All ${totalImages} images have alt attributes`
            });
        } else {
            technicalResults.push({
                status: 'warning',
                text: `${imagesWithoutAlt} of ${totalImages} images missing alt attributes`
            });
        }

        // Open Graph Tags
        if (ogTitle && ogDescription) {
            technicalResults.push({
                status: 'pass',
                text: 'Open Graph tags present - good for social sharing'
            });
        } else {
            technicalResults.push({
                status: 'warning',
                text: 'Open Graph tags missing - recommended for social sharing'
            });
        }

        // robots.txt
        if (robotsData.exists && robotsData.accessible) {
            let robotsText = 'robots.txt found and accessible';
            if (robotsData.hasSitemapDirective) {
                robotsText += ' (includes sitemap directive)';
            }
            technicalResults.push({
                status: 'pass',
                text: robotsText
            });
        } else {
            technicalResults.push({
                status: 'warning',
                text: `robots.txt not found or inaccessible (Status: ${robotsData.status || 'unknown'})`
            });
        }

        // sitemap.xml
        if (sitemapData.exists && sitemapData.accessible && sitemapData.isValidXml) {
            const sitemapText = sitemapData.type === 'sitemapindex' 
                ? `sitemap.xml found (sitemap index with ${sitemapData.urlCount} sitemaps)`
                : `sitemap.xml found (${sitemapData.urlCount} URLs)`;
            technicalResults.push({
                status: 'pass',
                text: sitemapText
            });
        } else {
            let sitemapStatus = 'not found';
            if (sitemapData.exists && sitemapData.accessible && !sitemapData.isValidXml) {
                sitemapStatus = 'found but invalid format';
            } else if (sitemapData.status === 404) {
                sitemapStatus = 'not found (404)';
            }
            technicalResults.push({
                status: 'warning',
                text: `sitemap.xml ${sitemapStatus}`
            });
        }

        // Determine actual issues for metadata
        const metadataIssues = [];

        if (multipleTitleTags) {
            metadataIssues.push('Multiple title tags detected');
        }
        if (multipleDescriptions) {
            metadataIssues.push('Multiple meta descriptions detected');
        }
        if (multipleCanonicalTags) {
            metadataIssues.push('Multiple canonical tags detected');
        }
        if (headingHierarchyIssues.length > 0) {
            metadataIssues.push(...headingHierarchyIssues.map((issue) => `Heading hierarchy issue: ${issue}`));
        }
        if (imagesMissingAlt > 0) {
            metadataIssues.push(`${imagesMissingAlt} image(s) missing alt text`);
        }
        if (!titleExists) {
            metadataIssues.push('Missing page title');
        }
        if (!descriptionExists) {
            metadataIssues.push('Missing meta description');
        }

        const recommendations = [];
        if (!descriptionExists) {
            recommendations.push('Add a unique meta description to improve search snippet quality.');
        }
        if (h1Count === 0) {
            recommendations.push('Add one clear H1 heading to define the primary page topic.');
        }
        if (h1Count > 1) {
            recommendations.push('Use one primary H1 and remove duplicate H1 headings.');
        }
        if (imagesMissingAlt > 0) {
            recommendations.push('Add descriptive alt text to images that are missing it.');
        }
        if (visibleWordCount < 150) {
            recommendations.push('Add more useful content so the page has stronger topical depth.');
        }
        if (internalLinks === 0 && totalLinks > 0) {
            recommendations.push('Add relevant internal links to help users and search engines navigate the site.');
        }
        if (headingHierarchyIssues.length > 0) {
            recommendations.push('Fix the heading hierarchy so heading levels follow a logical structure.');
        }
        if (multipleTitleTags) {
            recommendations.push('Keep exactly one title tag on the page to avoid metadata conflicts.');
        }
        if (multipleDescriptions) {
            recommendations.push('Keep exactly one meta description on the page to avoid duplicate metadata.');
        }

        const auditData = {
            url: targetUrl,
            timestamp: new Date().toLocaleString(),
            // Scoring (all based on real data)
            technicalScore: technicalScore,
            onPageScore: onPageScore,
            performanceScore: performanceScore,
            overallScore: overallScore,
            technicalResults,
            metadata: {
                title,
                titleLength,
                titleOptimal,
                titleAnalysis: {
                    exists: titleExists,
                    text: title,
                    length: titleLength,
                    exactlyOneTitle: !multipleTitleTags,
                    multipleTitleTags: multipleTitleTags,
                    status: titleStatus,
                    issues: multipleTitleTags ? ['Multiple title tags detected'] : []
                },
                metaDescription,
                descriptionLength,
                descriptionOptimal,
                descriptionAnalysis: {
                    exists: descriptionExists,
                    text: descriptionText,
                    length: descriptionLength,
                    exactlyOneDescription: !multipleDescriptions,
                    multipleDescriptions: multipleDescriptions,
                    status: descriptionStatus,
                    issues: multipleDescriptions ? ['Multiple meta descriptions detected'] : []
                },
                content: {
                    wordCount: visibleWordCount,
                    characterCount: visibleCharacterCount,
                    paragraphCount: totalParagraphs,
                    lengthCategory: contentLengthCategory,
                    visibleText: visibleText
                },
                headings: {
                    h1: headingCounts.h1 || 0,
                    h2: headingCounts.h2 || 0,
                    h3: headingCounts.h3 || 0,
                    h4: headingCounts.h4 || 0,
                    h5: headingCounts.h5 || 0,
                    h6: headingCounts.h6 || 0,
                    headingTexts: headingTexts,
                    issues: headingHierarchyIssues,
                    hierarchyHealthy: headingHierarchyIssues.length === 0
                },
                links: {
                    totalLinks: totalLinks,
                    internalLinks: internalLinks,
                    externalLinks: externalLinks,
                    emptyHrefLinks: emptyHrefLinks,
                    hashLinks: hashLinks,
                    newTabLinks: newTabLinks,
                    ignoredNonHttpLinks: nonHttpLinks
                },
                images: {
                    totalImages: totalImages,
                    imagesWithAlt: imagesWithAlt,
                    imagesMissingAlt: imagesMissingAlt,
                    imagesWithEmptyAlt: imagesWithEmptyAlt,
                    formatBreakdown: formatBreakdown,
                    modernFormats: modernImageFormats,
                    legacyFormats: legacyImageFormats,
                    altCoverage: totalImages === 0 ? 100 : Math.round(((totalImages - imagesMissingAlt) / totalImages) * 100)
                },
                h1Count,
                h2Count,
                h3Count,
                h4Count,
                h5Count,
                h6Count,
                h1Optimal,
                viewportMeta,
                hasViewport,
                canonicalUrl,
                hasCanonical,
                multipleCanonicalTags,
                canonicalIssues: multipleCanonicalTags ? ['Multiple canonical tags detected'] : [],
                robotsMeta,
                hasRobotsMeta,
                isHttps,
                imagesWithoutAlt,
                imagesOptimal,
                ogTitle,
                ogDescription,
                twitterCard,
                hasStructuredData,
                metadataIssues: metadataIssues,
                recommendations: recommendations,
                // Robots.txt and Sitemap checks
                robots: robotsData,
                sitemap: sitemapData,
                // Performance metrics
                performanceMetrics: {
                    htmlSizeBytes: htmlSizeBytes,
                    htmlSizeKB: htmlSizeKB,
                    htmlDocumentSize: `${htmlSizeKB} KB (${htmlSizeBytes.toLocaleString()} bytes)`,
                    responseTimeMs: responseTimeMs,
                    totalImages: totalImages,
                    imagesWithoutAlt: imagesWithoutAlt
                }
            }
        };

        auditData.issues = generateIssuesAndRecommendations(auditData);

        // Return complete audit data
        return auditData;
    } catch (error) {
        throw new Error(`Error analyzing website: ${error.message}`);
    }
}

// ========================================
// Routes
// ========================================

/**
 * POST /api/audit - Perform SEO audit on website
 */
app.post('/api/audit', async (req, res) => {
    try {
        const { url: inputUrl } = req.body;

        // Validate input
        if (!inputUrl) {
            return res.status(400).json({
                success: false,
                error: 'URL is required'
            });
        }

        // Normalize and validate URL
        const normalizedUrl = normalizeUrl(inputUrl.trim());
        
        if (!isValidUrl(normalizedUrl)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid URL format'
            });
        }

        // Measure fetch time
        const fetchStartTime = Date.now();
        const html = await fetchWebsite(normalizedUrl);
        const fetchEndTime = Date.now();
        const responseTimeMs = fetchEndTime - fetchStartTime;

        // Check robots.txt and sitemap.xml (in parallel with main HTML already fetched)
        const [robotsData, sitemapData] = await Promise.all([
            checkRobotsTxt(normalizedUrl),
            checkSitemapXml(normalizedUrl)
        ]);

        // Analyze HTML with robots and sitemap data
        const auditResults = analyzeSeoDB(html, normalizedUrl, responseTimeMs, robotsData, sitemapData);

        // Return results
        return res.status(200).json({
            success: true,
            data: auditResults
        });

    } catch (error) {
        // Return error response
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET / - Serve frontend
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Backend server is running',
        timestamp: new Date().toLocaleString()
    });
});

// ========================================
// Error Handler
// ========================================
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// ========================================
// Start Server
// ========================================
app.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('   AI SEO Audit Dashboard Backend Server');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   Server running at: http://localhost:${PORT}`);
    console.log(`   Frontend: http://localhost:${PORT}`);
    console.log(`   API Endpoint: POST http://localhost:${PORT}/api/audit`);
    console.log('   Health Check: GET http://localhost:${PORT}/api/health');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
});
