const { Events, Client, CommandInteraction, EmbedBuilder, Colors, Guild } = require('discord.js');
const { consoleLogData } = require('../../utils/LoggingData.js');
require('dotenv').config();

const { DevGuildID, LeaveGuildLogCID } = process.env;



module.exports = {
    name: Events.GuildCreate,
    once: false,
    nickname: 'Guild Leave Logs',

    /**
     * @param {Guild} guild - Discord Guild
     */
    async execute(guild) {
        const { client, name, id, ownerId } = guild;

        try {
            if(!name) return;

            const memberCount = guild.memberCount.toLocaleString() || 'Unknown';

            const devGuild = client.guilds.cache.get(DevGuildID) || await client.guilds.fetch(DevGuildID);
            if (!devGuild) {
                return consoleLogData('Guild Leave Logs', 'Guild not found', 'error');
            }

            const devChannel = devGuild.channels.cache.get(LeaveGuildLogCID) || await devGuild.channels.fetch(LeaveGuildLogCID);
            if (!devChannel) {
                return consoleLogData('Guild Leave Logs', 'Channel not found', 'error');
            }

            const Embed = new EmbedBuilder()
                .setTitle('Guild Left')
                .setColor(Colors.Red)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .addFields(
                    { name: 'Guild', value: `${name} (${id})`, inline: false },
                    { name: 'Owner', value: `<@${ownerId}>`, inline: true },
                    { name: 'Members', value: guild.memberCount.toLocaleString() || 'Unknown', inline: true }
                );

            await devChannel.send({ content: '<@&1246584580845080627>', embeds: [Embed] });
        } catch (error) {
            consoleLogData('Command Logs', `Failed to send embed: ${error.message}`, 'error');
        }
    }
};