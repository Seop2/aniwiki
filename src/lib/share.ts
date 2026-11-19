import type { MediaType, Top10 } from "@/types";

const PREFIX = { tv: "t", movie: "m" } as const;
const TYPE_OF = { t: "tv", m: "movie" } as const;

export const SITE_URL = "https://www.aniwiki.link";
const shareOrigin = (local: boolean) =>
  local && process.env.NODE_ENV === "development" ? location.origin : SITE_URL;

export const TOP10_MAX = 10;

export const top10Title = (name: string | undefined) =>
  `${name?.trim() || "나"}의 인생 애니 TOP 10`;

export function shareQuery({
  name,
  items,
}: {
  name?: string;
  items: { type: MediaType; id: number }[];
}) {
  const params = new URLSearchParams({
    top10: items.map((a) => PREFIX[a.type] + a.id).join("."),
  });
  if (name?.trim()) params.set("name", name.trim());
  return params.toString();
}

export const buildShareUrl = (top10: Top10, { local = false } = {}) =>
  `${shareOrigin(local)}/top10?${shareQuery(top10)}`;

export function parseShareUrl(search: string) {
  const params = new URLSearchParams(search);
  const raw = params.get("top10");
  if (!raw) return null;

  const seen = new Set();
  const items: { type: MediaType; id: number }[] = [];
  for (const token of raw.split(".")) {
    const m = /^([tm])(\d{1,9})$/.exec(token);
    if (!m || seen.has(token)) continue;
    seen.add(token);
    items.push({ type: TYPE_OF[m[1] as "t" | "m"], id: Number(m[2]) });
    if (items.length === TOP10_MAX) break;
  }

  return items.length
    ? { name: (params.get("name") ?? "").slice(0, 20), items }
    : null;
}

export async function shareImage(
  blob: Blob,
  { title, url }: { title: string; url: string },
) {
  const file = new File([blob], "aniwiki-top10.png", { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title, text: `${title}\n${url}` });
      return "share";
    } catch (e) {
      if (!(e instanceof Error) || e.name !== "NotAllowedError") throw e;
    }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  return "download";
}

export const canShareLink = () =>
  typeof navigator !== "undefined" && !!navigator.share;

export const copyLink = (url: string) => navigator.clipboard.writeText(url);

export const xIntentUrl = (text: string, url: string) =>
  `https://twitter.com/intent/tweet?${new URLSearchParams({ text, url })}`;

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
const KAKAO_SDK = {
  src: "https://t1.kakaocdn.net/kakao_js_sdk/2.8.4/kakao.min.js",
  integrity:
    "sha384-BGX7Wb16GmRFagri4bLJV2DgipVZaU2AI812GZtHtHzzDQJnfHasDXN5houxv45w",
};

export const hasKakao = Boolean(KAKAO_KEY);

let kakaoLoading: Promise<Window["Kakao"]> | undefined;
export function loadKakao() {
  kakaoLoading ??= new Promise((resolve, reject) => {
    const script = Object.assign(document.createElement("script"), {
      ...KAKAO_SDK,
      crossOrigin: "anonymous",
      async: true,
    });
    script.onload = () => {
      if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_KEY!);
      resolve(window.Kakao);
    };
    script.onerror = () => {
      kakaoLoading = undefined;
      reject(new Error("KAKAO_SDK"));
    };
    document.head.append(script);
  });
  return kakaoLoading;
}

export function shareKakao({
  title,
  description,
  imageUrl,
  url,
  buttonTitle,
}: {
  title: string;
  description?: string;
  imageUrl: string;
  url: string;
  buttonTitle: string;
}) {
  const link = { webUrl: url, mobileWebUrl: url };
  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title,
      description,
      imageUrl,
      imageWidth: 1200,
      imageHeight: 630,
      link,
    },
    buttons: [{ title: buttonTitle, link }],
  });
}
