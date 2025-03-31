const { UserInventory } = require('../models/UserSetups.js');

/**
 * Adds a item/fish to the user's inventory.
 * @param {string} userId - The Discord user ID.
 * @param {string} guildId - The Discord guild ID.
 * @param {string} itemId - The ID of the fish/item.
 * @param {string} type - The type of the fish/item.
 */

async function addItemToInventory(userId, guildId, itemId, type) {
    let userInventory = await UserInventory.findOne({ userId, guildId});

    if(!userInventory) {
        userInventory = new UserInventory({
            userId, 
            guildId,
            inventory: [{ itemId, quantity: 1, type}]
        });
    } else {
        const existingItem = userInventory.inventory.find(item => item.itemId === itemId && item.type === type);

        if(existingItem) {
            existingItem.quantity += 1;
        } else {
            userInventory.inventory.push({ itemId, quantity: 1, type})
        }
    }

    await userInventory.save();
    
}


/**
 * Gets the quantity of a specific fish the user has.
 * @param {string} userId - The Discord user ID.
 * @param {string} guildId - The Discord guild ID.
 * @param {string} fishId - The ID of the fish.
 * @returns {Promise<number>} - The quantity of the fish the user owns.
 */
async function getFishCount(userId, guildId, fishId) {
    const userInventory = await UserInventory.findOne({ userId, guildId });

    if (!userInventory) return 0;

    const fishItem = userInventory.inventory.find(item => item.itemId === fishId && item.type === "fish");

    return fishItem ? fishItem.quantity : 0;
}


module.exports = { addItemToInventory, getFishCount };