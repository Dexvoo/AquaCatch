const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const UserInventory = new Schema({
    userId: { type: String, required: true }, // Discord User ID
    guildId: { type: String, required: true }, // Discord Guild ID

    dailyStreak: { type: Number, default: 0 }, // Daily streak for rewards
    lastClaimed: { type: Date, default: null }, // Last claimed date for daily rewards

    fishingRod: { type: String, default: "Basic Rod" }, // Equipped rod

    currency: { type: Number, default: 0 }, // Emoji for the currency

    inventory: [
        {
            itemId: { type: String, required: true }, // Unique ID of the fish
            quantity: { type: Number, default: 1 }, // Amount of this fish
            type: { type: String, required: true }
        }
    ],

}, { timestamps: true });

// Add an index for efficient lookups
UserInventory.index({ userId: 1, guildId: 1 }, { unique: true });

const FishCatalog = new Schema({
    fishId: { type: String, required: true, unique: true }, // Unique item ID
    name: { type: String, required: true }, // Item name
    rarity: { type: String, required: true }, // Common, Rare, Legendary, etc.
    weight: { type: Number, required: true }, // Average weight
    price: { type: Number, required: true }, // Sell price
    emoji: { type: String, required: true }, // Emoji for the fish
    percentage: { type: Number, required: true }, // Percentage chance to catch this fish
});

const GuildSettings = new Schema({
    guildId: { type: String, required: true, unique: true }, // Discord Guild ID
    channelId: { type: String, required: true }, // Channel ID for fish spawns
    enabled: { type: Boolean, default: false }, // Fish spawns enabled or disabled
    spawnRate: { type: Number, default: 1 }, // Fish spawn x1 rate
    currencyName: { type: String, default: "Seashells" }, // Name of the currency
    sellMultiplier: { type: Number, default: 1 }, // Sell price multiplier
    dailyReward: { type: Number, default: 100 } // Daily coins reward
});

const GuildActiveFish = new Schema({
    guildId: { type: String, required: true, unique: true }, // Discord Guild ID
    channelId: { type: String, required: true }, // Channel ID for fish spawns
    messageId: { type: String, required: true }, // Message ID for fish spawns
    fishId: { type: String, required: true }, // Fish ID
    spawnTime: { type: Date, required: true }, // Time when the fish spawns
});

module.exports = {
    UserInventory: model('User-Inventory', UserInventory),
    GuildSettings: model('Guild-Settings', GuildSettings),
    FishCatalog: model('Fish-Catalog', FishCatalog),
    ActiveFish: model('Active-Fish', GuildActiveFish),
};