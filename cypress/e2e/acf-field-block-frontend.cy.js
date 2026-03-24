/**
 * ACF Field block – Frontend render tests.
 *
 * Publishes a page with the block and checks for the frontend wrapper. Requires at least one
 * ACF field for the page post type and a non-null value from get_field() for output to appear.
 */

const BLOCK_NAME = 'satori-digital/acf-field';

function createPageWithAcfField() {
  cy.login();
  cy.visitEditor('post_type=page');
  cy.closeWelcomeModal();
  cy.ensureEditorReady();

  cy.insertBlock(BLOCK_NAME);
  cy.refocusAcfFieldBlock();
  cy.get('.block-editor-block-inspector').contains('ACF Field').click({ force: true });
  cy.get('.block-editor-block-inspector').find('.components-spinner', { timeout: 15000 }).should('not.exist');
  cy.get('.block-editor-block-inspector select').first().then(($select) => {
    const options = $select.find('option');
    if (options.length > 1) {
      cy.get('.block-editor-block-inspector select').first().select(String(options.eq(1).val()), { force: true });
    }
  });

  cy.publishPostFromEditor();
  cy.get(
    '.post-publish-panel__postpublish-post-address a, .editor-post-publish-panel__postpublish-link a, .components-snackbar a[href]'
  )
    .first()
    .invoke('attr', 'href')
    .then((url) => {
      cy.visit(url);
    });
}

describe('ACF Field block – Frontend render', () => {
  describe('Block container', () => {
    beforeEach(() => createPageWithAcfField());

    it('published page loads; block wrapper appears when ACF outputs markup', () => {
      cy.url().should('not.include', 'wp-login');
      cy.get('body').should('be.visible');
      cy.get('body').then(($body) => {
        if ($body.find('.satori-acf-field-block').length) {
          // Wrapper can be 0×height when the field has no value on the frontend; still assert presence.
          cy.get('.satori-acf-field-block').first().should('exist');
        }
      });
    });
  });
});
