/**
 * Time formatting function.
 * @param {Number} time - Number of seconds to format.
 * @returns {Object} - Object containing the formatted time string and timestamp.
 * @property {string} formatted - The formatted time string.
 * @property {string} timestamp - The timestamp string formatted for Discord.
 */

function timeFormatted(time) {

    let string = '';
    const seconds = (time % 60).toFixed(2);
    const minutes = Math.floor((time / 60) % 60);
    const hours = Math.floor((time / 3600) % 24);
    const days = Math.floor((time / 86400) % 30);
    const months = Math.floor((time / 2592000) % 12);
    const years = Math.floor(time / 31536000);



    if (years >= 1) string += `${years}y, `;
    if (months >= 1) string += `${months}mo, `;
    if (days >= 1) string += `${days}d, `;
    if (hours >= 1) string += `${hours}h, `;
    if (minutes >= 1) string += `${minutes}m, `;
    if (seconds >= 1) string += `${seconds}s`;
    else string += '0s';
    return {
        formatted: string,
        timestamp: `<t:${Math.floor(Date.now() / 1000 + time)}:R>`
    };
};

module.exports = { timeFormatted };