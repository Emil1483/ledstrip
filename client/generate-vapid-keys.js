const webPush = require('web-push');
const vapidKeys = webPush.generateVAPIDKeys();

console.log('Paste the following keys in your .env file:')
console.log('-------------------')
console.log(`
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
NEXT_PUBLIC_VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
`)	