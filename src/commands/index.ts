import { Collection, ChatInputCommandInteraction } from 'discord.js';
import { aboutCommand } from './about';
import { statusCommand } from './status';
import { faqCommand } from './faq';
import { pingCommand } from './ping';
import { websiteCommand } from './website';
import { helpCommand } from './help';
import { requestCommand } from './request';
import { myrequestsCommand } from './myrequests';
import { rulesCommand } from './rules';
import { contactCommand } from './contact';
import { adminlistCommand } from './adminlist';
import { adminapproveCommand } from './adminapprove';
import { adminrejectCommand } from './adminreject';

export interface Command {
  data: any;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  featureFlag?: string;
}

export const commands = new Collection<string, Command>();

const commandList: Command[] = [
  aboutCommand,
  statusCommand,
  faqCommand,
  pingCommand,
  websiteCommand,
  helpCommand,
  requestCommand,
  myrequestsCommand,
  rulesCommand,
  contactCommand,
  adminlistCommand,
  adminapproveCommand,
  adminrejectCommand,
];

for (const command of commandList) {
  commands.set(command.data.name, command);
}
