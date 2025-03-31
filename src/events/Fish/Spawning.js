const { Events, Client, EmbedBuilder, Colors } = require('discord.js');
const { consoleLogData } = require('../../utils/LoggingData.js');
require('dotenv').config();
const { GuildSettings, ActiveFish, FishCatalog } = require('../../models/UserSetups.js');
// const {  } = process.env;

module.exports = {
    name: Events.ClientReady,
    once: false,
    nickname: 'Fish Spawning',

    /**
	 * @param {Client} client - Discord Client
	 */
    async execute(client) {
        async function spawnFish() {
            try {
                const guilds = await GuildSettings.find({ enabled: true });
                if (!guilds?.length) return consoleLogData(`Fish Spawning`, `No guilds found`, 'error');

                const allFish = await FishCatalog.find({}).sort({ percentage: -1 });
                if(!allFish?.length) return consoleLogData(`Fish Spawning`, `No fish in catalog found`, 'error');



                await Promise.all(guilds.map(async (guild) => {
                    const { guildId, channelId } = guild;
                    consoleLogData(`Guild: ${guildId}`, `Start | Spawning Fish`, 'success');

                    const channel = await client.channels.fetch(channelId).catch(() => null);
                    if(!channel) {
                        consoleLogData(`Guild: ${guildId}`, `Channel not found, disabling fish spawns`, 'error');
                        await GuildSettings.findOneAndUpdate({guildId}, { enabled: false });
                        return;
                    }

                    const activeFish = await ActiveFish.findOne({guildId});
                    if(activeFish) {
                        const activeFishMessage = await channel.messages.fetch(activeFish.messageId).catch(() => null);
                        const messages = await channel.messages.fetch({ limit: 1 });
                        const lastMessageInChannel = messages.first()
                        if(activeFishMessage?.id === lastMessageInChannel?.id) {
                            consoleLogData(`Guild: ${guildId}`, `Active Fish wasnt claimed, skipping`, 'debug');
                            return
                        }
                    }


                    const chosenFish = getRandomFish(allFish);

                    const fishEmbed = new EmbedBuilder()
                    .setColor(Colors.Aqua)
                    .setDescription(`A ${chosenFish.rarity} **${chosenFish.emoji}** has appeared!`);

                    const fishMessage = await channel.send({embeds: [fishEmbed]});
                    await ActiveFish.findOneAndUpdate(
                        { guildId },
                        { fishId: chosenFish.fishId, messageId: fishMessage.id, channelId: channelId,  spawnTime: Date.now() },
                        { upsert: true, new: true }
                    );

                    consoleLogData(`Guild: ${guildId}`, `Fish spawned: ${chosenFish.name}`, 'success');

                }));
                
            } catch (error) {
                console.log(error)

            }

        }
        let interval = Math.floor(Math.random() * 60000) + 180000;
        setInterval(() => {
            interval = Math.floor(Math.random() * 60000) + 180000;
            spawnFish();
        }, interval);
        spawnFish();
            
    }
};

/**
 * Selects a fish based on weight.
 * @param {Array} allFish - Array of fish objects.
 * @returns {Object} - The selected fish.
 */
function getRandomFish(allFish) {
    let totalWeight = 0;
    for (const fish of allFish) totalWeight += fish.weight;
    
    let randomNum = Math.random() * totalWeight;
    for (const fish of allFish) {
        randomNum -= fish.weight;
        if (randomNum <= 0) return fish;
    }

    return allFish[0]; // Fallback if no fish is chosen
}