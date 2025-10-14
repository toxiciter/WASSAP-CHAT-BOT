module.exports = {
	config: {
		name: "eval",
		author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
		description: "Test code or download file from URL",
		category: "owner",
		guide: "{pn} <code to test or URL>"
	},

	logic: async function ({ api, event, cmdName, args }) {
		const input = args.join(" ");
		
		function output(msg) {
			if (typeof msg === "function" || typeof msg === "boolean" || typeof msg === "number")
				msg = msg.toString();
			else if (msg instanceof Map)
				msg = `Map(${msg.size}) ` + JSON.stringify(mapToObj(msg), null, 2);
			else if (typeof msg === "object")
				msg = JSON.stringify(msg, null, 2);
			else if (typeof msg === "undefined")
				msg = "undefined";

			event.reply(msg);
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
			console.error(e.message);
			event.reply(e.message);
		}
	}
};
