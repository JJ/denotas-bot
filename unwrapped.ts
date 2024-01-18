import {
  TelegramBot,
  UpdateType,
} from "https://deno.land/x/telegram_bot_api/mod.ts";

const TOKEN = Deno.env.get("IV_UNWRAPPED_BOT_TOKEN");
if (!TOKEN) throw new Error("Bot token is not provided");
const bot = new TelegramBot(TOKEN);

const nicks = await Deno.readTextFile("../equivalencia-telegram-github-23-24.csv");
const lines = nicks.split("\n");
lines.shift();
const nickMap = new Map<string, string>();
for (const line of lines) {
  const [_1, _2, github, telegram] = line.split(",");
  if (telegram && github) nickMap.set(telegram.toLowerCase(), github);
}

const notas = await Deno.readTextFile("../notas-23-24.tsv");
const notasLines = notas.split("\n");
notasLines.shift();
const notasMap = new Map<string, number[]>();
for (const line of notasLines) {
  const [telegram, notaPresentacion,notaExtra,notaProyecto, notaReviews, notaFinal] = line.split("\t");
  console.warn(telegram);
  notasMap.set(telegram.toLowerCase(),
  [parseNotas(notaPresentacion),
    parseNotas(notaExtra),
    parseNotas(notaProyecto),
    parseNotas(notaReviews),
    parseNotas(notaFinal)]);
}
console.log(notasMap);

bot.on(UpdateType.Message, async ({ message }) => {
  console.log(message);
  let mensaje: string;
  let nick: string | undefined = message.from?.username?.toLowerCase();
  if ( nick === undefined ) {
    mensaje =      `⚠️ Parece que no tienes nick de Telegram\n`;
  } else {
    nick = nick.toLowerCase();
    const githubNick = nickMap.get(nick);
    if ( githubNick === undefined ) {
      mensaje =
        `⚠️ Parece que tu nick _${escapeLodash(nick)}_no corresponde a ninguno en GitHub\n`;
    } else {
        const [notaPresentacion,notaExtra,notaProyecto, notaReviews, notaFinal] = notasMap.get( nick ) || [0,0,0,0,0];
        mensaje =
          `🗞 La *_nota provisional_* es *_|| ${escapeDot(notaFinal)} ||_* \n`+
          (notaPresentacion != 0 ?`📊 La nota de la presentación es ${escapeDot(notaPresentacion)}\n`:'') +
          (notaExtra != 0 ?`📊 La nota extra por el hackatón es ${escapeDot(notaExtra)}\n`:"") +
          `📊 La nota del proyecto es ${escapeDot(notaProyecto)}\n` +
          `📊 La nota por las reviews es ${escapeDot(notaReviews)}\n`;
    }
  }

  console.warn(mensaje);
  await bot.sendMessage({
    chat_id: message.chat.id,
    parse_mode: "MarkdownV2",
    text: mensaje,
  });
});

bot.run({
  polling: true,
});

function escapeLodash(nick: string ) {
  return nick.replace("_", "\\_");
}

function escapeDot(nota: string | number) {
  return (nota + "").replace(".", "'");
}

function parseNotas( nota: string ) {
  console.warn( "Nota entrada: " + nota );
  if ( nota === "" || typeof  nota === "undefined") return 0;
  const temp= parseFloat( nota.replace("\"", "").replace(",", "."));
  console.log( "Nota salida", temp );
  return( temp)
}