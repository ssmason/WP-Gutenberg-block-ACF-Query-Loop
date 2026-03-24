/**
 * ACF Field block – REST API tests.
 *
 * Verifies the /satori-acf-field-loop/v1/fields endpoint (path from WP_REST_PREFIX, default /wp-json).
 */

describe('ACF Field block – REST API', () => {
  beforeEach(() => {
    cy.login();
    // Cookie-authenticated REST needs X-WP-Nonce; wpApiSettings is available in wp-admin.
    cy.visitWpAdmin('index.php');
  });

  it('returns 200 for fields endpoint with post_type param', () => {
    cy.window().then((win) => {
      const nonce = win.wpApiSettings?.nonce;
      expect(nonce, 'wpApiSettings.nonce in admin').to.be.a('string');
      cy.requestWpJson('satori-acf-field-loop/v1/fields?post_type=post', {
        headers: { 'X-WP-Nonce': nonce },
      }).then((res) => {
        expect(res.status, 'fields REST (set WP_REST_PREFIX in cypress.env.json if 404)').to.eq(200);
        expect(res.body).to.have.property('fields');
        expect(res.body.fields).to.be.an('array');
      });
    });
  });

  it('fields endpoint returns array when successful', () => {
    cy.window().then((win) => {
      const nonce = win.wpApiSettings?.nonce;
      expect(nonce, 'wpApiSettings.nonce in admin').to.be.a('string');
      cy.requestWpJson('satori-acf-field-loop/v1/fields?post_type=post', {
        headers: { 'X-WP-Nonce': nonce },
      }).then((res) => {
        if (res.status === 200) {
          expect(res.body).to.have.property('fields');
          expect(res.body.fields).to.be.an('array');
          res.body.fields.forEach((field) => {
            expect(field).to.have.property('key');
            expect(field).to.have.property('name');
            expect(field).to.have.property('selector');
            expect(field).to.have.property('label');
            expect(field).to.have.property('type');
          });
        }
      });
    });
  });
});
