const { EmbedBuilder, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  run: async (interaction) => {
    if (!interaction.isButton()) return;

    // --- LÓGICA DE ABRIR TICKET ---
    if (interaction.customId === "open_ticket") {
      await interaction.deferReply({ flags: ["Ephemeral"] });

      // Verifica se já existe um canal para esse usuário
      const existingChannel = interaction.guild.channels.cache.find(c => c.name === `ticket-${interaction.user.username}`);
      if (existingChannel) {
        return interaction.editReply({ content: `Você já possui um ticket aberto em ${existingChannel}` });
      }

      // Criação do Canal de Ticket
      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] }, // Esconde de todos
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }, // Mostra ao usuário
        ],
      });

      const embed = new EmbedBuilder()
        .setTitle("🛠️ Suporte Solicitado")
        .setDescription(`Olá ${interaction.user}, relate seu problema e aguarde a equipe.\nPara fechar este ticket, use o botão abaixo.`)
        .setColor("Blue");

      const closeBtn = new ButtonBuilder()
        .setLabel("Fechar Ticket")
        .setCustomId("close_ticket")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(closeBtn);

      await channel.send({ content: `${interaction.user} | <@1502667024558588052>`, embeds: [embed], components: [row] });

      return interaction.editReply({ content: `Seu ticket foi criado: ${channel}` });
    }

    // --- LÓGICA DE FECHAR TICKET ---
    if (interaction.customId === "close_ticket") {
      await interaction.reply("🔒 Este ticket será fechado em 5 segundos...");
      
      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 5000);
    }
  }
};
