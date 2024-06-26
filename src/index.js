const { Client, GatewayIntentBits, Collection, Events, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const { cleanConsoleLogData, cleanConsoleLog } = require('./utils/ConsoleLogs');
const { Token } = process.env;
const path = require('node:path');
const fsPromises = require('fs').promises

// Creating a new client
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds, // Guild create/update/delete events (roles, channels, threads)
		// GatewayIntentBits.GuildMembers, // Member add/update/remove events
		GatewayIntentBits.GuildModeration, // Ban add/remove and Guild audit log events
		GatewayIntentBits.GuildEmojisAndStickers, // Emoji and sticker create/update/delete events
		// GatewayIntentBits.GuildIntegrations, // Integration create/update/delete events
		// GatewayIntentBits.GuildWebhooks, // Webhook create/update/delete events
		GatewayIntentBits.GuildInvites, // Invite create/update/delete events
		GatewayIntentBits.GuildVoiceStates, // Voice state create/update/delete events
		// GatewayIntentBits.GuildPresences, // Presence update events
		GatewayIntentBits.GuildMessages, // Message create/update/delete events
		// GatewayIntentBits.GuildMessageReactions, // Reaction add/remove events
		// GatewayIntentBits.GuildMessageTyping, // Typing start events
		GatewayIntentBits.DirectMessages, // DM create/update/delete events
		// GatewayIntentBits.DirectMessageReactions, // Reaction add/remove events
		// GatewayIntentBits.DirectMessageTyping, // Typing start events
		GatewayIntentBits.MessageContent, // Message content in DMs and guilds
		// GatewayIntentBits.GuildScheduledEvents, // Scheduled event create/update/delete events
		GatewayIntentBits.AutoModerationConfiguration, // Auto-moderation config update events
		GatewayIntentBits.AutoModerationExecution, // Auto-moderation execution events
	],
});


client.commands = new Collection();
client.cooldowns = new Collection();

const init = async () => {
	let commandsDirectory = path.join(__dirname, 'commands');
	let eventsDirectory = path.join(__dirname, 'events');
	let modelsDirectory = path.join(__dirname, 'models');

	cleanConsoleLog('Loading Commands');
	await commandsCrawl(commandsDirectory, [], client);
	cleanConsoleLog('Loaded Commands');
	await eventsCrawl(eventsDirectory, [], client);
	cleanConsoleLog('Loaded Events');
	await modelsCrawl(modelsDirectory, [], client);
	cleanConsoleLog('Loaded Models');
};


cleanConsoleLog('Aqua Catch Discord Bot');
cleanConsoleLogData('Created by: @Dexvo and @lcsmith', ' ');
init();


// Cooldowns

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	// Get cooldowns from client
	const { cooldowns } = client;

	// Check if the command has a cooldown
	if (!cooldowns.has(command.data.name)) {
		cooldowns.set(command.data.name, new Collection());
	}

	// Variables
	const now = Date.now();
	const timestamps = cooldowns.get(command.data.name);
	const defaultCooldown = 5;
	const cooldownAmount = (command.cooldown || defaultCooldown) * 1000;

	// Check if the user is on cooldown
	if (timestamps.has(interaction.user.id)) {
		const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

		if (now < expirationTime) {
			const expiredTimestamp = Math.round(expirationTime / 1000);
			const CooldownEmbed = new EmbedBuilder()
				.setTitle('Command Cooldown')
				.setDescription('You are on cooldown!')
				.addFields(
					{
						name: 'Command',
						value: `\`/${command.data.name}\``,
						inline: true,
					},
					{
						name: 'Cooldown Ends',
						value: `<t:${expiredTimestamp}:R>`,
					}
				);
			const cooldownMessage = await interaction.reply({
				embeds: [CooldownEmbed],
				ephemeral: true,
			});
			return setTimeout(() => cooldownMessage.delete(), cooldownAmount - 2000);
		}
	}

	// Set the cooldown
	timestamps.set(interaction.user.id, now);
	setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			const Embed = new EmbedBuilder()
				.setColor('Red')
				.setDescription('There was an error while executing this command!')
			await interaction.followUp({ embeds: [Embed] });
		} else {
			const Embed = new EmbedBuilder()
				.setColor('Red')
				.setDescription('There was an error while executing this command!')
			await interaction.reply({ embeds: [Embed] });
		
		}
	}
});































async function commandsCrawl(directory, filesArray) {
	const files = filesArray;
	const dirs = await fsPromises.readdir(directory, {
		withFileTypes: true,
	});

	//loop through all files/directories
	for (let i = 0; i < dirs.length; i++) {
		let currentDir = dirs[i];
		let newPath = path.join(directory, currentDir.name);

		if (currentDir.isDirectory()) {
			//if directory commandsCrawl again.
			await commandsCrawl(newPath, files);
		} else {
			//If it is a file append it to the array
			if (currentDir.name.endsWith('.js')) {
				files.push(newPath);

				const command = await require(newPath);

				if ('data' in command && 'execute' in command) {
					cleanConsoleLogData(
						command.data.name,
						command.data.description,
						'info'
					);
					client.commands.set(command.data.name, command);
				} else {
					cleanConsoleLogData(currentDir.name, ' ', 'error');
				}
			}
		}
	}
}

async function eventsCrawl(directory, filesArray) {
	const dirs = await fsPromises.readdir(directory, {
		withFileTypes: true,
	});

	//loop through all files/directories
	for (let i = 0; i < dirs.length; i++) {
		let currentDir = dirs[i];
		let newPath = path.join(directory, currentDir.name);

		if (currentDir.isDirectory()) {
			//if directory commandsCrawl again.
			await eventsCrawl(newPath, filesArray);
		} else {
			//If it is a file append it to the array
			if (currentDir.name.endsWith('.js')) {
				filesArray.push(newPath);

				const event = await require(newPath);

				if ('name' in event && 'execute' in event) {
					if (event.once) {
						client.once(event.name, (...args) =>
							event.execute(...args, client)
						);
					} else {
						client.on(event.name, (...args) => event.execute(...args, client));
					}
					cleanConsoleLogData(event.name, event.nickname, 'info');
				} else {
					cleanConsoleLogData(currentDir.name, ' ', 'error');
				}
			}
		}
	}
}

async function modelsCrawl(directory, filesArray) {
	const dirs = await fsPromises.readdir(directory, {
		withFileTypes: true,
	});

	//loop through all files/directories
	for (let i = 0; i < dirs.length; i++) {
		let currentDir = dirs[i];
		let newPath = path.join(directory, currentDir.name);

		if (currentDir.isDirectory()) {
			//if directory commandsCrawl again.
			await modelsCrawl(newPath, filesArray);
		} else {
			//If it is a file append it to the array
			if (currentDir.name.endsWith('.js')) {
				filesArray.push(newPath);

				const model = await require(newPath);

				if (model.length > 0) {
					cleanConsoleLogData(currentDir.name, ' ', 'info');
				} else {
					cleanConsoleLogData(currentDir.name, ' ', 'error');
				}
			}
		}
	}
}

// Client login
client.login(Token)