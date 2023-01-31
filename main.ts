import {
  TelegramBot,
  UpdateType,
} from "https://deno.land/x/telegram_bot_api/mod.ts";

import { Notas } from "./src/notas.ts";

const TOKEN = Deno.env.get("DENOTASBOT_TOKEN");
if (!TOKEN) throw new Error("Bot token is not provided");
const bot = new TelegramBot(TOKEN);
const notas = new Notas("data/notas-iv-22-23-ordinaria.csv");
await notas.setup();
bot.on(UpdateType.Message, async ({ message }) => {
  console.log(message);
  const nick = message.from?.username?.toLowerCase();
  console.log(nick);
  await bot.sendMessage({
    chat_id: message.chat.id,
    text: notas.notas.get(nick)?.notaFinal,
  });
});

bot.run({
  polling: true,
});
