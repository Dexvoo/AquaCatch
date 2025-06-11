const { SlashCommandBuilder, EmbedBuilder, Colors, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionContextType, ApplicationIntegrationType } = require('discord.js');
const { UserInventory, FishCatalog } = require('../../models/UserSetups');
require('dotenv').config();

module.exports = {
    cooldown: 5,
    category: 'Game',
    userpermissions: [],
    botpermissions: [],
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Looks at your inventory, with in a guild')
        .setIntegrationTypes( [ApplicationIntegrationType.GuildInstall] )
        .setContexts( InteractionContextType.Guild ),

    /**
     * @param {CommandInteraction} interaction
     */

    async execute(interaction) {
        const { client } = interaction;

        await interaction.deferReply();
        

        let inventory = await UserInventory.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });

        if (!inventory) {
            inventory = new UserInventory({ userId: interaction.user.id, guildId: interaction.guild.id });
            await inventory.save();
        }

        const fishCatalog = await FishCatalog.find({});

        const fishes = inventory.inventory
            .filter(item => item.type === 'fish')
            .map(fish => {
                const catalogEntry = fishCatalog.find(entry => entry.fishId === fish.itemId);
                return {
                    ...fish,
                    name: catalogEntry?.name || 'Unknown Fish',
                    rarity: catalogEntry?.rarity || 'Unknown',
                    emoji: catalogEntry?.emoji || '',
                    quantity: fish.quantity,
                    itemId: fish.itemId,
                };
            })
            .sort((a, b) => a.itemId - b.itemId);

        const fishList = fishes
            .map(fish => `${fish.quantity}x ${fish.emoji} ${fish.name} (${fish.rarity})`)
            .join('\n') || 'No fish in inventory.';
        const items = inventory.inventory.filter(item => item.type === 'item');

        const itemList = items.map(item => `${item.quantity}x ${item.itemId}`).join('\n') || 'No items in inventory.';

        const inventoryEmbed = new EmbedBuilder()
            .setColor(Colors.Aqua)
            .setTitle('Your Inventory')
            .addFields(
                { name: 'Fish', value: fishList, inline: true },
                { name: 'Items', value: itemList, inline: true },
                { name: 'Currency', value: `${inventory.currency} <:Seashell:1354465979739930755>`, inline: false },
            )
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        await interaction.editReply({ embeds: [inventoryEmbed] });

        

        
    }
};