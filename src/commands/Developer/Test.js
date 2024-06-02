const {
	SlashCommandBuilder,
	EmbedBuilder,
	CommandInteraction,
} = require('discord.js');

const {
	DeveloperIDs,
} = process.env;
require('dotenv').config();

module.exports = {
	cooldown: 10,
	catagory: 'Developer',
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('Developer test command.')
		.setDMPermission(false),

	/**
	 * @param {CommandInteraction} interaction
	 */
	async execute(interaction) {
		try {
			const { guild, member, options, client, channel } = interaction;
			

			console.log(DeveloperIDs);
			console.log(member.id);
			console.log(DeveloperIDs.includes(member.id));
			if (!DeveloperIDs.includes(member.id)) {
				const embed = new EmbedBuilder()
					.setTitle('Error')
					.setDescription('You are not a developer.')
				return await interaction.reply({ embeds: [embed] });
			}


			const embed = new EmbedBuilder()
				.setTitle('Test')
				.setDescription('Developer test command executed.')

			await interaction.reply({ embeds: [embed] });
		} catch (error) {
			console.log(error);
		}
	},
};
