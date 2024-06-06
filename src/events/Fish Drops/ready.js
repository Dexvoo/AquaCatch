const { Events, Message, ChannelType, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const FishDrops = require('../../models/GuildFishDrops');

module.exports = {
    name: Events.MessageCreate,
    once: true,
    nickname: 'Fish Drops',

    /**
    * @param {Message} message
    * @returns
    */
    async execute(message) {
        // Variables
        const { guild, channel, author } = message;

        if (!guild) return;

        // Check if the message author is a bot
        if (author.bot) return;

        // Check if the message channel is a text channel
        if (channel.type !== ChannelType.GuildText) return;

        // Find the guild in the database
        const guildData = await FishDrops.findOne({ guild: guild.id });

        if (!guildData) return;

        // Initialize cache if it does not exist
        if (!global.cache) {
            global.cache = {};
        }

        // Initialize cache for the guild if it does not exist
        if (!global.cache[guild.id]) {
            global.cache[guild.id] = { lastDrop: 0, messagesSinceDrop: 0 };
        }

        // if there has been no fish drop in the last 10 minutes or there have been 5 messages since the last fish drop
        if (global.cache[guild.id].lastDrop + 600000 < Date.now() || global.cache[guild.id].messagesSinceDrop >= 5) {
            // set the last drop time to now
            global.cache[guild.id].lastDrop = Date.now();
            // set the messages since drop to 0
            global.cache[guild.id].messagesSinceDrop = 0;

            const GuildChannel = guild.channels.cache.get(guildData.channel);

            if (!GuildChannel) return;

            const Button = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel('Catch')
                .setCustomId(`catch.${guild.id}`);

            const row = new ActionRowBuilder().addComponents(Button);

            const Embed = new EmbedBuilder()
                .setTitle('Fish Drop')
                .setDescription('A fish has been dropped!')
                .setColor('Random');

            GuildChannel.send({ embeds: [Embed], components: [row] }).then((msg) => {

                const filter = (button) => button.customId === `catch.${guild.id}`;
                const collector = GuildChannel.createMessageComponentCollector({ filter, time: 300000 });

                collector.on('collect', async (button) => {
                    if (button.user.bot) return;

                    const caughtEmbed = new EmbedBuilder()
                        .setTitle('Fish Caught')
                        .setDescription(`You have caught the fish!`)
                        .setColor('Green');

                    await button.reply({ embeds: [caughtEmbed], ephemeral: true});
					


					const CollectedButton = new ButtonBuilder()
						.setStyle(ButtonStyle.Primary)
						.setLabel('Collect')
						.setCustomId(`collect`)
						.setDisabled(true);

					const CollectedRow = new ActionRowBuilder().addComponents(CollectedButton);

					const CollectedEmbed = new EmbedBuilder()
						.setTitle('Fish Collected')
						.setDescription(`${button.user.username} has collected the fish!`)
						.setColor('Green');
					await msg.edit({ embeds: [CollectedEmbed], components: [CollectedRow]});
					collector.stop();
                });

				collector.on('end', async () => {
					const ExpiredButton = new ButtonBuilder()
						.setStyle(ButtonStyle.Danger)
						.setLabel('Expired')
						.setDisabled(true)
						.setCustomId(`expired`);

					const ExpiredRow = new ActionRowBuilder().addComponents(ExpiredButton);

					const ExpiredEmbed = new EmbedBuilder()
						.setTitle('Fish Expired')
						.setDescription('The fish has expired!')
						.setColor('Red');

					await msg.edit({ embeds: [ExpiredEmbed], components: [ExpiredRow] });
				});
            });
        } else {
            // increment the messages since drop
            global.cache[guild.id].messagesSinceDrop++;
        }
    },
};
