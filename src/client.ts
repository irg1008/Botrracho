import { env } from '@/config/env';
import {
  ButtonComponent,
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
  type InteractionReplyOptions,
} from 'discord.js';
import { id } from './lib/id';
import { commands } from './loader';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.on(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

// Commands interactions
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    command.execute(interaction);
  } catch (error) {
    console.error(error);
    const reply: InteractionReplyOptions = {
      content: 'There was an error while executing this command!',
      flags: MessageFlags.Ephemeral,
    };

    interaction.replied || interaction.deferred
      ? await interaction.followUp(reply)
      : await interaction.reply(reply);
  }
});

// Autocomplete interactions
client.on(Events.InteractionCreate, (interaction) => {
  if (!interaction.isAutocomplete()) return;
  const command = commands.get(interaction.commandName);

  try {
    command?.autocomplete?.(interaction);
  } catch (error) {
    console.error(error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (
    !interaction.isButton() ||
    !(interaction.component instanceof ButtonComponent)
  )
    return;

  const { customId } = interaction.component;
  if (!customId) return;

  const [commandName] = id.getId(customId);
  const command = commands.get(commandName);

  try {
    command?.button?.(interaction);
  } catch (error) {
    console.error(error);
  }
});

client.login(env.token);
