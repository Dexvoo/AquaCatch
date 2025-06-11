const { SlashCommandBuilder, EmbedBuilder, Colors, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionContextType, ApplicationIntegrationType } = require('discord.js');
const { UserInventory, GuildSettings } = require('../../models/UserSetups');
require('dotenv').config();
const ms = require('ms');

module.exports = {
    cooldown: 5,
    category: 'Game',
    userpermissions: [],
    botpermissions: [],
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claims your daily reward, with in a guild')
        .setIntegrationTypes( [ApplicationIntegrationType.GuildInstall] )
        .setContexts( InteractionContextType.Guild ),

    /**
     * @param {CommandInteraction} interaction
     */

    async execute(interaction) {
        const { client } = interaction;

        await interaction.deferReply();
        

        let guildSettingsData = await GuildSettings.findOne({ guildId: interaction.guild.id });
        if (!guildSettingsData) {
            guildSettingsData = new GuildSettings({ guildId: interaction.guild.id });
            await guildSettingsData.save();
        }

        if (!guildSettingsData.enabled) {
            const Embed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription('AquaCatch is not enabled in this server. Please contact the server owner to enable it with `/setup`.');

            return interaction.editReply({ embeds: [Embed] });
        }

        let inventory = await UserInventory.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
        if (!inventory) {
            inventory = new UserInventory({ userId: interaction.user.id, guildId: interaction.guild.id });
            await inventory.save();
        }

        const now = new Date();
        const lastClaimed = inventory.lastClaimed ? new Date(inventory.lastClaimed) : new Date(0);

        const timeSinceLastClaim = now - lastClaimed;
        const oneDay = 1000 * 60 * 60 * 24; // Seconds * Minutes * Hours
        const twoDays = oneDay * 2;

        let resetStreak = false;
        let canClaim = false;

        if(timeSinceLastClaim >= oneDay && timeSinceLastClaim < twoDays) {
            // Claimed within the last 24 hours but not more than 2 days
            inventory.dailyStreak += 1;
            inventory.lastClaimed = now;
            canClaim = true;
        } else if (timeSinceLastClaim >= twoDays) {
            // Missed more than 2 full days
            inventory.dailyStreak = 1; // Reset streak to 1
            inventory.lastClaimed = now;
            resetStreak = true;
            canClaim = true;
        }

        if (canClaim) {
            const dailyReward = guildSettingsData.dailyReward || 100; // Default to 100 if not set
            inventory.currency += dailyReward;
            await inventory.save();

            const Embed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setDescription(`You have claimed your daily reward of ${dailyReward} ${guildSettingsData.currencyName || 'coins'}!`);

            if (resetStreak) {
                Embed.addFields({ name: 'Streak Reset', value: 'Your daily streak has been reset.' });
            } else {
                Embed.addFields({ name: 'Daily Streak', value: `Your current daily streak is ${inventory.dailyStreak} days.` });
            }

            return interaction.editReply({ embeds: [Embed] });
        } else {
            const timeLeft = oneDay - timeSinceLastClaim;
            const Embed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription(`You must wait ${ms(timeLeft, { long: true })} before claiming your daily again.`);

            return interaction.editReply({ embeds: [Embed] });
        }

    }
};