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
        .setName('updatefishdb')
        .setDescription('(Developer) Reloads a command')
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


        const fishList = [
            // Common
            { fishId: '001', name: "Anchovy", rarity: "Common", weight: 0.5, price: 10, emoji: "<:Anchovy:1354466956744462389>"},
            { fishId: '002', name: "Goldfish", rarity: "Common", weight: 0.4, price: 8, emoji: "<:Goldfish:1354468063851843736>"},
            { fishId: '003', name: "YellowPerch", rarity: "Common", weight: 0.8, price: 15, emoji: "<:YellowPerch:1354468449530679437>"},
            
            // Uncommon
            { fishId: '004', name: "Bass", rarity: "Uncommon", weight: 1.0, price: 25, emoji: "<:Bass:1354467900882292887>"},
            { fishId: '005', name: "Clownfish", rarity: "Uncommon", weight: 0.7, price: 18, emoji: "<:Clownfish:1354467321703301283>"},
            { fishId: '006', name: "RainbowTrout", rarity: "Uncommon", weight: 1.5, price: 35, emoji: "<:RainbowTrout:1354468246551793847>"},
            { fishId: '007', name: "Salmon", rarity: "Uncommon", weight: 2.0, price: 40, emoji: "<:Salmon:1354468285495906456>"},
            
            // Rare
            { fishId: '008', name: "Arowana", rarity: "Rare", weight: 3.0, price: 50, emoji: "<:Arowana:1354467864580591798>"},
            { fishId: '009', name: "BlueAngelfish", rarity: "Rare", weight: 1.5, price: 45, emoji: "<:BlueAngelfish:1354467202178351266>"},
            { fishId: '010', name: "CrabKing", rarity: "Rare", weight: 2.5, price: 65, emoji: "<:CrabKing:1354467484190904502>"},
            
            // Epic
            { fishId: '011', name: "Anglerfish", rarity: "Epic", weight: 5.0, price: 100, emoji: "<:Anglerfish:1354467019784720454>"},
            { fishId: '012', name: "GreatWhiteShark", rarity: "Epic", weight: 8.0, price: 150, emoji: "<:GreatWhiteShark:1354467614059008162>"},
            
            // Legendary
            { fishId: '013', name: "BlueGroper", rarity: "Legendary", weight: 10.0, price: 250, emoji: "<:BlueGroper:1354467273095778334>"},
            { fishId: '014', name: "Pearl", rarity: "Legendary", weight: 12.0, price: 200, emoji: "<:Pearl:1354465804694851675>"},

            // Mythic
            { fishId: '015', name: "Upside Down Jellyfish", rarity: "Mythic", weight: 15.0, price: 400, emoji: "<:UpsideDownJellyfish:1354466866088771675>"}
        ];
        
        
        // const fishList = [
        //     // Common
        //     { itemId: '001', name: "Anchovy", rarity: "Common", weight: 0.5, price: 10, emoji: "<:Anchovy:1354466956744462389>", catchChance: 0.75 },
        //     { itemId: '002', name: "Bluegill", rarity: "Common", weight: 0.6, price: 12, emoji: "<:Bluegill:1354467943395623153>", catchChance: 0.7 },
        //     { itemId: '003', name: "Goldfish", rarity: "Common", weight: 0.4, price: 8, emoji: "<:Goldfish:1354468063851843736>", catchChance: 0.8 },
        //     { itemId: '004', name: "Guppy", rarity: "Common", weight: 0.3, price: 5, emoji: "<:Guppy:1354468102426857565>", catchChance: 0.85 },
        //     { itemId: '005', name: "NeonTetra", rarity: "Common", weight: 0.2, price: 6, emoji: "<:NeonTetra:1354468191673384980>", catchChance: 0.8 },
        //     { itemId: '006', name: "SilverjawMinnow", rarity: "Common", weight: 0.3, price: 7, emoji: "<:SilverjawMinnow:1354468344115232819>", catchChance: 0.7 },
        //     { itemId: '007', name: "YellowPerch", rarity: "Common", weight: 0.8, price: 15, emoji: "<:YellowPerch:1354468449530679437>", catchChance: 0.75 },
        
        //     // Uncommon
        //     { itemId: '008', name: "Angelfish", rarity: "Uncommon", weight: 0.9, price: 20, emoji: "<:Angelfish:1354467835132383513>", catchChance: 0.65 },
        //     { itemId: '009', name: "AppleCore", rarity: "Uncommon", weight: 0.2, price: 10, emoji: "<:AppleCore:1354462882447884288>", catchChance: 0.6 },
        //     { itemId: '010', name: "Bass", rarity: "Uncommon", weight: 1.0, price: 25, emoji: "<:Bass:1354467900882292887>", catchChance: 0.7 },
        //     { itemId: '011', name: "Clownfish", rarity: "Uncommon", weight: 0.7, price: 18, emoji: "<:Clownfish:1354467321703301283>", catchChance: 0.75 },
        //     { itemId: '012', name: "Flounder", rarity: "Uncommon", weight: 1.2, price: 30, emoji: "<:Flounder:1354467522203619360>", catchChance: 0.65 },
        //     { itemId: '013', name: "Jellyfish", rarity: "Uncommon", weight: 0.5, price: 12, emoji: "<:Jellyfish:1354467652533489826>", catchChance: 0.7 },
        //     { itemId: '014', name: "Pufferfish", rarity: "Uncommon", weight: 0.8, price: 22, emoji: "<:Pufferfish:1354466365645394152>", catchChance: 0.65 },
        //     { itemId: '015', name: "RainbowTrout", rarity: "Uncommon", weight: 1.5, price: 35, emoji: "<:RainbowTrout:1354468246551793847>", catchChance: 0.6 },
        //     { itemId: '016', name: "Salmon", rarity: "Uncommon", weight: 2.0, price: 40, emoji: "<:Salmon:1354468285495906456>", catchChance: 0.7 },
        //     { itemId: '017', name: "Tadpole", rarity: "Uncommon", weight: 0.1, price: 3, emoji: "<:Tadpole:1354468404718735521>", catchChance: 0.8 },
        //     { itemId: '018', name: "YellowTang", rarity: "Uncommon", weight: 0.6, price: 17, emoji: "<:YellowTang:1354466910304993310>", catchChance: 0.7 },
        
        //     // Rare
        //     { itemId: '019', name: "Arowana", rarity: "Rare", weight: 3.0, price: 50, emoji: "<:Arowana:1354467864580591798>", catchChance: 0.5 },
        //     { itemId: '020', name: "BlueAngelfish", rarity: "Rare", weight: 1.5, price: 45, emoji: "<:BlueAngelfish:1354467202178351266>", catchChance: 0.55 },
        //     { itemId: '021', name: "CrabBlue", rarity: "Rare", weight: 1.8, price: 55, emoji: "<:CrabBlue:1354467357535244318>", catchChance: 0.5 },
        //     { itemId: '022', name: "CrabDungeness", rarity: "Rare", weight: 2.0, price: 60, emoji: "<:CrabDungeness:1354467386186662009>", catchChance: 0.5 },
        //     { itemId: '023', name: "CrabKing", rarity: "Rare", weight: 2.5, price: 65, emoji: "<:CrabKing:1354467484190904502>", catchChance: 0.45 },
        //     { itemId: '024', name: "Goby", rarity: "Rare", weight: 0.6, price: 18, emoji: "<:Goby:1354467558824349798>", catchChance: 0.65 },
        //     { itemId: '025', name: "MorayEel", rarity: "Rare", weight: 2.2, price: 60, emoji: "<:MorayEel:1354467691007578295>", catchChance: 0.55 },
        //     { itemId: '026', name: "Mussel", rarity: "Rare", weight: 0.3, price: 8, emoji: "<:Mussel:1354468145645097111>", catchChance: 0.7 },
        //     { itemId: '027', name: "NapoleonWrasse", rarity: "Rare", weight: 2.0, price: 55, emoji: "<:NapoleonWrasse:1354467720753578242>", catchChance: 0.5 },
        //     { itemId: '028', name: "PurpleTang", rarity: "Rare", weight: 1.0, price: 30, emoji: "<:PurpleTang:1354466408142209044>", catchChance: 0.6 },
        //     { itemId: '029', name: "Seahorse", rarity: "Rare", weight: 0.3, price: 10, emoji: "<:Seahorse:1354466481949249681>", catchChance: 0.7 },
        //     { itemId: '030', name: "Surgeonfish", rarity: "Rare", weight: 1.0, price: 28, emoji: "<:Surgeonfish:1354466744080535572>", catchChance: 0.65 },
        //     { itemId: '031', name: "Stingray", rarity: "Rare", weight: 2.8, price: 65, emoji: "<:Stingray:1354466682625851685>", catchChance: 0.5 },
        
        //     // Epic
        //     { itemId: '032', name: "Anglerfish", rarity: "Epic", weight: 5.0, price: 100, emoji: "<:Anglerfish:1354467019784720454>", catchChance: 0.4 },
        //     { itemId: '033', name: "Coral", rarity: "Epic", weight: 0.2, price: 20, emoji: "<:Coral:1354465717843525826>", catchChance: 0.75 },
        //     { itemId: '034', name: "GreatWhiteShark", rarity: "Epic", weight: 6.0, price: 150, emoji: "<:GreatWhiteShark:1354467614059008162>", catchChance: 0.3 },
        //     { itemId: '035', name: "RibbonEel", rarity: "Epic", weight: 2.0, price: 75, emoji: "<:RibbonEel:1354466454627422440>", catchChance: 0.4 },
        //     { itemId: '036', name: "Starfish", rarity: "Epic", weight: 0.5, price: 25, emoji: "<:Starfish:1354466590326001855>", catchChance: 0.7 },
        //     { itemId: '037', name: "Tuna", rarity: "Epic", weight: 3.5, price: 90, emoji: "<:Tuna:1354466815492882604>", catchChance: 0.45 },
        
        //     // Legendary
        //     { itemId: '038', name: "BlueGroper", rarity: "Legendary", weight: 10.0, price: 250, emoji: "<:BlueGroper:1354467273095778334>", catchChance: 0.2 },
        //     { itemId: '039', name: "Pearl", rarity: "Legendary", weight: 9.3, price: 200, emoji: "<:Pearl:1354465804694851675>", catchChance: 0.6 },
        //     { itemId: '040', name: "Upside Down Jellyfish", rarity: "Legendary", weight: 0.3, price: 400, emoji: "<:UpsideDownJellyfish:1354466866088771675>", catchChance: 0.1 },
        
            
        //     // lure
        //     // rusty can
        //     // bottle
        //     // worm
        //     // sand dollar
        //     // shrimp
        //     // seashell
        // ];
    
        for (const fish of fishList) {
            await FishCatalog.updateOne({ fishId: fish.fishId }, fish, { upsert: true });
        }
    
        console.log("Fish database updated!");
    
        const Embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription('Fish database updated!');
    
        await interaction.editReply({ embeds: [Embed] });

        
    }
};