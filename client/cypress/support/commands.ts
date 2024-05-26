/// <reference types="cypress" />

export {};

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Initialize auth to a state where you're
             * logged in as the test user.
             *
             * @example cy.signIn()
             */
            signIn(): Chainable<void>;
        }
    }
}

Cypress.Commands.add(`signIn`, () => {
    cy.log(`Signing in.`);
    cy.visit("/sign-in");
    cy.window()
        .should((window) => {
            expect(window).to.not.have.property(`Clerk`, undefined);
            expect((window as any).Clerk.loaded).to.eq(true);
        })
        .then(async (window) => {
            const res = await (window as any).Clerk.client.signIn.create({
                identifier: Cypress.env(`TEST_USER_EMAIL`),
                password: Cypress.env(`TEST_USER_PASSWORD`),
            });

            await (window as any).Clerk.setActive({
                session: res.createdSessionId,
            });
        });
});
