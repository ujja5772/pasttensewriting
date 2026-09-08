# 나의 특별한 하루 - 넷리파이 배포 가이드 (완전 무료 버전)

이 폴더는 "나의 특별한 하루" 영어 쓰기 활동 웹페이지를, 넷리파이(Netlify)에 올려서
클로드(claude.ai) 밖에서도 작동하도록 만든 버전입니다.

**이 버전은 세 개의 외부 서비스를 쓰는데, 전부 결제 등록 없이 무료로 쓸 수 있어요.**

1. **AI 기능(대화·첨삭·단어도우미)** → Google Gemini API (무료 등급, 카드 등록 불필요)
2. **사진 검색** → Unsplash API (무료, 카드 등록 불필요)
3. **제출함 저장(글 + 사진)** → Supabase (무료 플랜)

순서대로 따라 하시면 됩니다. 대략 25~35분 정도 걸려요.

이번 버전에서 달라진 점:
- 학생이 반/번호/이름을 입력해야 "시작하기"를 눌러 쓰기 활동으로 넘어갈 수 있어요.
- 마지막에 학생이 **직접 사진을 올리거나, 복사한 이미지를 붙여넣거나, "🔍 사진 검색하기"로 무료 스톡사진(Unsplash)**에서 어울리는 사진을 찾아 넣을 수 있어요.
- 제출함에는 **수정 전 원문 + 완성본(첨삭 후)** 이 둘 다 저장돼서, 학생의 발전 과정을 볼 수 있어요.
- `gallery.html` 페이지에서 학생들이 서로의 사진+완성작을 패들렛처럼 구경할 수 있어요. (PIN 없이 누구나 열람, 20초마다 자동 새로고침)
- **AI 글쓰기 기능이 Anthropic(유료)에서 Google Gemini(무료)로 바뀌었어요.**

### ⚠️ 무료 등급이라 알아두셔야 할 점

- **Gemini 무료 등급**: 하루 사용량 한도가 있어요 (넉넉한 편이라 학급 활동엔 충분해요). 그리고 무료 등급으로 보낸 내용은
  **구글이 서비스 개선을 위해 활용할 수 있다**는 약관이 있어요. 학생 글(이름·반·번호 포함)이 여기 해당되니,
  민감한 개인정보를 쓰는 활동에는 이 무료 방식을 권하지 않아요. 이 활동처럼 이름 정도만 오가는 수준이면
  일반적인 무료 교육 도구들과 비슷한 수준이라고 보시면 됩니다.
- **Unsplash 무료 등급**: 시간당 검색 50회 제한이 있어요.
- 두 서비스 모두 나중에 필요하면 유료/심사 등급으로 올릴 수 있지만, 지금 단계에서는 몰라도 됩니다.

---

## 0. 미리 필요한 것

- Google 계정 (Gemini API 키 발급용, 이미 있는 계정으로 바로 가능)
- Unsplash 계정 (unsplash.com, 무료)
- Supabase 계정 (supabase.com, 무료 플랜으로 충분)
- Netlify 계정 (netlify.com, 무료 플랜으로 충분)
- 컴퓨터에 Node.js 설치 (netlify-cli 실행용)

---

## 1. Google Gemini API 키 여러 개 받기 (무료, 카드 등록 불필요)

**4학급이 하루에 몰려서 활동해도 여유 있도록, 키를 3~4개 만들어둘 거예요.**
무료 등급은 "계정" 기준이 아니라 "프로젝트" 기준으로 한도가 따로 매겨지기 때문에,
**같은 구글 계정으로도 프로젝트를 여러 개 만들면 그만큼 무료 한도가 늘어나요.** 새 계정을 여러 개 만드실 필요는 없어요.

1. https://aistudio.google.com/apikey 접속 후 구글 계정으로 로그인.
2. **Create API key** 클릭 → **Create API key in new project** 선택 (매번 "새 프로젝트"를 골라야 키가 서로 독립적인 무료 한도를 가져요).
3. 발급된 키를 복사해서 메모장 같은 곳에 붙여둡니다.
4. **2~3번을 반복해서 키를 3~4개 만드세요.** (학급 수만큼 만드시면 제일 넉넉해요 — 4학급이면 4개)
5. 결제 정보 입력창이 뜨지 않는지 확인하세요 — 무료 등급은 결제 정보가 필요 없어요.

다 만들면 키가 여러 개 있는 상태가 됩니다. 이 키들을 6번 단계에서 **쉼표로 이어 붙여서** 한 번에 등록할 거예요.

---

## 2. Unsplash 준비 (무료 사진 검색)

1. https://unsplash.com/developers 에서 로그인 후 **New Application** 클릭.
2. 약관에 동의하고 앱 이름/설명을 간단히 입력 (학급용 교육 활동이라고 적으면 돼요).
3. 만들어진 앱 페이지에서 **Access Key**를 복사해두세요.

   ⚠️ 이 키는 **"Demo" 등급**으로 시작하는데, **시간당 50번**까지 검색 요청이 가능해요. 학급 한 반 정도 사용량엔 충분해요.

---

## 3. Supabase 준비 (제출함 저장소 + 사진 저장소)

1. https://supabase.com 에서 로그인 후 **New project** 생성.
2. 왼쪽 메뉴 **SQL Editor** 로 들어가서 아래 SQL을 붙여넣고 실행(Run)하세요. (제출함 테이블 생성)

```sql
create table submissions (
  id bigint primary key generated always as identity,
  class_number int default 0,
  student_number int default 0,
  name text,
  when_field text,
  mode text,
  draft text,
  corrected text,
  handwritten text,
  photo_url text,
  created_at timestamptz default now()
);

grant select, insert on public.submissions to anon;

alter table submissions enable row level security;

create policy "Allow public insert"
  on public.submissions for insert
  to anon
  with check (true);

create policy "Allow public select"
  on public.submissions for select
  to anon
  using (true);
```

3. 왼쪽 메뉴 **Storage** 로 들어가서 **New bucket** 클릭.
   - 이름: `photos`
   - **Public bucket** 옵션을 켜주세요.
   - 참고: Unsplash 검색으로 고른 사진은 이 저장소에 올리지 않고 Unsplash 원본 주소를 그대로 사용해요.
4. 버킷을 만든 뒤, 업로드가 되도록 정책을 추가해야 해요. 다시 **SQL Editor** 로 가서 아래를 실행하세요.

```sql
create policy "Allow public upload to photos"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'photos');

create policy "Allow public read photos"
  on storage.objects for select
  to anon
  using (bucket_id = 'photos');
```

5. 왼쪽 메뉴 **Project Settings(톱니바퀴) → API** 로 들어가서 아래 두 값을 복사해두세요.
   - **Project URL** (예: `https://xxxxxxxx.supabase.co`)
   - **anon public** 키 (긴 문자열)

   ⚠️ **주의**: `anon` 키는 학생 화면(프론트엔드) 코드 안에 그대로 들어가기 때문에, 이 키를 아는 사람은
   누구나 제출함에 글을 넣거나 전체 내용을 읽을 수 있습니다. 학급 활동용으로는 보통 괜찮은 수준이에요.

---

## 4. 코드에 Supabase 정보 입력하기

`config.js` 파일을 열어서 아래 두 줄을 3번에서 복사한 값으로 바꿔서 저장하세요.
(이 파일 하나가 `index.html`과 `gallery.html` 양쪽에서 함께 쓰여요.)

```js
const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';
```

---

## 5. 넷리파이 배포하기 (Netlify CLI 사용)

터미널(명령 프롬프트)을 열고, 이 폴더 안에서 아래 순서로 실행하세요.

```bash
# 1) netlify-cli 설치 (한 번만)
npm install -g netlify-cli

# 2) 넷리파이 로그인 (브라우저가 열려요)
netlify login

# 3) 이 폴더에서 새 사이트로 배포
netlify deploy --prod
```

완료되면 `https://당신의사이트이름.netlify.app` 주소가 나와요.
갤러리 페이지는 `https://당신의사이트이름.netlify.app/gallery.html` 로 접속하면 돼요.

> GitHub로 관리하고 싶다면, 이 폴더를 저장소에 올린 뒤 Netlify 대시보드에서 "Import from Git"으로
> 연결하는 방법도 있습니다. 이 경우에도 아래 6번 환경변수 등록은 동일하게 해주셔야 해요.

---

## 6. API 키들을 넷리파이 환경변수로 등록하기

**아주 중요한 단계예요.** 이걸 빼먹으면 AI 기능이 전부 오류가 납니다.

1. https://app.netlify.com 에서 방금 만든 사이트로 들어가세요.
2. **Site configuration → Environment variables** 로 이동.
3. **Add a variable** 클릭 → Key: `GEMINI_API_KEYS`, Value: 1번에서 만든 Gemini 키들을 **쉼표(,)로 이어붙여서** 붙여넣기.
   예: `AIzaSy아무개1,AIzaSy아무개2,AIzaSy아무개3,AIzaSy아무개4` (키 사이에 띄어쓰기 없이 쉼표만)
4. **Add a variable** 한 번 더 클릭 → Key: `UNSPLASH_ACCESS_KEY`, Value: 2번에서 발급받은 Unsplash Access Key 붙여넣기.
5. 두 변수 모두 **Scopes**에서 반드시 **Functions**를 체크하세요. (Builds만 체크하면 함수에서 못 읽어요!)
6. 저장 후, 사이트를 다시 배포해주세요 (터미널에서 `netlify deploy --prod` 다시 실행, 또는 대시보드에서 "Trigger deploy").

이렇게 등록하면, 학생이 채팅이나 첨삭을 요청할 때마다 서버가 등록된 키 중 하나를 무작위로 골라 쓰고,
그 키가 하루 한도에 걸리면 자동으로 다른 키로 다시 시도해줘요. 학생/선생님은 이 과정을 전혀 신경 쓰지 않아도 됩니다.

---

## 7. 확인하기

배포된 주소로 들어가서:
- 반/번호/이름을 입력하고 "시작하기"를 눌러야 활동이 시작되는지
- "이야기 준비하기" 채팅이 잘 되는지 (Gemini 기능 확인 — 여러 반이 몰려도 등록해둔 키들 사이에서 자동으로 분산돼요)
- 이야기를 쓰고 검사받은 뒤 "🔍 사진 검색하기"를 눌러 사진 후보가 뜨는지 (Unsplash 기능 확인)
- 사진을 올리거나 붙여넣기 해도 잘 되는지
- "제출하기"를 누르면 저장이 잘 되는지
- "선생님 전용 - 제출함 보기"에서 수정 전/완성본이 둘 다 보이는지
- `gallery.html` 페이지에서 방금 제출한 사진과 글이 카드로 보이는지

모두 잘 되면 성공입니다! 🎉

---

## 문제가 생기면

- **AI 채팅/첨삭이 안 될 때**: 넷리파이 대시보드의 **Functions** 탭에서 `chat` 함수의 로그를 확인하세요.
  `GEMINI_API_KEYS` 오류 메시지가 보이면 6번 단계를 다시 확인해주세요. (키 사이 쉼표, 띄어쓰기 여부도 확인!)
- **"지금 사용량이 많아서..." 오류가 자주 뜰 때**: 등록해둔 키를 전부 시도했는데도 다 한도에 걸렸다는 뜻이에요.
  1번으로 돌아가서 키를 1~2개 더 만들어 `GEMINI_API_KEYS`에 쉼표로 추가해주세요.
- **"안전 필터에 걸렸을 수도 있어요" 오류가 자주 뜰 때**: Gemini는 무료 등급에서 콘텐츠 안전 필터가 있어서,
  가끔 평범한 문장도 걸러낼 때가 있어요. 다시 시도해보시거나, 문장을 조금 바꿔서 시도해보세요.
- **사진 검색이 안 될 때**: `search-photo` 함수 로그를 확인하세요. `UNSPLASH_ACCESS_KEY` 오류가 보이면 6번을 다시 확인하고,
  "시간당 요청 제한" 오류면 잠시 후 다시 시도하시면 됩니다.
- **사진 업로드/붙여넣기가 안 될 때**: Supabase **Storage → photos** 버킷에 실제로 파일이 쌓이는지 확인하고,
  안 쌓인다면 3번의 storage policy SQL이 제대로 실행됐는지 확인하세요.
- **제출함/갤러리가 비어 보일 때**: Supabase 대시보드의 **Table Editor**에서 `submissions` 테이블에 데이터가
  쌓이고 있는지 먼저 확인하고, 안 쌓인다면 3번의 테이블 SQL(특히 policy 부분)이 제대로 실행됐는지 확인하세요.
- **선생님 확인 번호(PIN)**: `index.html` 상단의 `TEACHER_PIN` 값을 원하는 숫자로 바꿔서 사용하세요.
