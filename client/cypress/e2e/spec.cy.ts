import "cypress-real-events";

describe("template spec", () => {
    beforeEach(() => {
        cy.viewport(430, 932);
        cy.visit("/");
        cy.url().should("include", "/sign-in");
        cy.signIn();
        cy.url({ timeout: 12000 }).should("not.include", "/sign-in");
        cy.get(".led-strip-button", { timeout: 120000 }).should("exist");
    });

    it("can click each mode button", () => {
        cy.get(".led-strip-button").click();
        cy.get(".mode-button").each((button, index, list) => {
            cy.wrap(button).click();

            cy.get("body").then((body) => {
                cy.log(body.find("#modal-close").length.toString());
                if (body.find("#modal-close").length) {
                    cy.get("#modal-close").click();
                }
            });
        });
    });

    it("can long-press each button", () => {
        cy.get(".led-strip-button").click();
        cy.wait(100);
        cy.get(".mode-button").each((button, index, list) => {
            cy.wrap(button).realMouseDown();
            cy.wait(550);
            cy.wrap(button).realMouseUp();
            cy.get("#modal-close").click();
        });
    });
});
