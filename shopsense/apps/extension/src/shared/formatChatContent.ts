/** Simple formatting: newlines → <br>, **text** → bold, [text](url) → link. */
function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function formatChatContent(content: string): string {
  if (!content || typeof content !== "string") return "";
  const parts: string[] = [];
  const linkRe = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(content)) !== null) {
    parts.push(escape(content.slice(last, m.index)).replace(/\n/g, "<br>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>"));
    parts.push(`<a href="${escape(m[2])}" target="_blank" rel="noreferrer noopener">${escape(m[1])}</a>`);
    last = linkRe.lastIndex;
  }
  parts.push(escape(content.slice(last)).replace(/\n/g, "<br>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>"));
  return parts.join("");
}
