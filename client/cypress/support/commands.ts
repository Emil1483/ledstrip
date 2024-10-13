/// <reference types="cypress" />

import { addClerkCommands } from '@clerk/testing/cypress'
addClerkCommands({ Cypress, cy })

export {};

declare global {
    namespace Cypress {
        interface Chainable {
       
        }
    }
}