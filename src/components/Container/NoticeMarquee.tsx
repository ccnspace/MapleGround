"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { NOTICES, type NoticeItem, type NoticeType } from "@/constants/notices";

const TYPE_BADGE: Record<NoticeType, { label: string; className: string }> = {
  update: {
    label: "UPDATE",
    className: "bg-sky-500/90 text-white",
  },
  info: {
    label: "INFO",
    className: "bg-slate-500/90 text-white",
  },
  warning: {
    label: "NOTICE",
    className: "bg-amber-500/90 text-white",
  },
};

// `[라벨](URL)` 인라인 링크 파싱
type TextSegment = { kind: "text"; value: string } | { kind: "link"; label: string; href: string };
const INLINE_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

const parseInlineLinks = (text: string): TextSegment[] => {
  const parts: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(INLINE_LINK_RE.source, "g");
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ kind: "text", value: text.slice(lastIndex, match.index) });
    parts.push({ kind: "link", label: match[1], href: match[2] });
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) parts.push({ kind: "text", value: text.slice(lastIndex) });
  return parts;
};

const isExternalLink = (href: string) => /^https?:\/\//i.test(href);
const stripInlineLinks = (text: string) => text.replace(INLINE_LINK_RE, "$1");

/** `/main/*` 경로 이동 시 현재 ?name= 쿼리를 유지 (캐릭터 닉네임 보존). */
const withNicknameIfMain = (href: string, nickname: string | null): string => {
  if (!nickname) return href;
  if (!href.startsWith("/main")) return href;
  const [path, existingQuery = ""] = href.split("?");
  const params = new URLSearchParams(existingQuery);
  if (!params.has("name")) params.set("name", nickname);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
};

const InlineLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const nickname = searchParams.get("name");
  const cls =
    "text-sky-600 dark:text-sky-400 font-semibold underline underline-offset-2 hover:text-sky-700 dark:hover:text-sky-300";
  if (isExternalLink(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={cls}>
        {children}
      </a>
    );
  }
  const resolved = withNicknameIfMain(href, nickname);
  return (
    <Link href={resolved} className={cls}>
      {children}
    </Link>
  );
};

const NoticeItemView = ({ item }: { item: NoticeItem }) => {
  const searchParams = useSearchParams();
  const nickname = searchParams.get("name");
  const badge = item.type ? TYPE_BADGE[item.type] : null;
  const plain = stripInlineLinks(item.text);
  const fullText = `${item.date ? `[${item.date}] ` : ""}${plain}`;
  const segments = parseInlineLinks(item.text);
  const hasInlineLink = segments.some((s) => s.kind === "link");

  const body = (
    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={fullText}>
      {segments.map((seg, i) =>
        seg.kind === "text" ? (
          <span key={i}>{seg.value}</span>
        ) : (
          <InlineLink key={i} href={seg.href}>
            {seg.label}
          </InlineLink>
        ),
      )}
    </span>
  );

  const inner = (
    <span className="inline-flex items-center gap-2 min-w-0">
      {badge && (
        <span className={`inline-block shrink-0 px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-wider ${badge.className}`}>
          {badge.label}
        </span>
      )}
      {/* 날짜는 모바일에서 숨김 */}
      {item.date && (
        <span className="shrink-0 text-[11px] font-semibold text-gray-500 dark:text-gray-400 max-[600px]:hidden">{item.date}</span>
      )}
      {body}
    </span>
  );
  // 인라인 링크가 있으면 전체 래핑 링크는 생략 (앵커 중첩 방지)
  if (item.link && !hasInlineLink) {
    const href = isExternalLink(item.link) ? item.link : withNicknameIfMain(item.link, nickname);
    if (isExternalLink(item.link)) {
      return (
        <a href={href} target="_blank" rel="noreferrer noopener" className="hover:underline min-w-0">
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className="hover:underline min-w-0">
        {inner}
      </Link>
    );
  }
  return inner;
};

export const NoticeMarquee = () => {
  if (NOTICES.length === 0) return null;
  const notice = NOTICES[0];

  return (
    <div
      className="relative w-full h-9 rounded-xl overflow-hidden
        bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100
        dark:from-color-950/80 dark:via-color-950/60 dark:to-color-950/80
        border border-slate-200/80 dark:border-white/5
        flex items-center"
      role="region"
      aria-label="사이트 공지"
    >
      <div
        className="shrink-0 flex items-center gap-1 px-3 max-[600px]:px-2 h-full
        bg-slate-900 dark:bg-white text-white dark:text-slate-900"
      >
        <span aria-hidden>📢</span>
        {/* "공지" 텍스트는 모바일에서 숨김 — 아이콘만으로 충분 */}
        <span className="text-sm font-extrabold tracking-wider max-[600px]:hidden">공지</span>
      </div>

      <div className="flex-1 min-w-0 px-4 max-[600px]:px-2 h-full flex items-center overflow-hidden">
        <NoticeItemView item={notice} />
      </div>
    </div>
  );
};
