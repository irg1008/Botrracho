import type {
  AutocompleteInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';

export type Execute<T> = (interaction: T) => void;

export type CommandExecute = Execute<ChatInputCommandInteraction>;
export type AutocompleteExecute = Execute<AutocompleteInteraction>;
export type ButtonExecute = Execute<ButtonInteraction>;

export type Command = {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute: CommandExecute;
  autocomplete?: AutocompleteExecute;
  button?: ButtonExecute;
};
