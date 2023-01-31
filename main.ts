import {
  TelegramBot,
  UpdateType,
} from "https://deno.land/x/telegram_bot_api/mod.ts";

import { Notas } from "./src/notas.ts";

const TOKEN = Deno.env.get("DENOTASBOT_TOKEN");
if (!TOKEN) throw new Error("Bot token is not provided");
const bot = new TelegramBot(TOKEN);
const notas = new Notas(Deno.args[0] || "data/notas-iv-22-23-ordinaria.csv");
await notas.setup();
bot.on(UpdateType.Message, async ({ message }) => {
  console.log(message);
  const nick: string = message.from?.username?.toLowerCase();
  const estasNotas = notas.notas.get(nick);
  await bot.sendMessage({
    chat_id: message.chat.id,
    text: `🧑‍🏫 Nota de ${nick}\n❧Proyecto: ${estasNotas?.notaProyecto}\n❧Extra: ${estasNotas?.notaExtra}\n❧Presentación: ${estasNotas?.notaPresentacion}\n❧Final: ${estasNotas?.notaFinal}`,
  });
});

bot.run({
  polling: true,
});
