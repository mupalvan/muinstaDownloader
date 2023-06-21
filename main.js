const Insta = require('@androz2091/insta.js')

// Create an instance of a Instagram client
const client = new Insta.Client()

/**
 * The connected event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Instagram
 */
client.on('connected', () => {
    console.log('I am ready!')
})

// Create an event listener for messages
client.on('messageCreate', message => {
    // If the message is "ping"
    if (message.content === 'ping') {
        // Reply "pong"
        message.reply('pong')
    }
})

// Log our bot in using Instagram credentials
client.login('sisoc01', 'mona09917231343')
