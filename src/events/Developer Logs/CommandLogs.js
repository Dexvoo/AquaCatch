const { Events, CommandInteraction, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const { cleanConsoleLogData } = require('../../utils/ConsoleLogs');
const { CommandLoggingChannelID } = process.env;


module.exports = {
    name: Events.InteractionCreate,
    nickname: 'Command Logs',
    once: false,


    /**
     * @param {CommandInteraction} interaction
     */

    async execute(interaction) {
        if (!interaction.isCommand()) return;

        const { guild, user, commandName } = interaction;
        const Channel = guild.channels.cache.get(CommandLoggingChannelID);
        if (!Channel) return cleanConsoleLogData('Command Logs', 'Failed to find channel', 'error')

        var guildName;
		var guildID;
		if (!guild) {
			guildName = 'No Guild';
			guildID = '0';
		} else {
			guildName = guild.name;
			guildID = guild.id;
		}


        const embed = new EmbedBuilder()
			.setTitle('Command Used')
			.addFields(
				{
					name: 'User',
					value: `@${user.username} (${user})`,
					inline: true,
				},
				{
					name: 'Guild',
					value: `${guildName} (${guildID})`,
				},
				{
					name: 'Channel',
					value: `${interaction.channel} (#${interaction.channel.name})`,
				},
				{
					name: 'Chat Command',
					value: `${interaction}`,
				},
				{
					name: 'Slash Command',
					value: `${commandName}`,
				},
				{
					name: "ID's",
					value: `\`\`\`ansi\n[2;31mUser | ${user.id}\n[2;36mCommand | ${
						interaction.commandId
					}\n[2;34mGuild | ${guildID || '0'}\`\`\``,
				}
			);

        Channel.send({ embeds: [embed] });
    }


};