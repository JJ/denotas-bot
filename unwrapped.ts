import {
  TelegramBot,
  UpdateType,
} from "https://deno.land/x/telegram_bot_api/mod.ts";

const TOKEN = Deno.env.get("IV_UNWRAPPED_BOT_TOKEN");
if (!TOKEN) throw new Error("Bot token is not provided");
const bot = new TelegramBot(TOKEN);

const percentiles = JSON.parse( await Deno.readTextFile(Deno.args[0] || "../iv-percentiles.json"));

const nicks =
  await Deno.readTextFile(Deno.args[1] || "../equivalencia-telegram-github-23-24.csv")
;

const lines = nicks.split("\n");
lines.shift();
const nickMap = new Map<string, string>();
for (const line of lines) {
  const [_1, _2, github, telegram] = line.split(",");
  if (telegram && github) nickMap.set(telegram, github);
}

bot.on(UpdateType.Message, async ({ message }) => {
  console.log(message);
  let mensaje: string;
  const nick: string | undefined = message.from?.username?.toLowerCase();
  if ( nick === undefined ) {
    mensaje =
      `⚠️ Parece que no he encontrado tu nick _${nick}_ en la lista\n` +
      "¿Es posible que te dieras de alta con otro?";
  } else {
    const githubNick = nickMap.get(nick);
    if ( githubNick === undefined ) {
      mensaje =
        `⚠️ Parece que no he encontrado tu nick _${nick}_ en la lista\n` +
        "¿Es posible que te dieras de alta con otro?";
    } else {
      const estePercentil = percentiles[ githubNick ];

      if (estePercentil === undefined) {
        mensaje =
        `⚠️ Parece que no he encontrado tu nick _${nick}_ en la lista\n` +
        "¿Es posible que te dieras de alta con otro?";
      } else {
        mensaje =
          `🎓 El percentil de *${escapeLodash(nick)}*\n` +
          ` es el *_${escapeDot(estePercentil * 100)}_* % ; es decir, sólo ese porcentaje ha alcanzado el mismo objetivo\n`;
      }
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

function escapeLodash(nick) {
  return nick.replace("_", "\\_");
}

function escapeDot(nota) {
  return (nota + "").replace(".", "'");
}