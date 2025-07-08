require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  EmbedBuilder,
  Events
} = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

// Updated role IDs
const GUEDX_ID = '955969285686181898';
const BUYER_ROLE_ID = '1326070623407177781';
const OWNER_ROLE_ID = '1326035559843627113';
const SUPPORT_STAFF_ROLE_ID = '1326080998504398931';
const VIP_ROLE_ID = '1391953242467991562';

// Updated addresses and channels
const LTC_ADDRESS = 'ltc1qr3lqtfc4em5mkfjrhjuh838nnhnpswpfxtqsu8';
const TICKET_CHANNEL_ID = '1326015493156634735';
const RECEIPT_CHANNEL_ID = '1326015493156634735';

// Database management
let database = {
  userOrders: {},
  userTickets: {},
  userSpending: {},
  marketUsageCount: {},
  receiptChannelId: RECEIPT_CHANNEL_ID
};

// Store configurations
const STORE_CONFIGS = {
  deadrails: {
    name: 'Dead Rails',
    emoji: '🚂',
    color: 0xD2B48C, // Light brown
    image: 'https://cdn.discordapp.com/attachments/1328934670296944790/1391958696124485733/images_45.jpg?ex=686dca0e&is=686c788e&hm=9808b7ec1ca02392f810b3e46dfba685fb2be2fb073dc601abd7683c03661a5e&',
    categories: [
      { label: 'Classes', value: 'classes', emoji: '⚔️' },
      { label: 'Trains', value: 'trains', emoji: '🚂' },
      { label: 'Everything', value: 'everything', emoji: '🧾' }
    ]
  },
  gag: {
    name: 'Grow a Garden',
    emoji: '🌿',
    color: 0x00FF00, // Green
    image: 'https://cdn.discordapp.com/attachments/1328934670296944790/1391958696472346744/images_46.jpg?ex=686dca0e&is=686c788e&hm=49110f39c5cfc9ae0e809896cff77824adde9796b498a5d6783b6e79993a9eb0&',
    categories: [
      { label: 'Sheckles', value: 'sheckles', emoji: '🥕' }
    ]
  },
  fisch: {
    name: 'Fisch',
    emoji: '🐟',
    color: 0xADD8E6, // Light blue
    image: 'https://cdn.discordapp.com/attachments/1328934670296944790/1391958696799764712/images_1751653085130.jpg?ex=686dca0e&is=686c788e&hm=0ed296cf799a23fa43421966a34b3a4f27296dc485051cdbfaeefa9077909875&',
    categories: [
      { label: 'Fishes', value: 'fishes', emoji: '🐟' },
      { label: 'Money', value: 'money', emoji: '💰' },
      { label: 'Relics', value: 'relics', emoji: '🗿' },
      { label: 'Rods', value: 'rods', emoji: '🎣' },
      { label: 'Aurora Totems', value: 'totems', emoji: '🪔' }
    ]
  }
};

// Dead Rails products and pricing
const DEADRAILS_PRODUCTS = {
  classes: [
    { label: 'Musician', emoji: '🎵', price: 20 },
    { label: 'Miner', emoji: '⛏️', price: 20 },
    { label: 'Doctor', emoji: '🩺', price: 20 },
    { label: 'Arsonist', emoji: '🔥', price: 20 },
    { label: 'Packmaster', emoji: '📦', price: 20 },
    { label: 'Necromancer', emoji: '💀', price: 20 },
    { label: 'Conductor', emoji: '🎼', price: 20 },
    { label: 'Werewolf', emoji: '🐺', price: 20 },
    { label: 'The Alamo', emoji: '🏰', price: 20 },
    { label: 'High Roller', emoji: '🎲', price: 20 },
    { label: 'Cowboy', emoji: '🤠', price: 20 },
    { label: 'Hunter', emoji: '🏹', price: 20 },
    { label: 'Milkman', emoji: '🥛', price: 20 },
    { label: 'Demolitionist', emoji: '💣', price: 20 },
    { label: 'Survivalist', emoji: '🪖', price: 20 },
    { label: 'Priest', emoji: '✝️', price: 20 },
    { label: 'Zombie', emoji: '🧟', price: 20 },
    { label: 'Vampire', emoji: '🧛', price: 20 },
    { label: 'President', emoji: '🇺🇸', price: 20 },
    { label: 'Ironclad', emoji: '🛡️', price: 20 }
  ],
  trains: [
    { label: 'Cattle Car', emoji: '🐄', price: 20 },
    { label: 'Gold Rush', emoji: '🏆', price: 20 },
    { label: 'Passenger Train', emoji: '🚆', price: 20 },
    { label: 'Armored Train', emoji: '🚋', price: 20 },
    { label: 'Ghost Train', emoji: '👻', price: 20 },
    { label: 'Wooden Train', emoji: '🪵', price: 20 }
  ]
};

// Fisch pricing and products
const FISCH_PRICES = {
  fishes: {
    'ss_nessie': 20,
    'ss_phantom_megalodon': 15,
    'megalodon': 5,
    'ancient_megalodon': 7,
    'northstar_serpent': 10,
    'whale_shark': 5,
    'kraken': 10,
    'orca': 10
  },
  money: 20,
  relics: 20,
  totems: 40,
  rods: {
    'rod_of_the_depths': 50,
    'trident_rod': 60,
    'heavens_rod': 55,
    'kraken_rod': 55,
    'poseidon_rod': 50,
    'great_rod_of_oscar': 50,
    'ethereal_prism_rod': 60,
    'tempest_rod': 55
  }
};

const FISCH_GAMEPASS_LINKS = {
  5: ['https://www.roblox.com/game-pass/31127384/Donate'],
  7: ['https://www.roblox.com/game-pass/31127094/Donate'],
  10: ['https://www.roblox.com/game-pass/31127528/Donate'],
  15: ['https://www.roblox.com/game-pass/31127845/Donate'],
  20: ['https://www.roblox.com/game-pass/31168454/Donate'],
  30: ['https://www.roblox.com/game-pass/1033147082/30'],
  40: ['https://www.roblox.com/game-pass/1027394973/40'],
  50: ['https://www.roblox.com/game-pass/1031209691/50'],
  55: ['https://www.roblox.com/game-pass/1031209691/50'],
  60: ['https://www.roblox.com/game-pass/1033311218/60'],
  75: ['https://www.roblox.com/game-pass/1027662399/75'],
  100: ['https://www.roblox.com/game-pass/31588015/Big-Donation'],
  200: ['https://www.roblox.com/game-pass/1028527085/200'],
  300: ['https://www.roblox.com/game-pass/1032509615/300'],
  400: ['https://www.roblox.com/game-pass/1027496860/400']
};

const FISCH_PRODUCTS = {
  fishes: [
    { label: 'SS Nessie', value: 'ss_nessie', emoji: '🐟' },
    { label: 'SS Phantom Megalodon', value: 'ss_phantom_megalodon', emoji: '🐟' },
    { label: 'Megalodon', value: 'megalodon', emoji: '🐟' },
    { label: 'Ancient Megalodon', value: 'ancient_megalodon', emoji: '🐟' },
    { label: 'Northstar Serpent', value: 'northstar_serpent', emoji: '🐟' },
    { label: 'Whale Shark', value: 'whale_shark', emoji: '🐟' },
    { label: 'Kraken', value: 'kraken', emoji: '🐟' },
    { label: 'Orca', value: 'orca', emoji: '🐟' }
  ],
  money: [
    { label: '1 Million', value: '1_million', emoji: '💰' },
    { label: '5 Million', value: '5_million', emoji: '💰' },
    { label: '10 Million', value: '10_million', emoji: '💰' },
    { label: '20 Million', value: '20_million', emoji: '💰' },
    { label: '30 Million', value: '30_million', emoji: '💰' },
    { label: '40 Million', value: '40_million', emoji: '💰' },
    { label: '50 Million', value: '50_million', emoji: '💰' }
  ],
  relics: [
    { label: '100 Relics', value: '100_relics', emoji: '🗿' },
    { label: '500 Relics', value: '500_relics', emoji: '🗿' },
    { label: '1000 Relics', value: '1000_relics', emoji: '🗿' },
    { label: '1500 Relics', value: '1500_relics', emoji: '🗿' },
    { label: '2000 Relics', value: '2000_relics', emoji: '🗿' }
  ],
  totems: [
    { label: '5 Totems', value: '5_totems', emoji: '🪔' },
    { label: '10 Totems', value: '10_totems', emoji: '🪔' },
    { label: '15 Totems', value: '15_totems', emoji: '🪔' },
    { label: '20 Totems', value: '20_totems', emoji: '🪔' },
    { label: '25 Totems', value: '25_totems', emoji: '🪔' },
    { label: '30 Totems', value: '30_totems', emoji: '🪔' }
  ],
  rods: [
    { label: 'Rod of the Depths', value: 'rod_of_the_depths', emoji: '🎣' },
    { label: 'Trident Rod', value: 'trident_rod', emoji: '🎣' },
    { label: "Heaven's Rod", value: 'heavens_rod', emoji: '🎣' },
    { label: 'Kraken Rod', value: 'kraken_rod', emoji: '🎣' },
    { label: 'Poseidon Rod', value: 'poseidon_rod', emoji: '🎣' },
    { label: 'Great Rod of Oscar', value: 'great_rod_of_oscar', emoji: '🎣' },
    { label: 'Ethereal Prism Rod', value: 'ethereal_prism_rod', emoji: '🎣' },
    { label: 'Tempest Rod', value: 'tempest_rod', emoji: '🎣' }
  ]
};

// Maps for user data
const userTickets = new Map();
const userOrders = new Map();
const userItems = new Map();
const userEmbeds = new Map();

// Utility functions
function loadDatabase() {
  try {
    if (fs.existsSync('database.json')) {
      const data = fs.readFileSync('database.json', 'utf8');
      database = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading database:', error);
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync('database.json', JSON.stringify(database, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

function calculateDollarAmount(robux) {
  return (robux / 100).toFixed(2); // Update to reflect the new conversion rate
}

function getRobuxLink(robux) {
  if (robux <= 20) return 'https://www.roblox.com/game-pass/1044850980/20';
  if (robux <= 40) return 'http://www.roblox.com/game-pass/1027394973/40';
  return 'https://www.roblox.com/game-pass/1031209691/50';
}

function getFischPrice(category, value) {
  if (category === 'fishes') return FISCH_PRICES.fishes[value] || 20;
  if (category === 'money') return parseInt(value) * FISCH_PRICES.money;
  if (category === 'relics') return (parseInt(value) / 100) * FISCH_PRICES.relics;
  if (category === 'totems') return (parseInt(value) / 5) * FISCH_PRICES.totems;
  if (category === 'rods') return FISCH_PRICES.rods[value] || 50;
  return 20;
}

function getFischGamepassLinksForPrice(price) {
  if (FISCH_GAMEPASS_LINKS[price]) return FISCH_GAMEPASS_LINKS[price];
  const availablePrices = Object.keys(FISCH_GAMEPASS_LINKS).map(Number).sort((a, b) => b - a);
  let remaining = price;
  let passes = [];
  for (const p of availablePrices) {
    while (remaining >= p) {
      passes.push(...FISCH_GAMEPASS_LINKS[p]);
      remaining -= p;
    }
  }
  if (remaining > 0) {
    const closest = availablePrices.find(p => p >= remaining);
    if (closest) passes.push(...FISCH_GAMEPASS_LINKS[closest]);
  }
  return passes;
}

function updateUserSpending(userId, usdAmount, robuxAmount) {
  if (!database.userSpending[userId]) {
    database.userSpending[userId] = { totalUSD: 0, totalRobux: 0 };
  }
  database.userSpending[userId].totalUSD += usdAmount;
  database.userSpending[userId].totalRobux += robuxAmount;

  // Check for VIP eligibility (1000 robux or $10)
  const spending = database.userSpending[userId];
  return (spending.totalUSD >= 10 || spending.totalRobux >= 1000);
}

client.once('ready', () => {
  loadDatabase();
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  // Check if message starts with ! command
  if (message.content.toLowerCase().startsWith('!')) {
    // Only allow owner role to use any ! commands
    if (message.author.id !== GUEDX_ID) {
      const member = message.guild.members.cache.get(message.author.id);
      if (!member || !member.roles.cache.has(OWNER_ROLE_ID)) {
        return message.reply('i only obey to my daddy, buy me prada @guedx');
      }
    }
  }

  if (message.content.toLowerCase().startsWith('!addspending')) {

    const args = message.content.split(' ');
    if (args.length !== 4) {
      return message.reply("❌ Usage: `!addspending @user USD_amount Robux_amount`\nExample: `!addspending @Guedx 15.00 3600`");
    }

    const userMention = message.mentions.users.first();
    if (!userMention) {
      return message.reply("❌ Please mention a valid user!");
    }

    const usdAmount = parseFloat(args[2]);
    const robuxAmount = parseInt(args[3]);

    if (isNaN(usdAmount) || isNaN(robuxAmount) || usdAmount < 0 || robuxAmount < 0) {
      return message.reply("❌ Please provide valid positive numbers for USD and Robux amounts!");
    }

    // Update user spending
    if (!database.userSpending[userMention.id]) {
      database.userSpending[userMention.id] = { totalUSD: 0, totalRobux: 0 };
    }
    database.userSpending[userMention.id].totalUSD += usdAmount;
    database.userSpending[userMention.id].totalRobux += robuxAmount;

    // Check for VIP promotion (1000 robux or $10)
    const spending = database.userSpending[userMention.id];
    let vipMessage = '';

    if (spending.totalUSD >= 10 || spending.totalRobux >= 1000) {
      const member = message.guild.members.cache.get(userMention.id);
      if (member) {
        const vipRole = message.guild.roles.cache.get(VIP_ROLE_ID);
        if (vipRole && !member.roles.cache.has(VIP_ROLE_ID)) {
          try {
            await member.roles.add(vipRole);
            vipMessage = '\n🌟 **User promoted to VIP!** 🌟';
          } catch (error) {
            console.error('Error granting VIP role:', error);
          }
        }
      }
    }

    saveDatabase();

    const confirmEmbed = new EmbedBuilder()
      .setTitle('✅ Spending Added Successfully!')
      .setDescription(`**${userMention.username}** spending updated:`)
      .addFields(
        { name: '💰 Added This Time', value: `$${usdAmount.toFixed(2)} USD | ${robuxAmount.toLocaleString()} Robux`, inline: false },
        { name: '📊 Total Spending', value: `$${spending.totalUSD.toFixed(2)} USD | ${spending.totalRobux.toLocaleString()} Robux`, inline: false }
      )
      .setColor(0xFF0000)
      .setFooter({ text: `Added by ${message.author.username}` })
      .setTimestamp();

    if (vipMessage) {
      confirmEmbed.setDescription(confirmEmbed.data.description + vipMessage);
    }

    await message.reply({ embeds: [confirmEmbed] });
  }

  if (message.content.toLowerCase().startsWith('!removespent')) {

    const args = message.content.split(' ');
    if (args.length !== 2) {
      return message.reply("❌ Usage: `!removespent @user`\nExample: `!removespent @Guedx`");
    }

    const userMention = message.mentions.users.first();
    if (!userMention) {
      return message.reply("❌ Please mention a valid user!");
    }

    // Check if user has spending data
    const userSpend = database.userSpending[userMention.id];
    if (!userSpend || (userSpend.totalUSD === 0 && userSpend.totalRobux === 0)) {
      return message.reply(`❌ No spending data found for **${userMention.username}**!`);
    }

    // Remove spending data
    delete database.userSpending[userMention.id];
    saveDatabase();

    const confirmEmbed = new EmbedBuilder()
      .setTitle('✅ Spending Data Removed!')
      .setDescription(`**${userMention.username}**'s spending data has been completely removed.`)
      .addFields(
        { name: '🗑️ Removed Data', value: `$${userSpend.totalUSD.toFixed(2)} USD | ${userSpend.totalRobux.toLocaleString()} Robux`, inline: false }
      )
      .setColor(0xFF0000)
      .setFooter({ text: `Removed by ${message.author.username}` })
      .setTimestamp();

    await message.reply({ embeds: [confirmEmbed] });
  }

  if (message.content.toLowerCase() === '!spending') {

    const spendingData = [];

    for (const [userId, spending] of Object.entries(database.userSpending)) {
      if (spending.totalUSD > 0 || spending.totalRobux > 0) {
        try {
          const user = await message.guild.members.fetch(userId);
          spendingData.push({
            username: user.user.username,
            usd: spending.totalUSD,
            robux: spending.totalRobux
          });
        } catch (error) {
          spendingData.push({
            username: `Unknown User (${userId})`,
            usd: spending.totalUSD,
            robux: spending.totalRobux
          });
        }
      }
    }

    if (spendingData.length === 0) {
      return message.reply("📊 No spending data found. No members have made purchases yet.");
    }

    // Sort by USD spending (highest first)
    spendingData.sort((a, b) => b.usd - a.usd);

    let spendingText = '';
    let totalUSD = 0;
    let totalRobux = 0;

    spendingData.forEach((data, index) => {
      spendingText += `${index + 1}. **${data.username}** - $${data.usd.toFixed(2)} USD | ${data.robux.toLocaleString()} Robux\n`;
      totalUSD += data.usd;
      totalRobux += data.robux;
    });

    const spendingEmbed = new EmbedBuilder()
      .setTitle('💰 Member Spending Report')
      .setDescription(spendingText)
      .addFields(
        { name: '📊 Total Revenue', value: `$${totalUSD.toFixed(2)} USD | ${totalRobux.toLocaleString()} Robux`, inline: false },
        { name: '👥 Total Customers', value: `${spendingData.length} members`, inline: true }
      )
      .setColor(0xFF0000)
      .setTimestamp();

    await message.reply({ embeds: [spendingEmbed] });
  }

  if (message.content.toLowerCase() === '!market') {
    const robuxEmoji = client.emojis.cache.find(emoji => emoji.name === 'emoji_5');
    const ltcEmoji = client.emojis.cache.find(emoji => emoji.name === 'emoji_4');

    const bannerEmbed = new EmbedBuilder()
      .setImage("https://cdn.discordapp.com/attachments/1328934670296944790/1391956118263037992/Screenshot_2025-07-07-22-36-13-950_com.canva.editor.png?ex=686dc7a7&is=686c7627&hm=37d3bf50d512cd12b46ef5a4db7dd78e5931aa5e197d6d86095b52c7241618b7&")
      .setColor(0xFF0000);

    const welcomeEmbed = new EmbedBuilder()
      .setTitle("**Welcome to Guedx's Marketplace!🌋**")
      .setDescription(
        "This is the official hub for our **Roblox game store**, built for players who want to buy and dominate\n\n" +
        "💸 **What you'll find here:**\n\n" +
        "> " + (client.emojis.cache.find(emoji => emoji.name === 'emoji_6') ? `<:emoji_6:${client.emojis.cache.find(emoji => emoji.name === 'emoji_6').id}>` : '🍅') + " **Grow a Garden**\n" +
        "Buy Shekles: no farming, just pure progress\n\n" +
        "> " + (client.emojis.cache.find(emoji => emoji.name === 'emoji_8') ? `<:emoji_8:${client.emojis.cache.find(emoji => emoji.name === 'emoji_8').id}>` : '🦑') + " **Fisch**\n" +
        "Fishes, rods, relics, aurora totems and " + (client.emojis.cache.find(emoji => emoji.name === 'emoji_7') ? `<:emoji_7:${client.emojis.cache.find(emoji => emoji.name === 'emoji_7').id}>` : '💰') + ": stack your inventory, rule the waters\n\n" +
        "> " + (client.emojis.cache.find(emoji => emoji.name === 'emoji_9') ? `<:emoji_9:${client.emojis.cache.find(emoji => emoji.name === 'emoji_9').id}>` : '🧟') + " **Dead Rails**\n" +
        "Trains · Here you can buy cheap trains for 20 Robux / $0.20 each!\n" +
        "Classes · We also sell cheap classes for just 20 Robux / $0.20 each!\n\n" +
        "Need help? Ping staff, we're here to assist\n\n" +
        "**⚠️ Payment methods accepted:**\n" + (ltcEmoji ? `<:${ltcEmoji.name}:${ltcEmoji.id}>` : 'LTC') + " Litecoin and " + (robuxEmoji ? `<:${robuxEmoji.name}:${robuxEmoji.id}>` : 'Robux') + " Robux\n" +
        "**.     Never send payment without staff present**\n\n" +
        "**No DMs · Always open a ticket**\n" +
        "Let us handle the grind, you just play"
      )
      .setColor(0xFF0000);

    const deadRailsButton = new ButtonBuilder()
      .setCustomId('store_deadrails')
      .setLabel('Dead Rails')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🚂');

    const gagButton = new ButtonBuilder()
      .setCustomId('store_gag')
      .setLabel('Grow a Garden')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🌿');

    const fischButton = new ButtonBuilder()
      .setCustomId('store_fisch')
      .setLabel('Fisch')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🐟');

    const otherButton = new ButtonBuilder()
      .setCustomId('other_support')
      .setLabel('Other')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🪽');

    const row = new ActionRowBuilder().addComponents(deadRailsButton, gagButton);
    const row2 = new ActionRowBuilder().addComponents(fischButton, otherButton);

    await message.channel.send({ embeds: [bannerEmbed, welcomeEmbed], components: [row, row2] });
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {


    // Other button - placeholder for additional support
    if (interaction.customId === 'other_support') {
      await interaction.reply({
        content: '🪽 **Other Support** - Please ping staff for additional assistance!',
        ephemeral: true
      });
    }

    // Store selection buttons
    if (interaction.customId.startsWith('store_')) {
      const storeType = interaction.customId.split('_')[1];
      const config = STORE_CONFIGS[storeType];

      // Clear any existing cart when switching stores
      const existingItems = userItems.get(interaction.user.id) || [];
      if (existingItems.length > 0 && existingItems[0].store !== storeType) {
        userItems.delete(interaction.user.id);
        userOrders.delete(interaction.user.id);
      }

      const categoryMenu = new StringSelectMenuBuilder()
        .setCustomId(`category_select_${storeType}`)
        .setPlaceholder('Choose a category')
        .addOptions(config.categories);

      const row = new ActionRowBuilder().addComponents(categoryMenu);

      await interaction.reply({
        content: `${config.emoji} **Welcome to ${config.name}!** Select a category below:`,
        components: [row],
        ephemeral: true
      });
    }

    // Ticket confirmation buttons
    if (interaction.customId.startsWith('confirm_ticket_')) {
      const storeType = interaction.customId.split('_')[2];
      const config = STORE_CONFIGS[storeType];

      if (interaction.customId.endsWith('_yes')) {
        await createTicket(interaction, storeType);
      } else {
        await interaction.update({
          content: '❌ Ticket creation cancelled.',
          components: [],
          embeds: []
        });
      }
    }

    // Utility buttons in tickets
    if (interaction.customId === 'close_ticket') {
      const channel = interaction.channel;
      await interaction.reply({ content: '🔒 Closing ticket in 5 seconds...', ephemeral: true });
      setTimeout(async () => {
        await channel.delete();
      }, 5000);
    }

    if (interaction.customId === 'copy_ltc') {
      await interaction.reply({
        content: `Click to copy LTC address:\n\`${LTC_ADDRESS}\``,
        ephemeral: true
      });
    }

    if (interaction.customId === 'grant_buyer_role') {
      await handleBuyerRoleGrant(interaction);
    }
  }

  if (interaction.isStringSelectMenu()) {
    const selectedId = interaction.customId;

    // Category selection
    if (selectedId.startsWith('category_select_')) {
      const storeType = selectedId.split('_')[2];
      const selectedCategory = interaction.values[0];

      if (storeType === 'gag' && selectedCategory === 'sheckles') {
        // GAG sheckles - direct ticket creation confirmation
        await showTicketConfirmation(interaction, storeType, 'sheckles');
      } else if (storeType === 'deadrails' && selectedCategory === 'everything') {
        // Dead Rails everything bundle - direct ticket creation
        await showTicketConfirmation(interaction, storeType, 'everything');
      } else {
        // Show products for the category
        await showCategoryProducts(interaction, storeType, selectedCategory);
      }
    }

    // Product selection
    if (selectedId.startsWith('product_select_')) {
      const parts = selectedId.split('_');
      const storeType = parts[2];
      const category = parts[3];

      await handleProductSelection(interaction, storeType, category);
    }

    // Additional purchase menu
    if (selectedId === 'additional_purchase') {
      const choice = interaction.values[0];
      if (choice === 'no') {
        await interaction.update({ content: '✅ Your order is complete!', components: [] });
      } else {
        // Get store type from user's current order
        const userOrder = userOrders.get(interaction.user.id);
        const storeType = userOrder ? userOrder.store : 'deadrails'; // fallback to deadrails
        const config = STORE_CONFIGS[storeType];

        const categoryMenu = new StringSelectMenuBuilder()
          .setCustomId(`category_select_${storeType}`)
          .setPlaceholder('Choose a category')
          .addOptions(config.categories);

        const row = new ActionRowBuilder().addComponents(categoryMenu);
        await interaction.update({ content: 'Select another category:', components: [row] });
      }
    }
  }
});

async function showCategoryProducts(interaction, storeType, category) {
  let products = [];

  if (storeType === 'deadrails') {
    products = DEADRAILS_PRODUCTS[category] || [];
  } else if (storeType === 'fisch') {
    products = FISCH_PRODUCTS[category] || [];
  }

  if (products.length === 0) {
    await interaction.update({ content: 'No products available in this category.', components: [] });
    return;
  }

  let placeholder = `Choose a ${category.slice(0, -1)}`;
  // Fix grammar for specific categories
  if (category === 'fishes') placeholder = 'Choose a fish';
  if (category === 'classes') placeholder = 'Choose a class';

  const productMenu = new StringSelectMenuBuilder()
    .setCustomId(`product_select_${storeType}_${category}`)
    .setPlaceholder(placeholder)
    .addOptions(products.map(p => ({
      label: p.label,
      value: p.value || p.label.toLowerCase().replace(/ /g, '_'),
      emoji: p.emoji
    })));

  const row = new ActionRowBuilder().addComponents(productMenu);
  await interaction.update({
    content: `Select a product from **${category}** below:`,
    components: [row]
  });
}

async function handleProductSelection(interaction, storeType, category) {
  const user = interaction.user;
  const selectedProduct = interaction.values[0];

  // Add product to user's cart
  const prevList = userItems.get(user.id) || [];
  let productEntry;

  if (storeType === 'deadrails') {
    const displayName = selectedProduct.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    productEntry = { name: displayName, emoji: '🛒', price: 20, store: storeType };
  } else if (storeType === 'fisch') {
    const productName = FISCH_PRODUCTS[category].find(p => p.value === selectedProduct)?.label || selectedProduct;
    const price = getFischPrice(category, selectedProduct);
    const emoji = FISCH_PRODUCTS[category].find(p => p.value === selectedProduct)?.emoji || '🛒';
    productEntry = { name: productName, emoji, price, store: storeType };
  }

  // Check if user is trying to mix stores
  if (prevList.length > 0 && prevList[0].store !== storeType) {
    await interaction.update({ 
      content: `⚠️ You cannot mix items from different stores! Please complete your current order first or start a new ticket.`, 
      components: [] 
    });
    return;
  }

  // Check for duplicates
  if (prevList.find(p => p.name === productEntry.name)) {
    await interaction.update({ 
      content: `⚠️ You already added **${productEntry.name}**. Please remove it first if needed.`, 
      components: [] 
    });
    return;
  }

  const newList = [...prevList, productEntry];
  userItems.set(user.id, newList);

  // Calculate totals
  let total = newList.reduce((sum, item) => sum + item.price, 0);

  // Dead Rails special pricing
  if (storeType === 'deadrails' && newList.length > 3) {
    total = 50;
  }

  userOrders.set(user.id, { total, store: storeType, items: newList });

  // Update or create ticket
  await updateOrCreateTicket(interaction, user, storeType);

  // Ask for more products
  const moreMenu = new StringSelectMenuBuilder()
    .setCustomId('additional_purchase')
    .setPlaceholder('Anything else?')
    .addOptions([
      { label: 'Yes', value: 'yes', emoji: '👍' },
      { label: 'No', value: 'no', emoji: '✖️' }
    ]);
  const moreRow = new ActionRowBuilder().addComponents(moreMenu);

  await interaction.followUp({
    content: 'Do you want to purchase anything else?',
    components: [moreRow],
    ephemeral: true
  });
}

async function showTicketConfirmation(interaction, storeType, category) {
  const config = STORE_CONFIGS[storeType];

  const confirmEmbed = new EmbedBuilder()
    .setTitle('🎫 Open Ticket?')
    .setDescription(`Do you want to open a ticket for **${config.name}** ${category}?`)
    .setColor(0xFF0000);

  const confirmRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`confirm_ticket_${storeType}_yes`)
      .setLabel('Yes')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✅'),
    new ButtonBuilder()
      .setCustomId(`confirm_ticket_${storeType}_no`)
      .setLabel('No')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('❌')
  );

  await interaction.update({
    embeds: [confirmEmbed],
    components: [confirmRow]
  });
}

async function updateOrCreateTicket(interaction, user, storeType) {
  const guild = interaction.guild;
  const order = userOrders.get(user.id);
  const config = STORE_CONFIGS[storeType];

  const existingChannelId = userTickets.get(user.id);
  const existingChannel = existingChannelId ? guild.channels.cache.get(existingChannelId) : null;

  if (existingChannel) {
    // Update existing ticket
    const embedMsgId = userEmbeds.get(user.id);
    const embedMsg = await existingChannel.messages.fetch(embedMsgId);
    const embeds = createTicketEmbeds(order, config);
    const components = createTicketComponents();

    await embedMsg.edit({ embeds, components });
    await interaction.update({ content: '✅ Product added to your order!', components: [] });
  } else {
    // Create new ticket
    const channel = await guild.channels.create({
      name: `ticket-${user.username}`,
      type: ChannelType.GuildText,
      parent: TICKET_CHANNEL_ID,
      permissionOverwrites: [
        { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: GUEDX_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
      ]
    });

    const embeds = createTicketEmbeds(order, config);
    const components = createTicketComponents();

    const message = await channel.send({
      content: `<@${GUEDX_ID}>`,
      embeds,
      components
    });

    userTickets.set(user.id, channel.id);
    userEmbeds.set(user.id, message.id);

    await interaction.update({ content: '✅ Ticket created and product added!', components: [] });
  }
}

async function createTicket(interaction, storeType) {
  const user = interaction.user;
  const guild = interaction.guild;
  const config = STORE_CONFIGS[storeType];
  const robuxEmoji = client.emojis.cache.find(emoji => emoji.name === 'emoji_5');
  const ltcEmoji = client.emojis.cache.find(emoji => emoji.name === 'emoji_4');

  // Create ticket channel
  const channel = await guild.channels.create({
    name: `ticket-${user.username}`,
    type: ChannelType.GuildText,
    parent: TICKET_CHANNEL_ID,
    permissionOverwrites: [
      { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
      { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
      { id: GUEDX_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
    ]
  });

  // Create ticket embeds for GAG sheckles or Dead Rails everything
  const imageEmbed = new EmbedBuilder()
    .setImage(config.image)
    .setColor(config.color);

  let summaryEmbed, paymentEmbed;

  if (storeType === 'gag') {
    summaryEmbed = new EmbedBuilder()
      .setTitle('🛒 Order Summary')
      .setDescription('🥕 Sheckles discussion - Please specify your requirements with staff.')
      .setColor(config.color);

    paymentEmbed = new EmbedBuilder()
      .setTitle('💳 Payment Information')
      .setDescription(`
⚠️ **Please wait for support to arrive before making the payment!**

**Payment methods below**
🔸 **For LTC ${ltcEmoji ? `<:${ltcEmoji.name}:${ltcEmoji.id}>` : '🔶'}:** \`${LTC_ADDRESS}\`

💬 **Support will be here in 1–2 minutes to assist you.`)
      .setColor(0xffd700)
      .setThumbnail('https://cryptologos.cc/logos/litecoin-ltc-logo.png');
  } else if (storeType === 'deadrails') {
    summaryEmbed = new EmbedBuilder()
      .setTitle('🛒 Order Summary')
      .setDescription('🧾 Everything in-game = 50 robux\n\n📦 **Total:** 50 robux ($1.25)')
      .setColor(config.color);

    paymentEmbed = new EmbedBuilder()
      .setTitle('💳 Payment Information')
      .setDescription(`
⚠️ **Please wait for support to arrive before making the payment!**

**Payment methods below**
🔸 **For LTC ${ltcEmoji ? `<:${ltcEmoji.name}:${ltcEmoji.id}>` : '🔶'}:** \`${LTC_ADDRESS}\`
🔸 **For Robux ${robuxEmoji ? `<:${robuxEmoji.name}:${robuxEmoji.id}>` : '⚡'}:** [Click here to buy Everything for 50 Robux](${getRobuxLink(50)})

💬 **Support will be here in 1–2 minutes to assist you.`)
      .setColor(0xffd700)
      .setThumbnail('https://cryptologos.cc/logos/litecoin-ltc-logo.png');
  }

  const components = createTicketComponents();

  const message = await channel.send({
    content: `<@${GUEDX_ID}>`,
    embeds: [imageEmbed, summaryEmbed, paymentEmbed],
    components
  });

  userTickets.set(user.id, channel.id);
  userEmbeds.set(user.id, message.id);

  await interaction.update({
    content: '✅ Ticket created successfully!',
    components: [],
    embeds: []
  });
}

function createTicketEmbeds(order, config) {
  const imageEmbed = new EmbedBuilder()
    .setImage(config.image)
    .setColor(config.color);

  const productListText = order.items.map(p => `${p.emoji} ${p.name} = ${p.price} robux`).join('\n');
  const usd = calculateDollarAmount(order.total);
  const robuxEmoji = client.emojis.cache.find(emoji => emoji.name === 'emoji_5');
  const ltcEmoji = client.emojis.cache.find(emoji => emoji.name === 'emoji_4');

  const summaryEmbed = new EmbedBuilder()
    .setTitle('🛒 Order Summary')
    .setDescription(`${productListText}\n\n📦 **Total:** ${order.total} robux ($${usd})`)
    .setColor(config.color);

  let paymentDescription = `
⚠️ **Please wait for support to arrive before making the payment!**

**Payment methods below**
🔸 **For LTC ${ltcEmoji ? `<:${ltcEmoji.name}:${ltcEmoji.id}>` : '🔶'}:** \`${LTC_ADDRESS}\``;

  if (order.store === 'fisch') {
    const robuxLinks = getFischGamepassLinksForPrice(order.total);
    const robuxLinksFormatted = robuxLinks.map(link => {
      const priceEntry = Object.entries(FISCH_GAMEPASS_LINKS).find(([, links]) => links.includes(link));
      const price = priceEntry ? priceEntry[0] : '?';
      return `[${price} Robux Pass](${link})`;
    }).join('\n');
    paymentDescription += `\n🔸 **For Robux ${robuxEmoji ? `<:${robuxEmoji.name}:${robuxEmoji.id}>` : '⚡'}:** ${robuxLinksFormatted}`;
  } else {
    paymentDescription += `\n🔸 **For Robux ${robuxEmoji ? `<:${robuxEmoji.name}:${robuxEmoji.id}>` : '⚡'}:** [Click here to buy your order for ${order.total} Robux](${getRobuxLink(order.total)})`;
  }

  paymentDescription += `\n\n💬 **Support will be here in 1–2 minutes to assist you.`;

  const paymentEmbed = new EmbedBuilder()
    .setTitle('💳 Payment Information')
    .setDescription(paymentDescription)
    .setColor(0xffd700)
    .setThumbnail('https://cryptologos.cc/logos/litecoin-ltc-logo.png');

  return [imageEmbed, summaryEmbed, paymentEmbed];
}

function createTicketComponents() {
  const utilityRow1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('grant_buyer_role')
      .setLabel('Grant Buyer Role')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✅'),
    new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Close Ticket')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒')
  );

  const utilityRow2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('copy_ltc')
      .setLabel('Copy LTC Address')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('📋')
  );

  return [utilityRow1, utilityRow2];
}

async function handleBuyerRoleGrant(interaction) {
  const channel = interaction.channel;
  const guild = interaction.guild;

  // Find ticket creator
  let ticketCreatorId = null;
  for (const [userId, channelId] of userTickets.entries()) {
    if (channelId === channel.id) {
      ticketCreatorId = userId;
      break;
    }
  }

  if (!ticketCreatorId) {
    await interaction.reply({ content: '❌ Could not find ticket creator!', ephemeral: true });
    return;
  }

  const targetMember = guild.members.cache.get(ticketCreatorId);
  if (!targetMember) {
    await interaction.reply({ content: '❌ Ticket creator not found!', ephemeral: true });
    return;
  }

  // Check permissions
  const staffMember = guild.members.cache.get(interaction.user.id);
  const hasPermission = staffMember.roles.cache.has(SUPPORT_STAFF_ROLE_ID) || 
                       interaction.user.id === GUEDX_ID;

  if (!hasPermission) {
    await interaction.reply({ 
      content: '❌ You do not have permission to grant buyer roles!', 
      ephemeral: true 
    });
    return;
  }

  try {
    const buyerRole = guild.roles.cache.get(BUYER_ROLE_ID);
    const hadBuyerRole = targetMember.roles.cache.has(BUYER_ROLE_ID);

    if (!hadBuyerRole) {
      await targetMember.roles.add(buyerRole);
    }

    // Update spending and check VIP
    const shouldGetVIP = updateUserSpending(ticketCreatorId, 10, 1000); // Example values

    if (shouldGetVIP && !targetMember.roles.cache.has(VIP_ROLE_ID)) {
      const vipRole = guild.roles.cache.get(VIP_ROLE_ID);
      await targetMember.roles.add(vipRole);
    }

    saveDatabase();

    // Send receipt
    const receiptChannel = guild.channels.cache.get(RECEIPT_CHANNEL_ID);
    if (receiptChannel && receiptChannel.isTextBased()) {
      const receiptEmbed = new EmbedBuilder()
        .setTitle('💳 Purchase Receipt')
        .addFields(
          { name: '👤 Customer', value: targetMember.user.username, inline: true },
          { name: '🛠️ Staff Member', value: interaction.user.username, inline: true },
          { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
        )
        .setColor(shouldGetVIP ? 0xFFD700 : 0x00FF00)
        .setTimestamp();

      try {
        await receiptChannel.send({ embeds: [receiptEmbed] });
      } catch (error) {
        console.error('Error sending receipt:', error);
      }
    }

    await interaction.reply({ 
      content: `✅ Buyer role granted to ${targetMember.user.username}! Closing ticket in 5 seconds...`, 
      ephemeral: true 
    });

    setTimeout(async () => {
      await channel.delete();
    }, 5000);

  } catch (error) {
    console.error('Error granting buyer role:', error);
    await interaction.reply({ content: '❌ Error granting buyer role!', ephemeral: true });
  }
}

client.login(process.env.TOKEN);
