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
      .setDescription("> 🏷 **Abra um ticket apenas se for necessário!**
> ❓ **Dúvidas, Compras ou qualquer outro assunto** que precise de ajuda, estamos aqui para isso.")
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
