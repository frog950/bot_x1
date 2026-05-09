const { EmbedBuilder, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  run: async (interaction) => {
    if (!interaction.isButton()) return;

    const staffRoleID = "1502667024558588052"; 
    
    if (interaction.customId === "open_ticket") {
      await interaction.deferReply({ flags: ["Ephemeral"] });

      const existingChannel = interaction.guild.channels.cache.find(c => c.name === `ticket-${interaction.user.username}`);
      if (existingChannel) return interaction.editReply({ content: `Você já possui um ticket em ${existingChannel}` });

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
          { id: staffRoleID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ],
      });

      const embed = new EmbedBuilder()
        .setTitle("")
        .setDescription(`Olá ${interaction.user}, aguarde um membro da equipe assumir seu atendimento.`)
        .setColor("Blue");

      const btnAssumir = new ButtonBuilder()
        .setLabel("Assumir Ticket")
        .setCustomId("claim_ticket")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("");

      const btnFechar = new ButtonBuilder()
        .setLabel("Fechar")
        .setCustomId("close_ticket")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(btnAssumir, btnFechar);

      await channel.send({ content: `${interaction.user} | <@&${staffRoleID}>`, embeds: [embed], components: [row] });
      return interaction.editReply({ content: `Ticket criado: ${channel}` });
    }

    // --- ASSUMIR TICKET ---
    if (interaction.customId === "claim_ticket") {
      // Verifica se quem clicou tem o cargo de staff
      if (!interaction.member.roles.cache.has(staffRoleID)) {
        return interaction.reply({ content: "❌ Apenas a staff pode assumir tickets!", flags: ["Ephemeral"] });
      }

      const ticketOwnerID = interaction.channel.name.split('-')[1]; // Tenta pegar o nome do user pelo canal

      // Atualiza permissões: Remove o cargo Staff geral e adiciona o Staff que clicou
      await interaction.channel.permissionOverwrites.set([
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        // Mantém o acesso do dono do ticket (buscando pelo histórico de permissões atual)
        ...interaction.channel.permissionOverwrites.cache
          .filter(p => p.type === 1 && p.id !== interaction.user.id && p.id !== staffRoleID)
          .map(p => ({ id: p.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }))
      ]);

      const embedClaim = new EmbedBuilder()
        .setDescription(`✅ Este ticket agora está sendo atendido por ${interaction.user}.`)
        .setColor("Green");

      // Desabilita o botão de assumir para não clicarem de novo
      const disabledRow = new ActionRowBuilder().addComponents(
        ButtonBuilder.from(interaction.message.components[0].components[0]).setDisabled(true),
        ButtonBuilder.from(interaction.message.components[0].components[1])
      );

      await interaction.update({ components: [disabledRow] });
      return interaction.channel.send({ embeds: [embedClaim] });
    }

    // --- FECHAR TICKET ---
    if (interaction.customId === "close_ticket") {
      await interaction.reply("Fechando em 5 segundos...");
      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
  }
};
