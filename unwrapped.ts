import {
  TelegramBot,
  UpdateType,
} from "https://deno.land/x/telegram_bot_api/mod.ts";

const TOKEN = Deno.env.get("IV_UNWRAPPED_BOT_TOKEN");
if (!TOKEN) throw new Error("Bot token is not provided");
const bot = new TelegramBot(TOKEN);

const reviews = JSON.parse( await Deno.readTextFile( "../reviews.json"));

const reviewedPRs = JSON.parse(await Deno.readTextFile("../reviewed-prs.json"));

const percentiles = JSON.parse( await Deno.readTextFile("../iv-percentiles.json"));

const nicks = await Deno.readTextFile(Deno.args[1] || "../equivalencia-telegram-github-23-24.csv");


const lines = nicks.split("\n");
lines.shift();
const nickMap = new Map<string, string>();
for (const line of lines) {
  const [_1, _2, github, telegram] = line.split(",");
  if (telegram && github) nickMap.set(telegram.toLowerCase(), github);
}
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
      const estosDatos = percentiles[ githubNick ];
      const reviewsEstudiante = reviews[ githubNick ];
      const reviewedPREstudiante = Object.keys(reviewedPRs[ githubNick ]).length;
      if (estosDatos === undefined) {
        mensaje =
        `⚠️ Parece que no he encontrado tu nick _${escapeLodash(nick)}_ en la lista\n` +
        "¿Es posible que te dieras de alta con otro?";
      } else {
        mensaje =
          `🎓 *${escapeLodash(nick)}* ha alcanzado el objetivo ${estosDatos["objetivos"]}\n` +
          `como el *_${escapeDot(estosDatos["percentil"] * 100)}_* % de la clase\n` +
          `y por tanto la nota por objetivos es ${escapeDot(estosDatos["nota"])} sobre 7\n` +
          `también has hecho *${reviewsEstudiante}* reviews sobre *${reviewedPREstudiante}* PRs\n`;
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

function escapeLodash(nick: string ) {
  return nick.replace("_", "\\_");
}

function escapeDot(nota: string | number) {
  return (nota + "").replace(".", "'");
}