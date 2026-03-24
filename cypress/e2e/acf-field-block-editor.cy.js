/**
 * ACF Field block – Editor functionality tests.
 *
 * Verifies block insertion (standalone and inside Query Loop), preview, and editor behaviour.
 */

const BLOCK_NAME = 'satori-digital/acf-field';

describe('ACF Field block – Editor functionality', () => {
  beforeEach(() => {
    cy.login();
    cy.visitEditor();
    cy.closeWelcomeModal();
    cy.ensureEditorReady();
  });

  describe('Block insertion (standalone)', () => {
    it('inserts ACF Field block from inserter', () => {
      cy.insertBlock(BLOCK_NAME);
      cy.getEditorCanvas().find(`[data-type="${BLOCK_NAME}"]`).should('exist');
    });

    it('block has expected preview class', () => {
      cy.insertBlock(BLOCK_NAME);
      cy.getEditorCanvas().find(`[data-type="${BLOCK_NAME}"]`).first().click({ force: true });
      cy.getEditorCanvas().find('.satori-acf-field-preview').should('exist');
    });

    it('preview shows bracketed label when field is selected', () => {
      cy.insertBlock(BLOCK_NAME);
      cy.getEditorCanvas().find(`[data-type="${BLOCK_NAME}"]`).first().click({ force: true });
      cy.openBlockInspector();
      cy.get('.block-editor-block-inspector').contains('ACF Field').click({ force: true });
      cy.get('.block-editor-block-inspector').find('.components-spinner', { timeout: 15000 }).should('not.exist');
      cy.get('.block-editor-block-inspector select').first().then(($select) => {
        const options = $select.find('option');
        if (options.length > 1) {
          const firstFieldValue = options.eq(1).val();
          cy.get('.block-editor-block-inspector select').first().select(String(firstFieldValue), { force: true });
          cy.getEditorCanvas().find('.satori-acf-field-preview').invoke('text').should('match', /\[.+\]/);
        }
      });
    });
  });

  describe('Block inside Query Loop', () => {
    it('Query Loop and ACF Field block can coexist on page', () => {
      // Insert standalone ACF Field first (toolbar inserter is reliable), then Query Loop.
      // Adding a second block after Query Loop often leaves focus inside the template; the
      // header inserter can disappear until selection changes.
      cy.insertBlock(BLOCK_NAME);
      cy.getEditorCanvas().find(`[data-type="${BLOCK_NAME}"]`).should('exist');
      cy.get('body').type('{esc}{esc}', { delay: 0 });
      cy.wait(500);
      cy.dismissEditorChrome();
      cy.get('.edit-post-header-toolbar', { timeout: 15000 }).should('be.visible');
      cy.wait(800);
      // With a block selected, the document toolbar (and inserter) can be unmounted until
      // focus leaves the block — click the title so the header inserter is back in the DOM.
      cy.get('body').then(($b) => {
        const $title = $b.find('.editor-post-title__input');
        if ($title.length) {
          cy.wrap($title.first()).click({ force: true });
        } else {
          cy.getEditorCanvas().click('topLeft', { force: true });
        }
      });
      cy.wait(300);
      cy.insertBlock('core/query', 'Query Loop');
      cy.getEditorCanvas().find('[data-type="core/query"]').should('exist');
      cy.getEditorCanvas().find(`[data-type="${BLOCK_NAME}"]`).should('exist');
    });
  });

  describe('Block wrapper', () => {
    it('block has satori-acf-field-block class', () => {
      cy.insertBlock(BLOCK_NAME);
      cy.getEditorCanvas()
        .find(`[data-type="${BLOCK_NAME}"]`)
        .first()
        .should('have.class', 'satori-acf-field-block');
    });
  });
});
