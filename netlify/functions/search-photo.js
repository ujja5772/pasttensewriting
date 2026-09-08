// 무료 스톡사진 서비스 Unsplash에서 학생 글에 어울리는 사진을 검색합니다.
// (완전 무료, 결제 등록 필요 없음 — 대신 시간당 요청 수 제한이 있어요)
// API 키는 넷리파이 환경변수(UNSPLASH_ACCESS_KEY)에서 읽어옵니다.
//
// action: "search"  -> query로 사진 검색
// action: "track"   -> 선택된 사진의 다운로드를 Unsplash에 기록 (API 이용 규칙 준수용)

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

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "서버에 UNSPLASH_ACCESS_KEY 환경변수가 설정되지 않았어요. 넷리파이 사이트 설정에서 추가해주세요.",
      }),
    };
  }

  if (body.action === "track") {
    if (!body.downloadLocation) {
      return { statusCode: 400, body: JSON.stringify({ error: "downloadLocation 값이 필요해요." }) };
    }
    try {
      await fetch(body.downloadLocation, {
        headers: { Authorization: "Client-ID " + accessKey },
      });
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    } catch (err) {
      return { statusCode: 200, body: JSON.stringify({ ok: false }) }; // 실패해도 학생 화면엔 영향 없게
    }
  }

  const query = (body.query || "").trim();
  if (!query) {
    return { statusCode: 400, body: JSON.stringify({ error: "query 값이 필요해요." }) };
  }

  try {
    const url = "https://api.unsplash.com/search/photos?query=" + encodeURIComponent(query) +
      "&per_page=6&content_filter=high&orientation=squarish";
    const response = await fetch(url, {
      headers: { Authorization: "Client-ID " + accessKey },
    });
    const data = await response.json();
    if (!response.ok) {
      const msg = (data.errors && data.errors.join(", ")) || "Unsplash 검색 중 오류가 발생했어요.";
      return { statusCode: response.status, body: JSON.stringify({ error: msg }) };
    }
    const results = (data.results || []).map((p) => ({
      id: p.id,
      thumb: p.urls.small,
      regular: p.urls.regular,
      alt: p.alt_description || query,
      photographerName: p.user && p.user.name,
      photographerUrl: p.user && p.user.links && p.user.links.html,
      downloadLocation: p.links && p.links.download_location,
    }));
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results: results }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "사진 검색 중 오류가 발생했어요: " + String(err) }),
    };
  }
};
