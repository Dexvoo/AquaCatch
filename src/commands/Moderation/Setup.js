const { SlashCommandBuilder, EmbedBuilder, CommandInteraction, ChannelType } = require('discord.js');
// const { DeveloperIDs } = process.env;
require('dotenv').config();
const FishDrops = require('../../models/GuildFishDrops');

module.exports = {
    cooldown: 5,
    catagory: 'Moderation',
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup the bot for your server')
        .setDMPermission(false)
        .addBooleanOption(option => option.setName('toggle').setDescription('Enable random fish drops').setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('The channel where random fish drops will spawn').addChannelTypes(ChannelType.GuildText).setRequired(false)),

    /**
     * @param {CommandInteraction} interaction
     */

    async execute(interaction) {

        const { guild, options } = interaction;

        if(!guild) {
            const Embed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription('This command can only be used in a server!')
                .setColor('Red');
            return await interaction.reply({ embeds: [Embed] });
        }

        
        // Variables
        const Toggle = options.getBoolean('toggle');
        const Channel = options.getChannel('channel');

        if (!Toggle) {

            await FishDrops.findOneAndDelete({ guild: guild.id }, (err) => {
                if (err) {
                    console.log(err);
                }
            });

            const Embed = new EmbedBuilder()
                .setTitle('Success')
                .setDescription('Fish drops have been disabled!')
                .setColor('Green');

            return await interaction.reply({ embeds: [Embed] });

        }


        if (!Channel) {
            const Embed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription('You need to provide a channel!')
                .setColor('Red');

            return await interaction.reply({ embeds: [Embed] });
        }


        const data = {
            guild: guild.id,
            channel: Channel.id,
        };

        await FishDrops.findOneAndUpdate({ guild: guild.id }, data, {
            upsert: true,
        });

        const Embed = new EmbedBuilder()
            .setTitle('Success')
            .setDescription('Fish drops have been enabled!')
            .setColor('Green');

        return await interaction.reply({ embeds: [Embed] });
    }
};