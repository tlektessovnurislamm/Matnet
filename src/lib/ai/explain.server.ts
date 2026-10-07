import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "./run-id.server";

const MODEL = "openai/gpt-6-astra";

const SYSTEM = {
  kz: "Сен — 9–12 жастағы балаларға арналған мейірімді математика мұғалімі Түлкішсің. Тек қазақ тілінде жаз. Баланың сұрағын немесе қате жауабын қысқа, қадамдық түрде түсіндір: 3–5 қысқа қадам, әр қадам жаңа жолда, нөмірмен. Қарапайым сөздер қолдан, дұрыс терминдерді (бөлшек, алым, бөлім, пайыз, теңдеу, периметр, аудан, бұрыш) пайдалан. Бала қателессе, ұрыспа — талпынысын мақта. Соңында бір жылы, қолдау сөзі жаз. Математикадан басқа тақырып болса, сыпайы түрде математикаға қайтар. Ешқашан сілтеме, жеке мәлімет сұрама. Барлығы 120 сөзден аспасын.",
  ru: "Ты — Лисёнок, добрый учитель математики для детей 9–12 лет. Пиши только по-русски. Объясни вопрос или ошибочный ответ ребёнка коротко и по шагам: 3–5 коротких шагов, каждый с новой строки и с номером. Используй простые слова и правильные термины (дробь, числитель, знаменатель, процент, уравнение, периметр, площадь, угол). Если ребёнок ошибся, не ругай — похвали за старание. В конце добавь одну тёплую поддерживающую фразу. Если вопрос не о математике, мягко верни разговор к математике. Никогда не давай ссылок и не спрашивай личные данные. Не больше 120 слов.",
};

export async function handleExplain(request: Request): Promise<Response> {
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

  let body: { lang?: string; question?: string; answer?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const lang = body.lang === "ru" ? "ru" : "kz";
  const question = String(body.question ?? "").trim().slice(0, 400);
  const answer = String(body.answer ?? "").trim().slice(0, 200);
  if (question.length < 2) return json({ error: "empty" }, 400);

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return json({ error: "config" }, 500);

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const userText =
    (lang === "kz" ? "Сұрақ: " : "Вопрос: ") + question +
    (answer ? (lang === "kz" ? "\nМенің жауабым: " : "\nМой ответ: ") + answer : "");

  try {
    const result = streamText({
      model: provider.responses(MODEL),
      system: SYSTEM[lang],
      messages: [{ role: "user", content: userText }],
      abortSignal: request.signal,
      maxRetries: 0,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const text = (await result.text).trim();
    if (!text) return json({ error: "empty_reply" }, 502);
    return json({ text });
  } catch (e: unknown) {
    const status = (e as { statusCode?: number })?.statusCode;
    if (status === 429) return json({ error: "rate_limited" }, 429);
    if (status === 402) return json({ error: "credits" }, 402);
    if (status === 403) return json({ error: "denied" }, 403);
    if (request.signal.aborted) return json({ error: "aborted" }, 499);
    console.error("explain failed", e);
    return json({ error: "failed" }, 502);
  }
}
