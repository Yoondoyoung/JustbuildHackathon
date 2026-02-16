const b=(e,t=document)=>{var i;for(const o of e){const n=t.querySelector(o),c=(i=n==null?void 0:n.textContent)==null?void 0:i.trim();if(c)return c}},q=e=>{var t;for(const i of e){const o=document.querySelector(`meta[name="${i}"], meta[property="${i}"]`),n=(t=o==null?void 0:o.getAttribute("content"))==null?void 0:t.trim();if(n)return n}},A=e=>{if(!e)return;const t=e.replace(/[^0-9.]/g,""),i=Number(t);return Number.isFinite(i)?i:void 0},j=e=>{if(!e)return;const t=e.replace(/,/g,"").match(/(\d+(\.\d+)?)/);return t?A(t[1]):void 0},$=(e,t="USD")=>e?e.includes("£")?"GBP":e.includes("€")?"EUR":e.includes("¥")?"JPY":e.includes("₩")?"KRW":e.includes("$")?"USD":t:t,X=e=>e.replace(/[:：]\s*$/,"").trim(),K=(e,t,i)=>{const o=t?X(t):"",n=(i==null?void 0:i.trim())??"";!o||!n||e[o]||(e[o]=n)},V=(e,t)=>{e.querySelectorAll("table").forEach(i=>{i.querySelectorAll("tr").forEach(o=>{var n,c;K(t,(n=o.querySelector("th"))==null?void 0:n.textContent,(c=o.querySelector("td"))==null?void 0:c.textContent)})}),e.querySelectorAll("dl").forEach(i=>{Array.from(i.querySelectorAll("dt")).forEach(n=>{var c;K(t,n.textContent,(c=n.nextElementSibling)==null?void 0:c.textContent)})}),e.querySelectorAll("li").forEach(i=>{const o=i.querySelector("span.a-text-bold, strong, b");if(!o)return;const n=o.textContent??"",c=X(n);if(!c)return;const a=(i.textContent??"").replace(n,"").replace(/^[\s:-]+/,"").trim();K(t,c,a)})},O=(e=document)=>{const t={};return V(e,t),Object.keys(t).length>0?t:void 0},ie=["[itemprop=review]","[data-hook=review]",".review",".reviews-list .review-item","[data-testid=review-card]",".ugc-review-body"],U=(e=ie,t=document)=>{const i=[];return t.querySelectorAll(e.join(",")).forEach(o=>{var c;if(i.length>=5)return;const n=(c=o.textContent)==null?void 0:c.trim();n&&n.length>20&&i.push(n.replace(/\s+/g," "))}),i.length>0?i:void 0},ne=()=>{var s;const e=q(["og:title","twitter:title"])||b(["h1","[itemprop=name]","[data-test=product-title]"])||document.title,t=q(["product:brand","og:brand"])||b(["[itemprop=brand]","[data-brand]",".brand",".product-brand"]),i=q(["product:mpn","product:model"])||b(["[itemprop=mpn]","[data-model]"]),o=q(["product:price:amount","price","og:price:amount"])||b(["[itemprop=price]","[data-test=product-price]",".price"]),n=q(["product:price:currency","price:currency"])||((s=document.querySelector("[itemprop=priceCurrency]"))==null?void 0:s.getAttribute("content"))||$(o,"USD"),c=q(["rating","ratingValue"])||b(["[itemprop=ratingValue]","[data-test=rating]",".rating"]),r=q(["reviewCount"])||b(["[itemprop=reviewCount]","[data-hook=total-review-count]",".review-count"]),a=A(o);return{title:e,brand:t,model:i,price:a!==void 0?{value:a,currency:n}:void 0,rating:j(c),review_count:A(r),key_specs:O(),visible_reviews:U()}},oe=e=>e&&e.replace(/^Brand:\s*/i,"").replace(/^Visit the\s*/i,"").replace(/\s*Store$/i,"").trim()||void 0,re=()=>{const e={};["#productDetails_techSpec_section_1","#productDetails_detailBullets_sections1","#technicalSpecifications_feature_div","#detailBullets_feature_div","#detailBulletsWrapper_feature_div","#prodDetails"].forEach(o=>{const n=document.querySelector(o);n&&V(n,e)});const i=O();return i&&Object.entries(i).forEach(([o,n])=>{e[o]||(e[o]=n)}),Object.keys(e).length>0?e:void 0},se=()=>b(["#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE","#mir-layout-DELIVERY_BLOCK-slot-DELIVERY_MESSAGE","#deliveryMessageMirId","#deliveryMessage","#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_SMALL"]),ae=()=>{const e=b(["#productTitle","h1#title"]),t=document.querySelector("#bylineInfo"),i=oe((t==null?void 0:t.getAttribute("aria-label"))??(t==null?void 0:t.textContent)??""),o=b(["#corePrice_feature_div .a-offscreen","#apex_desktop .a-price .a-offscreen","#priceblock_ourprice","#priceblock_dealprice","#priceblock_saleprice"])??q(["product:price:amount","price","og:price:amount"]),n=A(o),c=q(["product:price:currency","price:currency"])||$(o,"USD"),r=document.querySelector("#acrPopover"),a=(r==null?void 0:r.getAttribute("title"))||(r==null?void 0:r.textContent)||b(["#averageCustomerReviews .a-icon-alt","span[data-hook=rating-out-of-text]"]),s=b(["#acrCustomerReviewText","span[data-hook=total-review-count]"]),d=re(),m=(d==null?void 0:d["Item model number"])||(d==null?void 0:d.Model)||b(["[itemprop=mpn]"]);return{title:e,brand:i,model:m,price:n!==void 0?{value:n,currency:c}:void 0,rating:j(a),review_count:A(s),key_specs:d,visible_reviews:U(["[data-hook=review-body]",".review-text","[data-hook=review]"]),shipping_returns:se()}},ce=()=>{var r;const e={},t=document.querySelector('[data-testid="brix-sheet"]');t&&t.querySelectorAll('div.inline-flex.w-full, div[class*="inline-flex"][class*="w-full"], div[class*="dB7j8sHUbncyf79K"]').forEach(s=>{var u,v;const d=s.querySelector('div.font-weight-medium, div[class*="font-weight-medium"]'),m=s.querySelector('div[class*="pl-300"], div.grow.basis-none[class*="pl-300"]');if(d&&m){const S=d.cloneNode(!0);S.querySelectorAll("button").forEach(L=>L.remove());let y=((u=S.textContent)==null?void 0:u.trim())||"";const f=((v=m.textContent)==null?void 0:v.trim())||"";y=y.replace(/\s+/g," ").trim(),y&&f&&y.length>0&&f.length>0&&(e[y]=f)}});const i=document.querySelectorAll("h2.h5");let o=null;for(const a of Array.from(i))if(((r=a.textContent)==null?void 0:r.trim())==="Highlights"){o=a;break}if(o){const a=o.parentElement;a&&a.querySelectorAll("button.c-button-unstyled").forEach(d=>{var u,v,S;const m=d.querySelector("div.flex.flex-column");if(m){const h=m.querySelector("div:first-child"),y=m.querySelector('div.font-500, div[class*="font-500"]');if(h&&y){const f=h.cloneNode(!0);f.querySelectorAll("svg").forEach(g=>g.remove());let x=((u=f.textContent)==null?void 0:u.trim())||"",k=((v=y.textContent)==null?void 0:v.trim())||"";const _=y.cloneNode(!0);_.querySelectorAll("svg").forEach(g=>g.remove()),k=((S=_.textContent)==null?void 0:S.trim())||"",x=x.replace(/\s+/g," ").trim(),k=k.replace(/\s+/g," ").trim(),x&&k&&x.length>0&&k.length>0&&(e[x]||(e[x]=k))}}})}["#specifications",".specifications",".specification-table",".product-data"].forEach(a=>{const s=document.querySelector(a);s&&V(s,e)});const c=O();return c&&Object.entries(c).forEach(([a,s])=>{e[a]||(e[a]=s)}),Object.keys(e).length>0?e:void 0},le=()=>{var r,a,s,d;const e=document.querySelector('[data-component-name="FulfillmentSelector"]');if(!e)return b([".fulfillment-additional-info",".availabilityMessage",".fulfillment-fulfillment-summary"]);const t=[],i=e.querySelector('button[data-test-id="pickup"]');if(i){const u=(i.getAttribute("aria-label")||"").match(/(?:Ready on|Pickup)\s+([^,]+,\s*[^,]+)/i);if(u)t.push(`Pickup: ${u[1]}`);else{const v=(a=(r=i.querySelector("strong"))==null?void 0:r.textContent)==null?void 0:a.trim();v&&t.push(`Pickup: ${v}`)}}const o=e.querySelector('button[data-test-id="shipping"]');if(o){const u=(o.getAttribute("aria-label")||"").match(/(?:Get it by|Shipping)\s+([^,]+,\s*[^,]+)/i);if(u)t.push(`Shipping: ${u[1]}`);else{const v=(d=(s=o.querySelector("strong"))==null?void 0:s.textContent)==null?void 0:d.trim();v&&t.push(`Shipping: ${v}`)}}const c=(e.textContent||"").match(/Order now for pickup on ([^a]+) at\s+([^<]+)/i);return c&&t.push(`Pickup location: ${c[2].trim()}`),t.length>0?t.join(" - "):void 0},de=()=>{var v,S,h,y,f,L;const e=b([".sku-title h1","h1.sku-title","h1"]);let t;const i=document.querySelector('[data-component-name="ProductHeader"]');if(i){const x=i.querySelector(".description a");t=(v=x==null?void 0:x.textContent)==null?void 0:v.trim()}let o;if(i){const x=i.querySelector(".disclaimer");if(x){const _=(x.textContent||"").match(/Model:\s*([^\s]+)/i);_&&(o=_[1])}}let n;const c=document.querySelector('[data-testid="price-block-customer-price"]');c&&(n=(S=c.textContent)==null?void 0:S.trim()),n||(n=b([".priceView-hero-price span",".priceView-customer-price span","[data-testid=customer-price]",".pricing-price__regular-price"])??q(["product:price:amount","price","og:price:amount"]));const r=A(n),a=q(["product:price:currency","price:currency"])||$(n,"USD");let s,d;const m=document.querySelector('[data-component-name="ReviewStatsContextualized"]');if(m){const x=m.querySelector("span.font-weight-bold");if(s=(h=x==null?void 0:x.textContent)==null?void 0:h.trim(),!s){const C=(((y=m.querySelector("p.visually-hidden"))==null?void 0:y.textContent)||"").match(/Rating\s+(\d+(?:\.\d+)?)\s+out\s+of/i);C&&(s=C[1])}const k=m.querySelector("span.c-reviews"),l=(((f=k==null?void 0:k.textContent)==null?void 0:f.trim())||"").match(/(\d+)\s*review/i);if(l&&(d=l[1]),!d){const C=(((L=m.querySelector("p.visually-hidden"))==null?void 0:L.textContent)||"").match(/(\d+)\s+review/i);C&&(d=C[1])}}s||(s=b([".c-review-average",".ugc-c-review-average","[data-automation=overall-rating]"])),d||(d=b([".c-review-count",".ugc-c-review-count","[data-automation=review-count]"]));const u=ce();return t=t||(u==null?void 0:u.Brand)||(u==null?void 0:u["Brand Name"]),o=o||(u==null?void 0:u.Model)||(u==null?void 0:u["Model Number"]),{title:e,brand:t,model:o,price:r!==void 0?{value:r,currency:a}:void 0,rating:j(s),review_count:A(d),key_specs:u,visible_reviews:U(["[data-component-name=CustomerReviewListSection] #review-list li p","#review-list li p","[data-testid=enhanced-review-content]","[data-testid=review-card]",".ugc-review-body",".review-text",".review-item"]),shipping_returns:le()}},pe=()=>{const e={};["[data-testid=specifications-section]","[data-testid=product-specifications]","#product-specifications","#specifications"].forEach(o=>{const n=document.querySelector(o);n&&V(n,e)});const i=O();return i&&Object.entries(i).forEach(([o,n])=>{e[o]||(e[o]=n)}),Object.keys(e).length>0?e:void 0},ue=()=>{var s,d,m;const e=document.querySelector("#fulfillment-Shipping-content");if(!e)return;const t=[],i=e.querySelector('[data-seo-id="fulfillment-shipping-intent"]'),o=(s=i==null?void 0:i.textContent)==null?void 0:s.trim();o&&t.push(o);const n=i==null?void 0:i.nextElementSibling,c=(d=n==null?void 0:n.textContent)==null?void 0:d.trim();c&&c!==o&&t.push(c);const r=e.querySelector(".f7.b.green, .f7.b"),a=(m=r==null?void 0:r.textContent)==null?void 0:m.trim();return a&&t.push(a),t.length>0?t.join(" - "):void 0},me=()=>{const e=[];return document.querySelectorAll('[data-testid="enhanced-review-content"]').forEach(i=>{var a,s;if(e.length>=5)return;const o=i.querySelector("h3"),n=((a=o==null?void 0:o.textContent)==null?void 0:a.trim())||"",c=i.querySelector('p[tabindex="-1"]'),r=((s=c==null?void 0:c.textContent)==null?void 0:s.trim())||"";if(r&&r.length>20){const d=n?`${n}. ${r}`:r;e.push(d.replace(/\s+/g," "))}}),e.length>0?e:void 0},fe=()=>{var m,u,v;const e=b(["[data-testid=product-title]","h1","[itemprop=name]"]),t=b(["[data-testid=brand-name]","[itemprop=brand]","a[data-testid=brand-name]","[data-automation-id=brand-name]"]),i=b(["[data-testid=price-wrap] [itemprop=price]","[data-testid=price-wrap]","[data-testid=price]","[itemprop=price]","[data-automation-id=product-price]"])??q(["product:price:amount","price","og:price:amount"]),o=A(i),n=q(["product:price:currency","price:currency"])||$(i,"USD"),c=document.querySelector('[data-testid="reviews-and-ratings"]');let r,a;if(c){const S=c.querySelector("span.w_iUH7");if(S){const h=((m=S.textContent)==null?void 0:m.trim())||"",y=h.match(/(\d+\.?\d*)\s*stars?/i);y&&(r=y[1]);const f=h.match(/(\d+(?:,\d+)?)\s*reviews?/i);f&&(a=f[1])}if(!r){const h=c.querySelector("span.f7"),f=(((u=h==null?void 0:h.textContent)==null?void 0:u.trim())||"").match(/\((\d+\.?\d*)\)/);f&&(r=f[1])}if(!a){const h=c.querySelector('[itemprop="ratingCount"]'),f=(((v=h==null?void 0:h.textContent)==null?void 0:v.trim())||"").match(/(\d+(?:,\d+)?)/);f&&(a=f[1])}}r||(r=b(["[data-testid=reviews-rating]","[itemprop=ratingValue]",".stars-container"])),a||(a=b(["[data-testid=reviews-header]","[data-testid=reviews-count]","[itemprop=reviewCount]",".stars-reviews-count"]));const s=pe(),d=(s==null?void 0:s.Model)||(s==null?void 0:s["Model Number"]);return{title:e,brand:t,model:d,price:o!==void 0?{value:o,currency:n}:void 0,rating:j(r),review_count:A(a),key_specs:s,visible_reviews:me()||U(["[data-testid=review-card]","[data-testid=review-text]","[data-testid=review-body]",".review-text",".prod-ProductReview",".review-body","[data-automation-id=review-text]","section[data-testid=reviews-section] [data-testid=review-card]"]),shipping_returns:ue()}},he=e=>{const t=e.toLowerCase();return t.includes("amazon.")?ae:t.includes("walmart.")?fe:t.endsWith("bestbuy.com")?de:null},be=(e,t)=>{var o;const i={...e.key_specs??{},...t.key_specs??{}};return{page_url:location.href,store_domain:location.host,title:t.title??e.title,brand:t.brand??e.brand,model:t.model??e.model,price:t.price??e.price,rating:t.rating??e.rating,review_count:t.review_count??e.review_count,key_specs:Object.keys(i).length>0?i:void 0,visible_reviews:(o=t.visible_reviews)!=null&&o.length?t.visible_reviews:e.visible_reviews,shipping_returns:t.shipping_returns??e.shipping_returns}},ye=()=>{const e=ne(),t=he(location.host),i=t?t():{};return be(e,i)};function ge(e){if(!e||typeof e!="string")return"";const t=r=>r.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),i=[],o=/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;let n=0,c;for(;(c=o.exec(e))!==null;)i.push(t(e.slice(n,c.index)).replace(/\n/g,"<br>").replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>")),i.push(`<a href="${t(c[2])}" target="_blank" rel="noreferrer noopener">${t(c[1])}</a>`),n=o.lastIndex;return i.push(t(e.slice(n)).replace(/\n/g,"<br>").replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>")),i.join("")}const J="shopsense-sidebar";let Y=null,I=null,F=null,W=null,H=null,E=null,p=null;const ve=async()=>{try{const e=await chrome.runtime.sendMessage({type:"GET_TAB_ID"});if(typeof(e==null?void 0:e.tabId)=="number")return e.tabId}catch{}return null},D=e=>{if(!F||!I)return;F.textContent=e,I.classList.remove("busy","error");const t=e.toLowerCase();t.includes("fail")||t.includes("error")?I.classList.add("error"):(t.includes("analyz")||t.includes("send"))&&I.classList.add("busy")},xe=(e,t)=>{var o,n,c;e.innerHTML="";const i=document.createElement("p");if(i.textContent=t.summary??"No summary available.",e.appendChild(i),t.price){const r=document.createElement("div");r.className="meta-row",r.textContent=`Price: ${t.price.value} ${t.price.currency}`,e.appendChild(r)}if(t.rating!==void 0){const r=document.createElement("div");r.className="meta-row",r.textContent=`Rating: ${t.rating}`,e.appendChild(r)}if(t.review_count!==void 0){const r=document.createElement("div");r.className="meta-row",r.textContent=`Reviews: ${t.review_count}`,e.appendChild(r)}if((o=t.key_points)!=null&&o.length){const r=document.createElement("ul");t.key_points.forEach(a=>{const s=document.createElement("li");s.textContent=a,r.appendChild(s)}),e.appendChild(r)}if(t.specs&&Object.keys(t.specs).length>0){const r=document.createElement("div");r.className="specs",Object.entries(t.specs).forEach(([a,s])=>{const d=document.createElement("div");d.className="spec-row",d.textContent=`${a}: ${s}`,r.appendChild(d)}),e.appendChild(r)}if((n=t.citations)!=null&&n.length){const r=document.createElement("div");r.className="citations",t.citations.forEach(a=>{const s=document.createElement("a");s.href=a.url,s.target="_blank",s.rel="noreferrer",s.textContent=a.title??a.url,r.appendChild(s)}),e.appendChild(r)}if((c=t.suggested_questions)!=null&&c.length){const r=document.createElement("div");r.className="suggested-questions",t.suggested_questions.forEach(a=>{const s=document.createElement("button");s.type="button",s.className="suggested-question-btn",s.textContent=a,s.style.display="block",s.style.width="100%",s.style.textAlign="left",s.style.padding="0.5rem 0.75rem",s.style.marginBottom="0.35rem",s.style.cursor="pointer",s.style.border="1px solid #e0e0e0",s.style.borderRadius="4px",s.style.background="#f5f5f5",s.style.fontSize="0.9rem",s.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"CHAT_SEND",question:a})}),r.appendChild(s)}),e.appendChild(r)}},ee=(e,t)=>{var n;const i=document.createElement("div");i.className=`chat-message ${t.role}`;const o=document.createElement("div");if(o.className="chat-text",o.innerHTML=ge(t.content),i.appendChild(o),(n=t.citations)!=null&&n.length){const c=document.createElement("div");c.className="chat-citations",t.citations.forEach(r=>{const a=document.createElement("a");a.href=r.url,a.target="_blank",a.rel="noreferrer",a.textContent=r.title??r.url,c.appendChild(a)}),i.appendChild(c)}e.appendChild(i),e.scrollTop=e.scrollHeight},te=()=>{if(p)return;const e=document.getElementById(J);if(e){p=e;return}const t=document.createElement("div");t.id=J,t.style.position="fixed",t.style.top="16px",t.style.right="16px",t.style.left="auto",t.style.bottom="auto",t.style.margin="0",t.style.transform="none",t.style.width="340px",t.style.height="calc(100vh - 32px)",t.style.zIndex="2147483647",t.style.display="none";const i=t.attachShadow({mode:"open"});i.innerHTML=`
    <style>
      :host { all: initial; }
      * { box-sizing: border-box; font-family: system-ui, sans-serif; }
      .sidebar { height: 100%; background: #fff; border-radius: 16px; border: 1px solid #f0f0f0;
        box-shadow: 0 8px 30px rgba(0,0,0,0.12); display: flex; flex-direction: column; overflow: hidden; position: relative; }
      .header { padding: 16px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
      .title { font-size: 18px; font-weight: 700; color: #111827; }
      .status { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280; }
      .dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
      .dot.busy { background: #f59e0b; }
      .dot.error { background: #ef4444; }
      .action { padding: 14px 16px; border-bottom: 1px solid #eee; }
      .btn { border: none; border-radius: 10px; padding: 10px 12px; cursor: pointer; font-weight: 600; font-size: 13px; }
      .btn-secondary { width: 100%; background: #f3f4f6; color: #111827; }
      .btn-primary { background: #3b82f6; color: #fff; }
      .content { flex: 1; padding: 16px; background: #fafafa; overflow-y: auto; }
      .panel { background: #fff; padding: 12px; border-radius: 12px; margin-bottom: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
      .panel h2 { margin: 0 0 8px 0; font-size: 14px; }
      .meta-row { font-size: 13px; margin-top: 4px; color: #4b5563; }
      .specs { margin-top: 8px; font-size: 12px; }
      .spec-row { padding: 4px 0; border-bottom: 1px solid #eee; }
      .chat-log { font-size: 13px; }
      .chat-text { line-height: 1.5; }
      .chat-text a { color: #2563eb; text-decoration: none; }
      .chat-text a:hover { text-decoration: underline; }
      .chat-message { padding: 8px; border-radius: 10px; margin-bottom: 8px; background: #f3f4f6; }
      .chat-message.user { background: #e0ecff; }
      .chat-citations a { display: block; font-size: 11px; color: #3b82f6; }
      .chat-input { padding: 12px 16px 16px; border-top: 1px solid #eee; background: #fff; position: relative; }
      .chat-input textarea { width: 100%; padding: 12px 48px 12px 12px; border-radius: 12px; border: 1px solid #e5e7eb; background: #f9fafb; resize: none; outline: none; font-size: 13px; }
      .chat-input button { position: absolute; right: 22px; bottom: 22px; }
      .auth-wrapper {
        flex: 1;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 20px;
        overflow-y: auto;
      }
      .auth-container { width: 100%; max-width: 320px; }
      .auth-title { text-align: center; font-size: 24px; font-weight: 700; margin: 0 0 24px 0; color: #111827; }
      .auth-tabs { display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
      .auth-tab { flex: 1; padding: 12px; border: none; background: transparent; color: #6b7280; font-size: 14px; font-weight: 500; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; }
      .auth-tab:hover { color: #111827; }
      .auth-tab.active { color: #3b82f6; border-bottom-color: #3b82f6; }
      .auth-form { display: flex; flex-direction: column; gap: 16px; }
      .auth-input { width: 100%; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: #fff; outline: none; box-sizing: border-box; transition: border-color 0.2s; }
      .auth-input:focus { border-color: #3b82f6; }
      .auth-error { padding: 10px; background: #fee2e2; color: #dc2626; border-radius: 8px; font-size: 13px; text-align: center; display: none; }
      .auth-submit { width: 100%; padding: 12px; margin-top: 8px; }
      .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }
      .main-content { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
      .settings-btn { background: none; border: none; cursor: pointer; padding: 4px; color: #6b7280; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.2s; }
      .settings-btn:hover { background: #f3f4f6; color: #111827; }
      .settings-icon { width: 18px; height: 18px; }
      .minimize-btn { background: none; border: none; cursor: pointer; padding: 4px; color: #6b7280; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.2s; }
      .minimize-btn:hover { background: #f3f4f6; color: #111827; }
      .minimize-icon { width: 18px; height: 18px; }
      .sidebar.minimized { width: 80px !important; height: 80px !important; border-radius: 50% !important; overflow: visible !important; }
      .sidebar.minimized .header { padding: 0; border: none; justify-content: center; align-items: center; height: 100%; overflow: visible; }
      .sidebar.minimized .title { display: none; }
      .sidebar.minimized .status { display: none; }
      .sidebar.minimized .settings-btn { display: none; }
      .sidebar.minimized .minimize-btn { display: none; }
      .sidebar.minimized #ss-auth-container { display: none !important; }
      .sidebar.minimized #ss-main-content { display: none !important; }
      .minimized-icon { display: none; }
      .sidebar.minimized .minimized-icon { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; position: relative; cursor: pointer; overflow: visible; }
      .icon-circle { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(180deg, #a78bfa 0%, #f9a8d4 100%); position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); overflow: visible; }
      .icon-circle::before { content: ''; position: absolute; top: 8px; left: 8px; width: 20px; height: 20px; background: rgba(255,255,255,0.3); border-radius: 50%; }
      .shopping-bag-icon { width: 28px; height: 28px; stroke: white; stroke-width: 2; fill: none; position: relative; z-index: 1; }
      .question-mark { fill: white; }
      .ps-text { font-size: 7px; font-weight: 400; color: #4b5563; font-family: Georgia, serif; margin-top: 20px; position: relative; z-index: 1; line-height: 1; }
      .close-btn-mini { position: absolute; top: -10px; right: -10px; width: 26px; height: 26px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); z-index: 100; }
      .close-btn-mini:hover { background: #f3f4f6; }
      .close-x { width: 14px; height: 14px; stroke: #111827; stroke-width: 2.5; }
      .more-options-mini { position: absolute; top: 8px; right: 8px; width: 20px; height: 20px; display: flex; flex-direction: column; justify-content: space-between; cursor: pointer; }
      .more-options-mini .dot { width: 4px; height: 4px; background: rgba(255,255,255,0.8); border-radius: 50%; }
      .more-options-mini:hover .dot { background: white; }
    </style>
    <div class="sidebar" id="ss-sidebar">
      <div class="header">
        <div class="title">ShopSense</div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="status"><span class="dot" id="ss-status-dot"></span><span id="ss-status-text">Idle</span></div>
          <button class="settings-btn" id="ss-settings-btn" title="Settings">
            <svg class="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <button class="minimize-btn" id="ss-minimize-btn" title="Minimize">
            <svg class="minimize-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="minimized-icon" id="ss-minimized-icon">
        <div class="icon-circle">
          <svg class="shopping-bag-icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <svg viewBox="0 0 24 24" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 20px; height: 20px;">
            <text x="12" y="16" text-anchor="middle" class="question-mark" fill="white" font-size="14" font-weight="bold" font-family="system-ui, sans-serif">?</text>
          </svg>
          <div class="ps-text">
            P<span style="position: relative;">S<svg class="checkmark" viewBox="0 0 8 8" style="position: absolute; right: -5px; bottom: -1px; width: 6px; height: 6px;">
              <path d="M1 4l2 2 4-4" stroke="#4b5563" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg></span>
          </div>
          <div class="close-btn-mini" id="ss-close-mini">
            <svg class="close-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </div>
          <div class="more-options-mini" id="ss-more-options-mini">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
      </div>
      <div id="ss-auth-container" class="auth-wrapper" style="display: none;"></div>
      <div id="ss-main-content" class="main-content">
        <div class="action">
          <button id="ss-analyze-btn" class="btn btn-secondary" type="button">Analyze Page</button>
        </div>
        <div class="content">
          <section id="ss-analyze" class="panel"></section>
          <div id="ss-chat-section" style="display: none;">
            <section class="panel">
              <h2>Chat</h2>
              <div id="ss-chat" class="chat-log"></div>
            </section>

            <form id="ss-chat-form" class="chat-input">
              <textarea id="ss-chat-input" rows="2" placeholder="Ask about this product..."></textarea>
              <button class="btn btn-primary" type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,document.documentElement.appendChild(t),p=t,I=i.querySelector("#ss-status-dot"),F=i.querySelector("#ss-status-text"),W=i.querySelector("#ss-analyze"),H=i.querySelector("#ss-chat"),E=i.querySelector("#ss-chat-input");const o=i.querySelector("#ss-chat-section"),n=i.querySelector("#ss-auth-container"),c=i.querySelector("#ss-main-content"),r=i.querySelector("#ss-analyze-btn"),a=i.querySelector("#ss-chat-form"),s=i.querySelector("#ss-settings-btn"),d=i.querySelector("#ss-minimize-btn"),m=i.querySelector("#ss-sidebar"),u=l=>{var g;o.style.display="none",E&&(E.disabled=!0),(g=a.querySelector("button[type='submit']"))==null||g.toggleAttribute("disabled",!0),E&&(E.value="")},v=async()=>{try{const l=await chrome.runtime.sendMessage({type:"CHECK_AUTH"});if(l!=null&&l.isAuthenticated){const g=await chrome.runtime.sendMessage({type:"CHECK_PREFERENCES"});g!=null&&g.hasPreferences?y():h()}else S()}catch(l){console.error("Auth check failed:",l),S()}},S=()=>{n.style.display="flex",c.style.display="none",n.innerHTML=`
      <div class="auth-container">
        <h2 class="auth-title">ShopSense</h2>
        <div class="auth-tabs">
          <button class="auth-tab active" data-mode="login">Sign In</button>
          <button class="auth-tab" data-mode="signup">Sign Up</button>
        </div>
        <form class="auth-form" id="ss-auth-form">
          <input type="email" class="auth-input" placeholder="Email" required id="ss-auth-email">
          <input type="password" class="auth-input" placeholder="Password" required id="ss-auth-password">
          <div class="auth-error" id="ss-auth-error" style="display: none;"></div>
          <button type="submit" class="btn btn-primary auth-submit" id="ss-auth-submit">Sign In</button>
        </form>
      </div>
    `;let l="login";const g=n.querySelector('[data-mode="login"]'),C=n.querySelector('[data-mode="signup"]'),B=n.querySelector("#ss-auth-form"),z=n.querySelector("#ss-auth-email"),R=n.querySelector("#ss-auth-password"),w=n.querySelector("#ss-auth-error"),T=n.querySelector("#ss-auth-submit"),P=M=>{l=M,g.classList.toggle("active",M==="login"),C.classList.toggle("active",M==="signup"),T.textContent=M==="login"?"Sign In":"Sign Up",w.style.display="none"};g.addEventListener("click",()=>P("login")),C.addEventListener("click",()=>P("signup")),B.addEventListener("submit",async M=>{M.preventDefault(),w.style.display="none";const Q=z.value.trim(),Z=R.value;if(!Q||!Z){w.textContent="Please enter email and password.",w.style.display="block";return}T.disabled=!0,T.textContent=l==="login"?"Signing in...":"Signing up...";try{const N=await chrome.runtime.sendMessage({type:l==="login"?"SIGN_IN":"SIGN_UP",email:Q,password:Z});if(N!=null&&N.error)w.textContent=N.error,w.style.display="block";else{const G=await chrome.runtime.sendMessage({type:"CHECK_PREFERENCES"});G!=null&&G.hasPreferences?y():h()}}catch(N){w.textContent=N.message||"An error occurred.",w.style.display="block"}finally{T.disabled=!1,T.textContent=l==="login"?"Sign In":"Sign Up"}})},h=async()=>{n.style.display="flex",c.style.display="none";let l=null;try{const z=await chrome.runtime.sendMessage({type:"GET_PREFERENCES"});l=(z==null?void 0:z.preferences)||null}catch(z){console.error("Failed to load preferences:",z)}n.innerHTML=`
      <div class="auth-container" style="max-width: 400px;">
        <h2 class="auth-title">Shopping Preferences</h2>
        <p style="text-align: center; color: #6b7280; margin-bottom: 24px; font-size: 14px;">
          Help us personalize your shopping experience
        </p>
        <form class="auth-form" id="ss-preferences-form">
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px;">
              Price Sensitivity <span style="color: #6b7280; font-weight: normal;">(optional)</span>
            </label>
            <select class="auth-input" id="ss-pref-price">
              <option value="">No preference</option>
              <option value="budget">Budget-conscious</option>
              <option value="value">Value-focused</option>
              <option value="premium">Premium</option>
              <option value="flexible">Price-flexible</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px;">
              Quality Preference <span style="color: #6b7280; font-weight: normal;">(optional)</span>
            </label>
            <select class="auth-input" id="ss-pref-quality">
              <option value="">No preference</option>
              <option value="high">High Quality</option>
              <option value="balanced">Balanced</option>
              <option value="basic">Basic</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px;">
              Brand Preference <span style="color: #6b7280; font-weight: normal;">(optional)</span>
            </label>
            <select class="auth-input" id="ss-pref-brand">
              <option value="">No preference</option>
              <option value="loyal">Brand-loyal</option>
              <option value="explorer">Brand-explorer</option>
              <option value="none">No preference</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px;">
              Sustainability <span style="color: #6b7280; font-weight: normal;">(optional)</span>
            </label>
            <select class="auth-input" id="ss-pref-sustainability">
              <option value="">No preference</option>
              <option value="eco">Eco-friendly</option>
              <option value="low">Not a priority</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px;">
              Review Dependency <span style="color: #6b7280; font-weight: normal;">(optional)</span>
            </label>
            <select class="auth-input" id="ss-pref-reviews">
              <option value="">No preference</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px;">
              Innovation Adoption <span style="color: #6b7280; font-weight: normal;">(optional)</span>
            </label>
            <select class="auth-input" id="ss-pref-innovation">
              <option value="">No preference</option>
              <option value="early">Early adopter</option>
              <option value="wait">Wait for reviews</option>
              <option value="conservative">Conservative</option>
            </select>
          </div>
          <div class="auth-error" id="ss-pref-error" style="display: none;"></div>
          <button type="submit" class="btn btn-primary auth-submit" id="ss-pref-submit">Save Preferences</button>
        </form>
      </div>
    `;const g=n.querySelector("#ss-preferences-form"),C=n.querySelector("#ss-pref-error"),B=n.querySelector("#ss-pref-submit");if(l){const z=n.querySelector("#ss-pref-price"),R=n.querySelector("#ss-pref-quality"),w=n.querySelector("#ss-pref-brand"),T=n.querySelector("#ss-pref-sustainability"),P=n.querySelector("#ss-pref-reviews"),M=n.querySelector("#ss-pref-innovation");z&&l.price&&(z.value=l.price),R&&l.quality&&(R.value=l.quality),w&&l.brand&&(w.value=l.brand),T&&l.sustainability&&(T.value=l.sustainability),P&&l.reviews&&(P.value=l.reviews),M&&l.innovation&&(M.value=l.innovation)}g.addEventListener("submit",async z=>{z.preventDefault(),C.style.display="none";const R={price:n.querySelector("#ss-pref-price").value||null,quality:n.querySelector("#ss-pref-quality").value||null,brand:n.querySelector("#ss-pref-brand").value||null,sustainability:n.querySelector("#ss-pref-sustainability").value||null,reviews:n.querySelector("#ss-pref-reviews").value||null,innovation:n.querySelector("#ss-pref-innovation").value||null};B.disabled=!0,B.textContent="Saving...";try{const w=await chrome.runtime.sendMessage({type:"SAVE_PREFERENCES",preferences:R});w!=null&&w.error?(C.textContent=w.error,C.style.display="block"):y()}catch(w){C.textContent=w.message||"An error occurred.",C.style.display="block"}finally{B.disabled=!1,B.textContent="Save Preferences"}})},y=()=>{n.style.display="none",c.style.display="flex",u()};r.addEventListener("click",async()=>{D("Analyzing..."),await chrome.runtime.sendMessage({type:"ANALYZE_CLICK"})}),a.addEventListener("submit",async l=>{l.preventDefault();const g=(E==null?void 0:E.value.trim())??"";!g||!H||(ee(H,{role:"user",content:g}),E&&(E.value=""),await chrome.runtime.sendMessage({type:"CHAT_SEND",question:g}))}),E==null||E.addEventListener("keydown",l=>{l.isComposing||l.key==="Enter"&&!l.shiftKey&&(l.preventDefault(),a.requestSubmit())}),s.addEventListener("click",()=>{h()});let f=!1;const L=i.querySelector("#ss-minimized-icon"),x=i.querySelector("#ss-close-mini"),k=i.querySelector("#ss-more-options-mini"),_=()=>{if(f=!f,f){if(m.classList.add("minimized"),d.title="Expand",p){const l=p.style.top||window.getComputedStyle(p).top||"16px";p.style.position="fixed",p.style.top=l,p.style.right="16px",p.style.left="auto",p.style.bottom="auto",p.style.width="80px",p.style.height="80px",p.style.margin="0",p.style.transform="none"}}else if(m.classList.remove("minimized"),d.title="Minimize",p){const l=p.style.top||window.getComputedStyle(p).top||"16px";p.style.position="fixed",p.style.top=l,p.style.right="16px",p.style.left="auto",p.style.bottom="auto",p.style.width="340px",p.style.height="calc(100vh - 32px)",p.style.margin="0",p.style.transform="none"}};d.addEventListener("click",l=>{l.stopPropagation(),_()}),L.addEventListener("click",l=>{l.stopPropagation(),f&&_()}),x.addEventListener("click",l=>{l.stopPropagation(),p&&(p.style.display="none")}),k.addEventListener("click",l=>{l.stopPropagation(),h()}),v()},we=()=>{te(),p&&(p.style.display="block")},Se=()=>{if(te(),!p)return;const e=p.style.display==="none";p.style.display=e?"block":"none"},Ce=()=>{const e=ye();return console.log("[ShopSense] extracted",e),e};chrome.runtime.onMessage.addListener((e,t,i)=>{if(e.type==="EXTRACT_REQUEST")return i(Ce()),!0;const o="tabId"in e?e.tabId:void 0;return o!=null&&Y!=null&&o!==Y?!1:e.type==="TOGGLE_SIDEBAR"?(Se(),!0):(we(),e.type==="STATUS"||e.type==="ERROR"?(D(e.message),!0):e.type==="ANALYZE_RESULT"&&W?(xe(W,e.result),D("Analyze completed"),setChatEnabled(!0),!0):e.type==="CHAT_RESPONSE"&&H?(ee(H,e.message),D("Chat ready"),!0):!1)});const ke=async()=>{Y=await ve()};ke();
