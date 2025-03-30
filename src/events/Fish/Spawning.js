const { Events, Client, EmbedBuilder, Colors } = require('discord.js');
const { consoleLogData } = require('../../utils/LoggingData.js');
require('dotenv').config();

const { GuildSettings, ActiveFish, FishCatalog } = require('../../models/UserSetups.js');

const {  } = process.env;



module.exports = {
    name: Events.ClientReady,
    once: false,
    nickname: 'Command Logs',

    /**
	 * @param {Client} client - Discord Client
	 */
    async execute(client) {
        const {  } = client;

        async function SpawnFish() {
            const guilds = await GuildSettings.find({ enabled: true });

            if (!guilds || guilds.length === 0) return;

            for (const guild of guilds) {
                const { guildId, channelId } = guild;

                const activeFish = await ActiveFish.findOne({ guildId });

                if(activeFish) {
                    const channel = await client.channels.fetch(channelId).catch(() => null);
                    if (!channel) {

                        // disable guild settings if channel not found
                        await GuildSettings.findOneAndUpdate({ guildId }, { enabled: false });
                        // dm the owner of the guild
                        const guildObj = await client.guilds.fetch(guildId).catch(() => null);
                        if (guildObj) {
                            const owner = await guildObj.fetchOwner().catch(() => null);
                            if (owner) {
                                await owner.send(`The channel for fish spawns in your server has been deleted. The fish spawns have been disabled.`).catch(() => null);
                            }
                        }
                        consoleLogData(`Guild: ${guildId}`, `Channel not found: ${channelId}`, 'error');
                        continue;
                    }

                    const message = await channel.messages.fetch(activeFish.messageId).catch(() => null);
                    if (message) {
                        // make sure its the last message in the channel

                        if (message.id !== activeFish.messageId) {
                            // NEED TO SPAWN NEW FISH AND DELETE THE OLD ONE
                            continue;
                        }
                    }
                    
                }







             





            };

        }
    }
};


function TimeDiffToString(diff) {
    const diffSeconds = Math.floor((diff / 1000) % 60);
    const diffMinutes = Math.floor((diff / (1000 * 60)) % 60);
    const diffHours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    let result = '';
    if (diffDays > 1) result += `${diffDays}d `;
    if (diffHours > 1) result += `${diffHours}h `;
    if (diffMinutes > 1) result += `${diffMinutes}m `;
    result += `${diffSeconds}s`;

    return result.trim();
}