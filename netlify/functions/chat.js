// 이 함수는 완전 무료로 쓸 수 있는 Google Gemini API를 대신 호출합니다.
// (Google AI Studio에서 발급받은 무료 API 키를 써요 - 결제 등록이 필요 없어요)
//
// 여러 학급이 함께 쓸 때 무료 등급 하루 한도(RPD)에 걸리지 않도록,
// API 키를 여러 개 등록해두면 요청마다 무작위로 하나를 골라 쓰고,
// 그 키가 사용량 한도에 걸리면(429) 자동으로 다음 키로 다시 시도해요.
//
// 학생 화면(index.html)의 코드는 이 함수가 어떤 AI를 쓰는지, 키가 몇 개인지 몰라도 되도록,
// 요청/응답 모양을 그대로 유지해줍니다: {content:[{text:"..."}]}

function getApiKeys() {
  // GEMINI_API_KEYS 에 쉼표로 여러 개를 넣으면 그걸 쓰고,
  // 하나만 쓰고 싶으면 예전처럼 GEMINI_API_KEY 하나만 넣어도 동작해요.
  const raw = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "잘못된 요청 형식이에요." }) };
  }

  const { system, messages, max_tokens } = body;
  if (!messages) {
    return { statusCode: 400, body: JSON.stringify({ error: "messages 값이 필요해요." }) };
  }

  const keys = getApiKeys();
  if (keys.length === 0) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "서버에 GEMINI_API_KEYS(또는 GEMINI_API_KEY) 환경변수가 설정되지 않았어요. 넷리파이 사이트 설정에서 추가해주세요.",
      }),
    };
  }

  // 학생 화면에서 보내는 messages 형식([{role:'user'|'assistant', content:'...'}])을
  // Gemini가 이해하는 형식([{role:'user'|'model', parts:[{text:'...'}]}])으로 바꿔줘요.
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const model = "gemini-2.5-flash-lite";
  const requestBody = {
    contents: contents,
    generationConfig: { maxOutputTokens: max_tokens || 1000 },
  };
  if (system) {
    requestBody.system_instruction = { parts: [{ text: system }] };
  }

  const orderedKeys = shuffle(keys); // 키마다 골고루 부담이 가도록 매 요청 순서를 섞어요
  let lastErrorMsg = "알 수 없는 오류";

  for (const apiKey of orderedKeys) {
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/" +
      model +
      ":generateContent?key=" +
      apiKey;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();

      if (response.ok) {
        const parts =
          (data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content &&
            data.candidates[0].content.parts) ||
          [];
        const text = parts.map((p) => p.text || "").join("\n");

        if (!text) {
          return {
            statusCode: 500,
            body: JSON.stringify({ error: "AI가 답을 만들지 못했어요. (안전 필터에 걸렸을 수도 있어요) 다시 시도해주세요." }),
          };
        }

        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: [{ text: text }] }),
        };
      }

      lastErrorMsg = (data.error && data.error.message) || "Gemini 호출 중 오류가 발생했어요.";

      // 이 키가 사용량 한도(429)에 걸린 경우에만 다음 키로 넘어가서 다시 시도해요.
      // 그 외 오류(잘못된 요청 등)는 키를 바꿔도 똑같이 실패하니 바로 반환해요.
      if (response.status !== 429) {
        return { statusCode: response.status, body: JSON.stringify({ error: lastErrorMsg }) };
      }
    } catch (err) {
      lastErrorMsg = String(err);
      // 네트워크 오류 등도 다음 키로 한 번 더 시도해봐요.
    }
  }

  // 등록된 키를 모두 시도했는데도 안 될 때
  return {
    statusCode: 429,
    body: JSON.stringify({
      error: "지금 사용량이 많아서 잠시 응답이 어려워요. 잠시 후 다시 시도해주세요. (" + lastErrorMsg + ")",
    }),
  };
};
