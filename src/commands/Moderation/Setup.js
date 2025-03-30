const { SlashCommandBuilder, Colors, CommandInteraction, InteractionContextType, ApplicationIntegrationType, PermissionFlagsBits, EmbedBuilder, AutocompleteInteraction, ChannelType } = require('discord.js');
const path = require('node:path');
const fsPromises = require('node:fs').promises;
require('dotenv').config();
const { DeveloperIDs } = process.env;
const { GuildSettings } = require('../../models/UserSetups');
const { permissionCheck } = require('../../utils/Permissions');

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
                .addChannelTypes( ChannelType.GuildText)
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
        const { options, guild, client } = interaction;

        await interaction.deferReply();

        
        const channel = options.getChannel('channel'); 
        const enabled = options.getBoolean('enabled');

        // check bot can type in channel
        const requiredPermissions = [ PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles ];
        const [hasPermissions, missingPermissions] = permissionCheck(channel, requiredPermissions, client);
        
        if (!hasPermissions) {
            const Embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`Bot Missing Permissions: \`${missingPermissions}\` in ${channel}`);
            return await interaction.editReply({ embeds: [Embed], flags: [MessageFlags.Ephemeral] });
        }


        let guildSettings = await GuildSettings.findOne({ guildId: guild.id });

        if(!guildSettings) {
            guildSettings = new GuildSettings({
                guildId: guild.id,
                channelId: channel.id,
            });

            await guildSettings.save();
        };

        guildSettings.enabled = enabled;
        guildSettings.channelId = channel.id;
        await guildSettings.save();

        const Embed = new EmbedBuilder()
            .setColor(enabled ? Colors.Green : Colors.Red)
            .setDescription(`Drops have been ${enabled ? 'enabled' : 'disabled'} in ${channel}`);

        await interaction.editReply({ embeds: [Embed] });
        
        
    }
};