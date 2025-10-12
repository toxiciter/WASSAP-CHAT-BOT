const msg = require("./sendMessage.js")

module.exports = (event, client) => {
    console.log('[ 📥 CUSTOM EVENT ]', event);
    
    const sendMessage = msg(event, client);

    if (event.body.toLowerCase() === 'ping') {
        event.reply('pong!');
    }

    if (event.body.startsWith('eval ')) {
        try {
            const code = event.body.split(' ').slice(1).join(' ');
            const result = eval(code);
            event.reply("✅ Eval Result:\n" + result);
        } catch (err) {
            event.reply("❌ Eval Error:\n" + err.message);
        }
    }
}