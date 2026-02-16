import "dotenv/config";

// Copy of formatChatContent for testing
function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatChatContent(content: string): string {
  if (!content || typeof content !== "string") return "";
  
  // Use a placeholder for images to avoid escaping them
  const imagePlaceholders: string[] = [];
  let processed = content;
  
  // Process images first and replace with placeholders
  const imageRe = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
  processed = processed.replace(imageRe, (match, alt, url) => {
    const escapedUrl = escape(url);
    const escapedAlt = escape(alt || "Product image");
    const placeholder = `__IMAGE_PLACEHOLDER_${imagePlaceholders.length}__`;
    imagePlaceholders.push(`<img src="${escapedUrl}" alt="${escapedAlt}" style="max-width: 200px; max-height: 200px; border-radius: 8px; margin: 8px 0;" loading="lazy" />`);
    return placeholder;
  });
  
  // Escape the rest of the content
  processed = escape(processed);
  
  // Restore image placeholders (they're already HTML-safe)
  imagePlaceholders.forEach((img, idx) => {
    processed = processed.replace(`__IMAGE_PLACEHOLDER_${idx}__`, img);
  });
  
  // Process links
  const parts: string[] = [];
  const linkRe = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(processed)) !== null) {
    parts.push(processed.slice(last, m.index).replace(/\n/g, "<br>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>"));
    parts.push(`<a href="${m[2]}" target="_blank" rel="noreferrer noopener">${m[1]}</a>`);
    last = linkRe.lastIndex;
  }
  parts.push(processed.slice(last).replace(/\n/g, "<br>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>"));
  return parts.join("");
}

// Test image formatting
const testContent = `Related products from search:

• iPad Case (amazon) — $15.99
  ![iPad Case](https://example.com/image1.jpg)
  https://amazon.com/product1

• iPhone Case (walmart) — $12.50
  ![iPhone Case](https://example.com/image2.jpg)
  https://walmart.com/product2

• Samsung Case (google) — $18.00
  https://google.com/product3`;

console.log("=".repeat(60));
console.log("이미지 포맷팅 테스트");
console.log("=".repeat(60));
console.log("\n📥 입력 (마크다운):");
console.log("-".repeat(60));
console.log(testContent);
console.log("\n📤 출력 (HTML):");
console.log("-".repeat(60));
console.log(formatChatContent(testContent));
console.log("\n✅ 테스트 완료!");
console.log("=".repeat(60));
