/**
 * ACF Field block – Editor functionality tests.
 *
 * Verifies block insertion (standalone and inside Query Loop), preview, and editor behaviour.
 */

const BLOCK_NAME = 'satori-digital/acf-field';

describe('ACF Field block – Editor functionality', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/wp-admin/post-new.php');
    cy.closeWelcomeModal();
    cy.get('.edit-post-visual-editor, .editor-styles-wrapper').should('be.visible');
  });

  describe('Block insertion (standalone)', () => {
    it('inserts ACF Field block from inserter', () => {
      cy.insertBlock(BLOCK_NAME);
      cy.get(`[data-type="${BLOCK_NAME}"]`).should('exist');
    });

    it('block has expected preview class', () => {
      cy.insertBlock(BLOCK_NAME);
      cy.get(`[data-type="${BLOCK_NAME}"]`).first().click();
      cy.get('.satori-acf-field-preview').should('exist');
    });

    it('preview shows bracketed label when field is selected', () => {
      cy.insertBlock(BLOCK_NAME);
      cy.get(`[data-type="${BLOCK_NAME}"]`).first().click();
      cy.get('.components-panel__body').contains('ACF Field').click();
      cy.get('select').first().then(($select) => {
        const options = $select.find('option');
        if (options.length > 1) {
          const firstFieldValue = options.eq(1).val();
          cy.get('select').first().select(firstFieldValue);
          cy.get('.satori-acf-field-preview').should('match', /\[.+\]/);
        }
      });
    });
  });

  describe('Block inside Query Loop', () => {
    it('Query Loop and ACF Field block can coexist on page', () => {
      cy.insertBlock('core/query', 'Query Loop');
      cy.get('[data-type="core/query"]').should('exist');
      cy.insertBlock(BLOCK_NAME);
      cy.get(`[data-type="${BLOCK_NAME}"]`).should('exist');
    });
  });

  describe('Block wrapper', () => {
    it('block has satori-acf-field-block class', () => {
      cy.insertBlock(BLOCK_NAME);
      cy.get(`[data-type="${BLOCK_NAME}"]`).first().parent().should('have.class', 'satori-acf-field-block');
    });
  });
});
