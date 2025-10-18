const axios = require("axios");
const path = require("path");
const fs = require("fs");

module.exports = {
	config: {
		name: "eval",
		author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
		description: "Test code or download file from URL",
		category: "owner",
		guide: "{pn} <code to test or URL>"
	},

	logic: async function ({ api, event, cmdName, args, wl, commands, client }) {
		const input = args.join(" ");
		if(args[0].startsWith("https://")) {
			api.sendMessage({ attachment: args[0] }, event.chatID, event.messageID);
		}
		
		function output(msg) {
			if (typeof msg === "function" || typeof msg === "boolean" || typeof msg === "number")
				msg = msg.toString();
			else if (msg instanceof Map)
				msg = `Map(${msg.size}) ` + JSON.stringify(mapToObj(msg), null, 2);
			else if (typeof msg === "object")
				msg = JSON.stringify(msg, null, 2);
			else if (typeof msg === "undefined")
				msg = "undefined";

			api.sendMessage(msg, event.chatID, event.messageID);
		}
		function out(msg) {
			output(msg);
		}
		function mapToObj(map) {
			const obj = {};
			for (const [key, value] of map.entries())
				obj[key] = value;
			return obj;
		}

		try {
			await eval(`(async () => { ${input} })()`);
		} catch (e) {
			throw e;
		}
	}
};
