const { Events, Client, ActivityType } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	nickname: 'Client Presence',

	/**
	 * @param {Client} client - Discord Client
	 */

	async execute(client) {
		client.user.setActivity(`AquaCatch! #${client.shard.ids}`, {
			type: ActivityType.Playing,
		});
	}
};