const client = require("../index")
const { EmbedBuilder, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
module.exports = {
  name: "interactionCreate",
  run: async (interaction) => {
    
    const updateEmbed = () => {
      const data = client.database.get(`match_${interaction.message.id}`);
      
      const titleEmbed = interaction.message.embeds[0]?.data?.title
      const embed = new EmbedBuilder()
      .setTitle(titleEmbed)
      .addFields([
        {
          name: "<:gelo:1467622151732465816> | Fila Gelo Normal", value: data?.gelnormal?.length > 0 ? data?.gelnormal?.map(x => `<@${x}>`).join(", ") : "Ninguem"
        }, {
          name: "<:gelo:1467622151732465816> | Fila Gelo Infinito", value: data?.gelinfinito?.length > 0 ? data?.gelinfinito?.map(x => `<@${x}>`).join(", ") : "Ninguem"
        }
      ])
      .setFooter({ text: `${interaction.guild.name} - 2026`, iconURL: interaction.guild.iconURL() })
      .setColor("Blue")
      
      interaction.message.edit({ embeds: [embed] })
    }
    
    
    if (!interaction.isButton()) return;
    
    if (interaction.customId === "endmatch") {
      interaction.deferUpdate()
      interaction.channel.send("Canal sendo encerrado em 10 segundos...")
      setTimeout(() => {
        interaction.channel.delete().catch(err => {})
      }, 10000)
    }
    if (interaction.customId !== "gelnormal" && interaction.customId !== "gelinfinito") return;
    await interaction.deferReply({ flags: ["Ephemeral"]})
    const matchData = client.database.get(`match_${interaction.message.id}`);
    if (!matchData) return interaction.editReply({
      content: ":x: Não foi possivel identificar essa fila! Contate um administrador", flags: ["Ephemeral"]
    });
    
    const other = interaction.customId === "gelinfinito" ? "gelnormal" : "gelinfinito";
    const otherQueue = matchData[other];
    if (otherQueue?.includes(interaction.user.id)) {
      client.database.set(`match_${interaction.message.id}.${other}`, [])
    }
    if (matchData[interaction.customId]?.includes(interaction.user.id)) {
      client.database.set(`match_${interaction.message.id}.${interaction.customId}`, [])
      updateEmbed()
      return interaction.editReply({
        content: "> Você saiu da fila!", flags: ["Ephemeral"]
      })
    }
    
    
    if (matchData[interaction.customId]?.length === 1 && matchData[interaction.customId][0] !== interaction.user.id) {
      const thread = await interaction.channel.threads.create({
        name: `partida_${interaction.user.username}`,
        type: ChannelType.PrivateThread
      });
      
      const embed = new EmbedBuilder()
        .setTitle(`🧧 Match!`)
        .setDescription(`>  Você entrou na fila com sucesso! \nConfirme com seu oponente se esta tudo pronto.`)
        .setColor("Yellow")
        
      const button = new ButtonBuilder()
        .setLabel("Confirmar")
        .setCustomId("endmatch")
        .setStyle(ButtonStyle.Danger)
      
      const row = new ActionRowBuilder().addComponents(button);
      
      thread.send({
        content: `${interaction.user}, <@${matchData[interaction.customId][0]}>`, embeds: [embed], components: [row]
      })
      client.database.set(`match_${interaction.message.id}`, {})
      interaction.editReply({ content: "Match!"})
      updateEmbed()
    } else {
      client.database.push(`match_${interaction.message.id}.${interaction.customId}`, interaction.user.id);
      updateEmbed()
      return interaction.editReply({ content: `> Você entrou na fila`, flags: ["Ephemeral"] })
    }
  }
}
