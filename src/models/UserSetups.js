const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const UserInventory = new Schema({
    userId: { type: String, required: true, unique: true }, // Discord User ID
    guildId: { type: String, required: true }, // Discord Guild ID
    inventory: [
        {
            fishId: { type: String, required: true }, // Unique ID of the fish
            name: { type: String, required: true }, // Fish name
            quantity: { type: Number, default: 1 }, // Amount of this fish
        }
    ]
});

const FishCatalog = new Schema({
    fishId: { type: String, required: true, unique: true }, // Unique fish ID
    name: { type: String, required: true }, // Fish name
    rarity: { type: String, required: true }, // Common, Rare, Legendary, etc.
    weight: { type: Number, required: true }, // Average weight
    price: { type: Number, required: true }, // Sell price
    emoji: { type: String, required: true } // Emoji for the fish
});

const GuildSettings = new Schema({
    guildId: { type: String, required: true, unique: true }, // Discord Guild ID
    channelId: { type: String, required: true }, // Channel ID for fish spawns
    enabled: { type: Boolean, default: false }, // Fish spawns enabled or disabled
    spawnRate: { type: Number, default: 1 }, // Fish spawn x1 rate
    currencyName: { type: String, default: "Coins" }, // Name of the currency
    sellMultiplier: { type: Number, default: 1 }, // Sell price multiplier
});

module.exports = {
    UserInventory: model('User-Inventory', UserInventory),
    GuildSettings: model('Guild-Settings', GuildSettings),
    FishCatalog: model('Fish-Catalog', FishCatalog),
};