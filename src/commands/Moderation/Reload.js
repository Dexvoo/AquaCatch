const { SlashCommandBuilder, Colors, CommandInteraction, InteractionContextType, ApplicationIntegrationType, PermissionFlagsBits, EmbedBuilder, AutocompleteInteraction } = require('discord.js');
const path = require('node:path');
const fsPromises = require('node:fs').promises;
require('dotenv').config();
const { DeveloperIDs } = process.env;

module.exports = {
    cooldown: 0,
    category: 'Moderation',
    userpermissions: [],
    botpermissions: [],
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup the bot')
        .setIntegrationTypes( [ApplicationIntegrationType.GuildInstall] )
        .setContexts( InteractionContextType.Guild )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to setup drops in')
                .setRequired(true)
        )
        
        .addBooleanOption(option =>
            option.setName('enabled')
                .setDescription('Enable or disable drops')
                .setRequired(true)
        ),

    /**
    * @param {CommandInteraction} interaction
    */

    async execute(interaction) {
        const { options, client, user } = interaction;

        await interaction.deferReply();

        
        const channel = options.getChannel('channel');
        const enabled = options.getBoolean('enabled');

        
        
    }
};

async function crawlDirectory(currentDirectory, targetCommandName) {
    const allDirectories = await fsPromises.readdir(currentDirectory, { withFileTypes: true });

    for (const directory of allDirectories) {
        const newPath = path.join(currentDirectory, directory.name);

        if (directory.isDirectory()) {
            const result = await crawlDirectory(newPath, targetCommandName);
            if (result) return result;
        }

        if (!directory.name.endsWith('.js')) continue;

        const command = require(newPath);
        if(!command) continue;

        if ('data' in command && 'execute' in command) {
            if (command.data.name === targetCommandName) {
                return newPath;
            }
        }
    }

    return false;
}