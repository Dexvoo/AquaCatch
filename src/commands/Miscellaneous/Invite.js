const { SlashCommandBuilder, EmbedBuilder, Colors, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionContextType, ApplicationIntegrationType, PermissionFlagsBits, MessageFlags } = require('discord.js');
require('dotenv').config();
const { DeveloperMode, SupportServerUrl } = process.env;

module.exports = {
    cooldown: 5,
    category: 'Miscellaneous',
    userpermissions: [],
    botpermissions: [],
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Provides the invite link to the support server and installs')
        .setIntegrationTypes( [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall] )
        .setContexts( InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel ),

    /**
     * @param {CommandInteraction} interaction
     */

    async execute(interaction) {
        const { client, channel } = interaction;
        
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Support Server')
                .setURL(SupportServerUrl),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Guild/User Installs')
                .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}`)
                .setDisabled(DeveloperMode === 'true')
        );

        const text = `Need help? Join our support server! User installs and Guild installs are available.`;

        await interaction.deferReply({ /* flags: [MessageFlags.Ephemeral] */ });

        const hasEmbedPerms = interaction.guild ? channel.permissionsFor(client.user).has(PermissionFlagsBits.EmbedLinks) : true;
        
        if(hasEmbedPerms) {
            const inviteEmbed = new EmbedBuilder()
                .setColor(Colors.Aqua)
                .setDescription(text)
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
            return await interaction.editReply({ embeds: [inviteEmbed], components: [buttons] });
        } else {
            return await interaction.editReply({ content: text, components: [buttons] });
        }
    }
};