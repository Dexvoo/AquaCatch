const { SlashCommandBuilder, Colors, CommandInteraction, InteractionContextType, ApplicationIntegrationType, PermissionFlagsBits, EmbedBuilder, AutocompleteInteraction } = require('discord.js');
const path = require('node:path');
const fsPromises = require('node:fs').promises;
require('dotenv').config();
const { DeveloperIDs } = process.env;
const { FishCatalog } = require('../../models/UserSetups');

module.exports = {
    cooldown: 0,
    category: 'Developer',
    userpermissions: [],
    botpermissions: [],
    data: new SlashCommandBuilder()
        .setName('percentages')
        .setDescription('(Developer) Info')
        .setIntegrationTypes( [ApplicationIntegrationType.GuildInstall] )
        .setContexts( InteractionContextType.Guild )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    /**
    * @param {CommandInteraction} interaction
    */

    async execute(interaction) {
        const { options, client, user } = interaction;

        await interaction.deferReply();

        if(!DeveloperIDs.includes(user.id)) {
            const Embed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription('You do not have permission to use this command');
            return interaction.editReply({ embeds: [Embed] });
        }

        const fishData = await FishCatalog.find({});

        if(!fishData) {
            const FailedEmbed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle('Error')
                .setDescription('No fish data was found');

            return interaction.editReply({embeds: [FailedEmbed]});
        }

        let string = ''
        for(const fish of fishData) {
            string += `ID: ${fish.fishId} | ${fish.emoji} | ${fish.percentage.toFixed(2)}%\n`
        }

        const FailedEmbed = new EmbedBuilder()
            .setColor(Colors.Aqua)
            .setTitle('Fish Percentages')
            .setDescription(string);

        return interaction.editReply({embeds: [FailedEmbed]});
        
    }
};