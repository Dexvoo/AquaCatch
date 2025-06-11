const { Events, Client, EmbedBuilder, Colors, Message } = require('discord.js');
const { consoleLogData } = require('../../utils/LoggingData.js');
require('dotenv').config();
const { GuildSettings, ActiveFish, FishCatalog, UserInventory } = require('../../models/UserSetups.js');
const { addItemToInventory } = require('../../utils/InventoryManager.js')
const { timeFormatted } = require('../../utils/Time.js');

module.exports = {
    name: Events.MessageCreate,
    once: false,
    nickname: 'Fish Claiming',

    /**
     * @param {Message} message - Discord Client
     */
    async execute(message) {
        const { content, guild, channel, client, author, member } = message;

        if (!/^catch$/i.test(content)) return;

        // Fetch active fish data for the guild

        const guildData = await GuildSettings.findOne({guildId: guild.id});
        if(!guildData) return;

        if(!guildData.enabled) return;

        const activeFishData = await ActiveFish.findOne({ guildId: guild.id });
        if (!activeFishData) {
            message.react('😂');
            return;
        }

        // Fetch the channel where the fish was spawned
        const activeFishChannel = await client.channels.fetch(activeFishData.channelId);
        if (!activeFishChannel) {
            // If the channel doesn't exist, delete the active fish data
            await ActiveFish.findOneAndDelete({ guildId: guild.id });
            return consoleLogData(`Guild: ${guild.id}`, `Active fish channel not found. Fish data deleted.`, 'error');
        }

        // Fetch the message that spawned the fish
        const fishMessage = await activeFishChannel.messages.fetch(activeFishData.messageId).catch(() => null);
        if (!fishMessage) return;

        // Delete the active fish data from the database, as the fish has been claimed
        const deletedFish = await ActiveFish.findOneAndDelete({ guildId: guild.id });
        if (!deletedFish) return; // Another user already claimed it

        // Get the details of the fish from the catalog
        const fishDetails = await FishCatalog.findOne({ fishId: activeFishData.fishId });







        addItemToInventory(author.id, guild.id, activeFishData.fishId, 'fish')




        const timeCaught = timeFormatted((Date.now() - activeFishData.spawnTime) / 1000);

        // Respond to the user
        await message.reply(`**${member.displayName}** have successfully claimed a **${fishDetails.name}**! ${fishDetails.emoji} in **${ timeCaught.formatted}**`);

        // Log the claim
        consoleLogData(`Guild: ${guild.id}`, `Fish claimed: ${fishDetails.name} by ${author.username}`, 'success');
    }
};