describe("template spec", () => {
    beforeEach(() => {
        cy.viewport(430, 932);
    });

    it("can sign in", () => {
        cy.visit("/");
        cy.url().should("include", "/sign-in");
        cy.signIn();
        cy.visit("/");
        cy.url().should("not.include", "/sign-in");
    });
});
