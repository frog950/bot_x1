const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js")

module.exports = {
  name: "creatematch",
  aliases: ["create_match", "cm"],
  run: async(client, message, args) => {
    if (!message.member.permissions.has("Administrator")) return message.reply(`:x: | Você não tem permissão para utilizar ssse comando.`)
    const matchType = args[0];
    if (!matchType) return message.reply(`:x: | Informe o tipo de partida`);
    
    const embed = new EmbedBuilder()
      .setTitle(`🧧・ ${args.join(" ")}`)
      .addFields([
        {
          name: "<:gelo:1502756772497330236> | Fila Gelo Normal", value: "Ninguém"
        }, {
          name: "<:gelo:1502756772497330236> | Fila Gelo Infinito", value: "Ninguém"
        }
      ])
      .setFooter({ text: `${message.guild.name} - 2026`, iconURL: message.guild.iconURL() })
      .setColor("Gray")
      
    const gelNormalButton = new ButtonBuilder()
      .setLabel("Gelo Normal")
      .setCustomId("gelnormal")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("<:gelo:1467622151732465816>")
      
    const gelInfinitoButton = new ButtonBuilder()
      .setLabel("Gelo Infinito")
      .setCustomId("gelinfinito")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("<:gelo:1467622151732465816>")
      
    const row = new ActionRowBuilder().addComponents(gelNormalButton, gelInfinitoButton)
    
    const msg = await message.channel.send({
      embeds: [embed], components: [row]
    })
    message.delete()
    client.database.set(`match_${msg.id}`, {})
    
  }
}
