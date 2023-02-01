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
  let mensaje: string;
  if (estasNotas === undefined) {
    mensaje =
      `⚠️ Parece que no he encontrado tu nick _${nick}_ en la lista\n` +
      "¿Es posible que te dieras de alta con otro?";
  } else {
    mensaje =
      `🧑‍🏫 Nota de *${escapeLodash(nick)}*\n` +
      `❧Proyecto: _${escapeDot(estasNotas?.notaProyecto)}_\n` +
      `❧Extra: _${escapeDot(estasNotas?.notaExtra)}_\n` +
      `❧Presentación: _${escapeDot(estasNotas?.notaPresentacion)}` +
      `_\n❧Final: *_||${escapeDot(estasNotas?.notaFinal)}||_*`;
  }
  await bot.sendMessage({
    chat_id: message.chat.id,
    parse_mode: "MarkdownV2",
    text: mensaje,
  });
});

bot.run({
  polling: true,
});

function escapeDot(nota) {
  return (nota + "").replace(".", "'");
}

function escapeLodash(nick) {
  return nick.replace("_", "\_");
}
