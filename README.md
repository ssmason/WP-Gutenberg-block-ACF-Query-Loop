# Satori ACF Field Loop

ACF Field block for WordPress Query Loop. Output ACF (Advanced Custom Fields) field values inside Query Loop patterns, so you can design the layout in a pattern and place field data wherever you want.

## Requirements

- WordPress 6.1+
- [Advanced Custom Fields](https://www.advancedcustomfields.com/) (ACF) 5.x or 6.x
- PHP 8.1+

## Installation

1. Install the plugin (via Composer or manual copy to `wp-content/plugins/`).
2. Activate **Satori ACF Field Loop** and **Advanced Custom Fields**.
3. Run `npm ci && npm run build` in the plugin directory to build block assets.

## Usage

1. Add a **Query Loop** block and configure it (e.g. post type, number of items).
2. Inside the Query Loop template, add an **ACF Field** block.
3. In the block sidebar, select the ACF field to display from the dropdown.
4. The dropdown lists fields from field groups attached to the queried post type.
5. Design your pattern with headings, images, paragraphs, etc., and place ACF Field blocks where you want the data.

The block outputs the field value for the current post in the loop. Supported field types include text, textarea, number, image, link, and similar scalar/structured types.

## Development

```bash
# Install dependencies
npm ci
composer install

# Build block assets
npm run build

# Lint PHP
composer phpcs
composer phpcbf
```

## Testing (Cypress E2E)

Cypress end-to-end tests cover block settings, editor behaviour, frontend render, and the REST API.

**Prerequisites**

- A running WordPress site with **ACF** and this plugin activated
- An admin user (set `WP_USER` and `WP_PASSWORD` in `cypress.env.json`)

**Setup (required)**

1. Copy `cypress.env.json.example` to `cypress.env.json`
2. Set `baseUrl`, `WP_USER`, and `WP_PASSWORD` to match your WordPress site

**Run tests**

```bash
# Run all tests (headless)
npm run cypress:run

# Open Cypress UI (interactive)
npm run cypress:open
```

**Test suites**

| File | Coverage |
|------|----------|
| `cypress/e2e/login.cy.js` | WordPress login reaches wp-admin |
| `cypress/e2e/acf-field-block-settings.cy.js` | Inspector panel, field dropdown, help text |
| `cypress/e2e/acf-field-block-editor.cy.js` | Block insertion, preview, Query Loop coexistence |
| `cypress/e2e/acf-field-block-frontend.cy.js` | Frontend block wrapper render |
| `cypress/e2e/acf-field-block-rest.cy.js` | REST endpoint structure |

**Environment**

In `cypress.env.json`, set:

- `baseUrl` – Your WordPress URL (e.g. `http://localhost:8080`)
- `WP_USER` / `WP_PASSWORD` – Login credentials for an existing admin user
- `WP_PATH` – WordPress path prefix: `/wp` for Bedrock, `""` for standard WP
- `WP_REST_PREFIX` (optional) – REST API path prefix; default is `/wp-json`. Override only if your site serves the REST API at a different path (e.g. `/wp/wp-json`).

## Structure

```
satori-acf-field-loop/
├── cypress/
│   ├── e2e/                    # E2E test specs
│   │   ├── login.cy.js
│   │   ├── acf-field-block-settings.cy.js
│   │   ├── acf-field-block-editor.cy.js
│   │   ├── acf-field-block-frontend.cy.js
│   │   └── acf-field-block-rest.cy.js
│   └── support/
│       ├── commands.js
│       └── e2e.js
├── block.json           # Block metadata
├── build/               # Compiled assets (index.js, style-index.css)
├── includes/
│   ├── class-assets.php
│   ├── class-autoloader.php
│   ├── class-block.php   # Block registration & render
│   ├── class-plugin.php
│   └── class-rest.php   # REST API for field dropdown
├── src/
│   ├── edit.js          # Editor component
│   ├── index.js         # Block registration
│   ├── save.js          # Dynamic block (null)
│   └── style.css        # Editor styles
├── satori-acf-field-loop.php
├── composer.json
├── package.json
└── phpcs.xml
```

## REST API

The plugin registers a REST endpoint for the field dropdown:

- **GET** `/wp-json/satori-acf-field-loop/v1/fields?post_type={post_type}`

Returns ACF fields from field groups attached to the given post type. Requires `edit_posts` capability.

## License

GPL-2.0-or-later
