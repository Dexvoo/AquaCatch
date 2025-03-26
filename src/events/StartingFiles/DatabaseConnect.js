const { Events, Client } = require('discord.js');
const { consoleLogData } = require('../../utils/LoggingData.js');
const mongoose = require('mongoose');
require('dotenv').config();
const { MongoDB } = process.env;

module.exports = {
	name: Events.ClientReady,
	once: true,
	nickname: 'Database Connect',

	/**
	 * @param {Client} client - Discord Client
	 */

	async execute(client) {
		mongoose.set('strictQuery', false);
		await mongoose.connect(MongoDB);

		mongoose.connection.on('connected', () => consoleLogData(`Shard: #${client.shard.ids}`, 'Connected to MongoDB', 'success'));
		mongoose.connection.on('error', (err) => consoleLogData(`Shard: #${client.shard.ids}`, err, 'error'));
	}
}