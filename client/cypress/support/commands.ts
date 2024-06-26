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

    const userEmail = Cypress.env("TEST_USER_EMAIL");
    const userPassword = Cypress.env("TEST_USER_PASSWORD");

    if (!userEmail) {
        throw new Error("Environment variable TEST_USER_EMAIL must be defined");
    }

    if (!userPassword) {
        throw new Error(
            "Environment variable TEST_USER_PASSWORD must be defined"
        );
    }

    cy.visit("/sign-in");
    cy.window()
        .should((window) => {
            expect(window).to.not.have.property(`Clerk`, undefined);
            expect((window as any).Clerk.loaded).to.eq(true);
        })
        .then(async (window) => {
            const res = await (window as any).Clerk.client.signIn.create({
                identifier: userEmail,
                password: userPassword,
            });

            await (window as any).Clerk.setActive({
                session: res.createdSessionId,
            });
        });
});
