/**
 * Custom Cypress commands for WordPress block editor and ACF Field block tests.
 *
 * Set WP_USER and WP_PASSWORD in cypress.env.json (or CYPRESS_WP_USER / CYPRESS_WP_PASSWORD env vars)
 * if your WordPress uses different credentials than admin/password.
 */

/**
 * WordPress core URL prefix. Bedrock: `/wp`. Standard install at site root: `""` (set WP_PATH to "").
 * Important: use `??` / explicit `""` check — `|| '/wp'` breaks empty string.
 */
function wpCorePrefix() {
  const p = Cypress.env('WP_PATH');
  if (p === '') return '';
  return String(p ?? '/wp').replace(/\/$/, '');
}

/**
 * Logs in to WordPress admin via UI (visit, type, submit). Request-based login
 * does not persist cookies correctly with Cypress session.
 */

Cypress.Commands.add('login', (username, password) => {
  const user = username ?? Cypress.env('WP_USER') ?? 'cypress_test';
  const pass = password ?? Cypress.env('WP_PASSWORD') ?? 'cypress_test';
  const core = wpCorePrefix();

  cy.session(
    [core, user, pass],
    () => {
      const loginPath = core ? `${core}/wp-login.php` : '/wp-login.php';
      cy.visit(loginPath);
      cy.get('#user_login').clear().type(user);
      cy.get('#user_pass').clear().type(pass);
      cy.get('#wp-submit').click();
      cy.url({ timeout: 15000 }).should((url) => {
        if (url.includes('/wp-admin')) return;
        const wpErr = Cypress.$('#login_error').text().trim();
        throw new Error(
          wpErr
            ? `WordPress login failed: ${wpErr}`
            : 'Login did not redirect to wp-admin. Set WP_USER and WP_PASSWORD in cypress.env.json (see cypress.env.json.example).'
        );
      });
    },
    { cacheAcrossSpecs: true }
  );
});

Cypress.Commands.add('visitEditor', (query = '') => {
  const core = wpCorePrefix();
  const base = core ? `${core}/wp-admin/post-new.php` : '/wp-admin/post-new.php';
  cy.visit(query ? `${base}?${query.replace(/^\?/, '')}` : base);
  cy.url().should('not.include', 'wp-login');
});

Cypress.Commands.add('visitWpAdmin', (subPath = '') => {
  const core = wpCorePrefix();
  const base = core ? `${core}/wp-admin` : '/wp-admin';
  const path = subPath.replace(/^\//, '');
  cy.visit(path ? `${base}/${path}` : `${base}/`);
});

Cypress.Commands.add('closeWelcomeModal', () => {
  cy.get('body', { timeout: 5000 }).then(($body) => {
    const $skip = $body.find('button').filter((i, el) => /skip|start blank|create blank/i.test(el.textContent || ''));
    if ($skip.length) cy.wrap($skip.first()).click({ force: true });
    const $close = $body.find('[aria-label="Close"]');
    if ($close.length) cy.get('[aria-label="Close"]').first().click({ force: true });
  });
  cy.wait(500);
});

Cypress.Commands.add('dismissEditorChrome', () => {
  cy.get('body').type('{esc}{esc}', { delay: 0 });
  cy.wait(300);
});

Cypress.Commands.add('ensureEditorReady', () => {
  cy.get(
    'iframe[name="editor-canvas"], .edit-post-visual-editor, .editor-styles-wrapper, .block-editor-block-list__layout, [data-type="core/post-content"]',
    { timeout: 20000 }
  ).should('exist');
});

Cypress.Commands.add('getEditorCanvas', () => {
  return cy.get('body').then(($body) => {
    const $iframe = $body.find('iframe[name="editor-canvas"]');
    if ($iframe.length) {
      const doc = $iframe.contents();
      return cy.wrap(doc.find('body'));
    }
    return cy.get('body');
  });
});

/**
 * Inserts a block by name (search term defaults from block id).
 */
Cypress.Commands.add('insertBlock', (blockName, searchTerm) => {
  const term =
    searchTerm ??
    (blockName.includes('acf-field') ? 'ACF Field' : blockName.includes('query') ? 'Query Loop' : 'ACF Field');

  cy.dismissEditorChrome();

  // Open inserter: prefer the dedicated toggle, then other header controls. Do not use one long
  // comma selector + .first() — the first DOM match is often a different toolbar control.
  //
  // Important: a plain cy.get('body').then(...) runs once. After the first block is inserted,
  // React can re-mount the header a tick later — finds were empty and we threw. Use .should()
  // so Cypress retries until at least one control exists, then click in priority order.
  const inserterInDom = ($body) =>
    $body.find('.block-editor-inserter__toggle').length +
    $body.find('button.editor-document-tools__inserter-toggle').length +
    $body.find('button[aria-label="Add block"]').length +
    $body.find('button[aria-label="Block inserter"]').length +
    $body.find('button[aria-label="Toggle block inserter"]').length;

  cy.get('body', { timeout: 20000 }).should(($body) => {
    expect(inserterInDom($body), 'block inserter control in DOM').to.be.greaterThan(0);
  });

  cy.get('body').then(($body) => {
    const visibleOrFirst = (selector) => {
      const $vis = $body.find(selector).filter(':visible').first();
      if ($vis.length) return $vis;
      return $body.find(selector).first();
    };
    const trySelectors = [
      '.block-editor-inserter__toggle',
      'button.editor-document-tools__inserter-toggle',
      'button[aria-label="Add block"]',
      'button[aria-label="Block inserter"]',
      'button[aria-label="Toggle block inserter"]',
    ];
    for (const sel of trySelectors) {
      const $el = visibleOrFirst(sel);
      if ($el.length) {
        cy.wrap($el).scrollIntoView().click({ force: true });
        return;
      }
    }
    throw new Error('Block inserter not found after DOM ready');
  });

  // Inserter is open when its search field exists. Do not require __popover/__panel — class names
  // and wrappers differ by WP version (sometimes only .components-popover).
  cy.get(
    [
      '.block-editor-inserter__search input',
      '.block-editor-inserter__popover input[type="search"]',
      '.block-editor-inserter__panel input[type="search"]',
      'input[role="combobox"][aria-autocomplete="list"]',
    ].join(', '),
    { timeout: 20000 }
  )
    .filter(':visible')
    .first()
    .as('inserterSearch');

  cy.get('@inserterSearch').clear({ force: true }).type(term, { force: true });

  // Wait for filtered results (debounced search), then pick the block without relying on a single
  // popover class (avoids timeout on .block-editor-inserter__popover in some editor states).
  cy.get('body', { timeout: 15000 }).should(($body) => {
    const n =
      $body.find('.block-editor-block-types-list__item').length +
      $body.find('.block-editor-block-types-list__item-button').length +
      $body.find('button.block-editor-block-types-list__item-button').length +
      $body.find('[role="listbox"] [role="option"]').length;
    expect(n, 'block inserter result list').to.be.greaterThan(0);
  });

  cy.get('body').then(($body) => {
    const $row = $body
      .find(
        '.block-editor-block-types-list__item, .block-editor-block-types-list__item-button, button.block-editor-block-types-list__item-button, [role="option"]'
      )
      .filter((i, el) => (el.textContent || '').toLowerCase().includes(term.toLowerCase()))
      .first();
    if ($row.length) {
      cy.wrap($row).scrollIntoView().click({ force: true });
    } else {
      cy.get('@inserterSearch').type('{enter}', { force: true });
    }
  });

  cy.getEditorCanvas().find(`[data-type="${blockName}"]`, { timeout: 15000 }).first().click({ force: true });
});

Cypress.Commands.add('openBlockInspector', () => {
  cy.get('button[aria-label="Settings"]', { timeout: 15000 })
    .first()
    .then(($btn) => {
      const expanded = $btn.attr('aria-expanded');
      const sidebarVisible =
        expanded === 'true' ||
        Cypress.$('.interface-complementary-area:visible').length > 0 ||
        Cypress.$('.edit-post-sidebar:visible').length > 0;
      if (!sidebarVisible) {
        cy.wrap($btn).click({ force: true });
      }
    });
  cy.get('.block-editor-block-inspector', { timeout: 15000 }).should('exist');
  cy.get('body').then(($body) => {
    const $tabs = $body.find('.edit-post-sidebar__panel-tabs [role="tab"]');
    if (!$tabs.length) return;
    const $blockTab = $tabs.filter((i, el) => /^block$/i.test((el.textContent || '').trim()));
    if ($blockTab.length) {
      cy.wrap($blockTab.first()).click({ force: true });
    }
  });
});

Cypress.Commands.add('refocusAcfFieldBlock', () => {
  cy.getEditorCanvas().find('[data-type="satori-digital/acf-field"]').first().click({ force: true });
  cy.openBlockInspector();
});

Cypress.Commands.add('publishPostFromEditor', () => {
  cy.get('.editor-post-publish-panel__toggle', { timeout: 15000 }).click({ force: true });
  cy.get('.editor-post-publish-panel', { timeout: 15000 }).within(() => {
    cy.contains('button', /^Publish$/).click({ force: true });
  });
  cy.get(
    '.post-publish-panel__postpublish-post-address a, .editor-post-publish-panel__postpublish-link a, .components-snackbar a[href]',
    { timeout: 20000 }
  )
    .first()
    .should('be.visible');
});

/**
 * GET request to the WP REST API.
 * Default prefix is /wp-json (site root). Bedrock often still serves REST at /wp-json, not under /wp.
 * Override with WP_REST_PREFIX in cypress.env.json if your install uses e.g. /wp/wp-json.
 */
Cypress.Commands.add('requestWpJson', (path, options = {}) => {
  const prefix = String(Cypress.env('WP_REST_PREFIX') ?? '/wp-json').replace(/\/$/, '');
  const url = `${prefix}/${String(path).replace(/^\//, '')}`;
  return cy.request({ ...options, url, failOnStatusCode: false });
});
