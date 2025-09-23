# Copilot Instructions for Duace Music Website

## Project Overview
- **Purpose:** Portfolio and contact site for Duace Music, a team of composers and producers for TV, film, and streaming.
- **Stack:** Static HTML/CSS/JS with optional PHP for server-side form handling. No build system required.
- **Key Files:**
  - `index.html`, `IND .html`: Main site pages (duplicated structure, different content/language)
  - `css/style.css`: All site styles
  - `js/script.js`: All client-side JS (form, UI, EmailJS)
  - `php/contact.php`: Server-side form handler (optional)
  - `logs/contact_submissions.log`: Form submission logs (if using PHP)

## Architecture & Data Flow
- **Static-first:** All content and UI are in HTML/CSS/JS. No frameworks.
- **Form Handling:**
  - *Client-side (default):* Uses EmailJS for direct email from browser. See `README.md` for setup.
  - *Server-side (optional):* POSTs to `php/contact.php`, which logs and emails submissions. See `php/contact.php` for security features (XSS, CSRF, honeypot, rate limiting).
- **No database**—all data is transient or logged to flat files.

## Developer Workflows
- **No build step:** Edit files directly. No npm, no bundler.
- **Testing:**
  - Manual: Open `index.html` in browser, submit form, check email/logs.
  - Accessibility: Use ARIA labels, keyboard navigation, and test with screen readers.
- **Deployment:**
  - Static hosting (Netlify, Vercel, GitHub Pages) or traditional FTP/cPanel. See `README.md` for details.

## Project Conventions
- **Accessibility:**
  - Use ARIA labels and semantic HTML (see form and nav markup).
  - All interactive elements must be keyboard accessible.
- **Performance:**
  - Images and iframes use `loading="lazy"`.
  - CSS/JS is minification-ready but not pre-minified.
- **Security (PHP):**
  - All user input is sanitized and validated in `php/contact.php`.
  - CSRF and spam protection are implemented (see code comments).

## Patterns & Examples
- **Form fields:**
  - All required fields use `required` and ARIA attributes.
  - Honeypot field for spam prevention (see form markup and PHP handler).
- **Section structure:**
  - Each major section uses a `<section>` with a unique `id` and class `section`.
  - Team, releases, testimonials, and contact are modular and repeatable.
- **Styling:**
  - CSS custom properties (variables) for colors and spacing.
  - Responsive grid layouts for team, releases, testimonials.

## Integration Points
- **EmailJS:**
  - Configured in `js/script.js` (see `README.md` for template).
- **PHP:**
  - Only used if server supports it. Fallback to EmailJS otherwise.
- **Assets:**
  - All images/fonts in `assets/`.

## References
- See `README.md` for full setup, deployment, and troubleshooting.
- For new sections, follow the structure and ARIA/accessibility patterns in `index.html`.

---

*Update this file if you add new workflows, change form handling, or introduce new conventions.*
