import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const pingCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('בדוק את מהירות החיבור לבוט (פינג).'),
  async execute(interaction: ChatInputCommandInteraction) {
    const sent = await interaction.reply({ content: '🏓 בודק...', fetchReply: true, ephemeral: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply({
      content: `🏓 **פונג!**\n• זמן תגובת הבוט: ${latency}ms\n• זמן תגובת ה-API: ${interaction.client.ws.ping}ms`,
    });
  },
};
