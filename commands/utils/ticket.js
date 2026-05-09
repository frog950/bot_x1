const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "setup-ticket",
  aliases: ["ticket", "st"],
  run: async (client, message, args) => {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply(`:x: | Você não tem permissão.`);
    }

    const embed = new EmbedBuilder()
      .setTitle("🎫 Central de Suporte")
      .setDescription("Precisa de ajuda? Clique no botão abaixo para abrir um ticket de atendimento.")
      .setFooter({ text: `${message.guild.name} - 2026`, iconURL: message.guild.iconURL() })
      .setColor("Green");

    const btn = new ButtonBuilder()
      .setLabel("Abrir Ticket")
      .setCustomId("open_ticket")
      .setStyle(ButtonStyle.Success)
      .setEmoji("📩");

    const row = new ActionRowBuilder().addComponents(btn);

    await message.channel.send({ embeds: [embed], components: [row] });
    message.delete();
  }
};
