const h=(e,t=document)=>{var n;for(const i of e){const r=t.querySelector(i),l=(n=r==null?void 0:r.textContent)==null?void 0:n.trim();if(l)return l}},k=e=>{var t;for(const n of e){const i=document.querySelector(`meta[name="${n}"], meta[property="${n}"]`),r=(t=i==null?void 0:i.getAttribute("content"))==null?void 0:t.trim();if(r)return r}},M=e=>{if(!e)return;const t=e.replace(/[^0-9.]/g,""),n=Number(t);return Number.isFinite(n)?n:void 0},H=e=>{if(!e)return;const t=e.replace(/,/g,"").match(/(\d+(\.\d+)?)/);return t?M(t[1]):void 0},j=(e,t="USD")=>e?e.includes("£")?"GBP":e.includes("€")?"EUR":e.includes("¥")?"JPY":e.includes("₩")?"KRW":e.includes("$")?"USD":t:t,ee=e=>e.replace(/[:：]\s*$/,"").trim(),G=(e,t,n)=>{const i=t?ee(t):"",r=(n==null?void 0:n.trim())??"";!i||!r||e[i]||(e[i]=r)},$=(e,t)=>{e.querySelectorAll("table").forEach(n=>{n.querySelectorAll("tr").forEach(i=>{var r,l;G(t,(r=i.querySelector("th"))==null?void 0:r.textContent,(l=i.querySelector("td"))==null?void 0:l.textContent)})}),e.querySelectorAll("dl").forEach(n=>{Array.from(n.querySelectorAll("dt")).forEach(r=>{var l;G(t,r.textContent,(l=r.nextElementSibling)==null?void 0:l.textContent)})}),e.querySelectorAll("li").forEach(n=>{const i=n.querySelector("span.a-text-bold, strong, b");if(!i)return;const r=i.textContent??"",l=ee(r);if(!l)return;const c=(n.textContent??"").replace(r,"").replace(/^[\s:-]+/,"").trim();G(t,l,c)})},V=(e=document)=>{const t={};return $(e,t),Object.keys(t).length>0?t:void 0},ie=["[itemprop=review]","[data-hook=review]",".review",".reviews-list .review-item","[data-testid=review-card]",".ugc-review-body"],O=(e=ie,t=document)=>{const n=[];return t.querySelectorAll(e.join(",")).forEach(i=>{var l;if(n.length>=5)return;const r=(l=i.textContent)==null?void 0:l.trim();r&&r.length>20&&n.push(r.replace(/\s+/g," "))}),n.length>0?n:void 0},ne=()=>{var s;const e=k(["og:title","twitter:title"])||h(["h1","[itemprop=name]","[data-test=product-title]"])||document.title,t=k(["product:brand","og:brand"])||h(["[itemprop=brand]","[data-brand]",".brand",".product-brand"]),n=k(["product:mpn","product:model"])||h(["[itemprop=mpn]","[data-model]"]),i=k(["product:price:amount","price","og:price:amount"])||h(["[itemprop=price]","[data-test=product-price]",".price"]),r=k(["product:price:currency","price:currency"])||((s=document.querySelector("[itemprop=priceCurrency]"))==null?void 0:s.getAttribute("content"))||j(i,"USD"),l=k(["rating","ratingValue"])||h(["[itemprop=ratingValue]","[data-test=rating]",".rating"]),o=k(["reviewCount"])||h(["[itemprop=reviewCount]","[data-hook=total-review-count]",".review-count"]),c=M(i);return{title:e,brand:t,model:n,price:c!==void 0?{value:c,currency:r}:void 0,rating:H(l),review_count:M(o),key_specs:V(),visible_reviews:O()}},oe=e=>e&&e.replace(/^Brand:\s*/i,"").replace(/^Visit the\s*/i,"").replace(/\s*Store$/i,"").trim()||void 0,re=()=>{const e={};["#productDetails_techSpec_section_1","#productDetails_detailBullets_sections1","#technicalSpecifications_feature_div","#detailBullets_feature_div","#detailBulletsWrapper_feature_div","#prodDetails"].forEach(i=>{const r=document.querySelector(i);r&&$(r,e)});const n=V();return n&&Object.entries(n).forEach(([i,r])=>{e[i]||(e[i]=r)}),Object.keys(e).length>0?e:void 0},se=()=>h(["#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE","#mir-layout-DELIVERY_BLOCK-slot-DELIVERY_MESSAGE","#deliveryMessageMirId","#deliveryMessage","#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_SMALL"]),ae=()=>{const e=h(["#productTitle","h1#title"]),t=document.querySelector("#bylineInfo"),n=oe((t==null?void 0:t.getAttribute("aria-label"))??(t==null?void 0:t.textContent)??""),i=h(["#corePrice_feature_div .a-offscreen","#apex_desktop .a-price .a-offscreen","#priceblock_ourprice","#priceblock_dealprice","#priceblock_saleprice"])??k(["product:price:amount","price","og:price:amount"]),r=M(i),l=k(["product:price:currency","price:currency"])||j(i,"USD"),o=document.querySelector("#acrPopover"),c=(o==null?void 0:o.getAttribute("title"))||(o==null?void 0:o.textContent)||h(["#averageCustomerReviews .a-icon-alt","span[data-hook=rating-out-of-text]"]),s=h(["#acrCustomerReviewText","span[data-hook=total-review-count]"]),d=re(),m=(d==null?void 0:d["Item model number"])||(d==null?void 0:d.Model)||h(["[itemprop=mpn]"]);return{title:e,brand:n,model:m,price:r!==void 0?{value:r,currency:l}:void 0,rating:H(c),review_count:M(s),key_specs:d,visible_reviews:O(["[data-hook=review-body]",".review-text","[data-hook=review]"]),shipping_returns:se()}},ce=()=>{var o;const e={},t=document.querySelector('[data-testid="brix-sheet"]');t&&t.querySelectorAll('div.inline-flex.w-full, div[class*="inline-flex"][class*="w-full"], div[class*="dB7j8sHUbncyf79K"]').forEach(s=>{var u,y;const d=s.querySelector('div.font-weight-medium, div[class*="font-weight-medium"]'),m=s.querySelector('div[class*="pl-300"], div.grow.basis-none[class*="pl-300"]');if(d&&m){const S=d.cloneNode(!0);S.querySelectorAll("button").forEach(A=>A.remove());let x=((u=S.textContent)==null?void 0:u.trim())||"";const b=((y=m.textContent)==null?void 0:y.trim())||"";x=x.replace(/\s+/g," ").trim(),x&&b&&x.length>0&&b.length>0&&(e[x]=b)}});const n=document.querySelectorAll("h2.h5");let i=null;for(const c of Array.from(n))if(((o=c.textContent)==null?void 0:o.trim())==="Highlights"){i=c;break}if(i){const c=i.parentElement;c&&c.querySelectorAll("button.c-button-unstyled").forEach(d=>{var u,y,S;const m=d.querySelector("div.flex.flex-column");if(m){const g=m.querySelector("div:first-child"),x=m.querySelector('div.font-500, div[class*="font-500"]');if(g&&x){const b=g.cloneNode(!0);b.querySelectorAll("svg").forEach(v=>v.remove());let a=((u=b.textContent)==null?void 0:u.trim())||"",f=((y=x.textContent)==null?void 0:y.trim())||"";const C=x.cloneNode(!0);C.querySelectorAll("svg").forEach(v=>v.remove()),f=((S=C.textContent)==null?void 0:S.trim())||"",a=a.replace(/\s+/g," ").trim(),f=f.replace(/\s+/g," ").trim(),a&&f&&a.length>0&&f.length>0&&(e[a]||(e[a]=f))}}})}["#specifications",".specifications",".specification-table",".product-data"].forEach(c=>{const s=document.querySelector(c);s&&$(s,e)});const l=V();return l&&Object.entries(l).forEach(([c,s])=>{e[c]||(e[c]=s)}),Object.keys(e).length>0?e:void 0},le=()=>{var o,c,s,d;const e=document.querySelector('[data-component-name="FulfillmentSelector"]');if(!e)return h([".fulfillment-additional-info",".availabilityMessage",".fulfillment-fulfillment-summary"]);const t=[],n=e.querySelector('button[data-test-id="pickup"]');if(n){const u=(n.getAttribute("aria-label")||"").match(/(?:Ready on|Pickup)\s+([^,]+,\s*[^,]+)/i);if(u)t.push(`Pickup: ${u[1]}`);else{const y=(c=(o=n.querySelector("strong"))==null?void 0:o.textContent)==null?void 0:c.trim();y&&t.push(`Pickup: ${y}`)}}const i=e.querySelector('button[data-test-id="shipping"]');if(i){const u=(i.getAttribute("aria-label")||"").match(/(?:Get it by|Shipping)\s+([^,]+,\s*[^,]+)/i);if(u)t.push(`Shipping: ${u[1]}`);else{const y=(d=(s=i.querySelector("strong"))==null?void 0:s.textContent)==null?void 0:d.trim();y&&t.push(`Shipping: ${y}`)}}const l=(e.textContent||"").match(/Order now for pickup on ([^a]+) at\s+([^<]+)/i);return l&&t.push(`Pickup location: ${l[2].trim()}`),t.length>0?t.join(" - "):void 0},de=()=>{var y,S,g,x,b,A;const e=h([".sku-title h1","h1.sku-title","h1"]);let t;const n=document.querySelector('[data-component-name="ProductHeader"]');if(n){const a=n.querySelector(".description a");t=(y=a==null?void 0:a.textContent)==null?void 0:y.trim()}let i;if(n){const a=n.querySelector(".disclaimer");if(a){const C=(a.textContent||"").match(/Model:\s*([^\s]+)/i);C&&(i=C[1])}}let r;const l=document.querySelector('[data-testid="price-block-customer-price"]');l&&(r=(S=l.textContent)==null?void 0:S.trim()),r||(r=h([".priceView-hero-price span",".priceView-customer-price span","[data-testid=customer-price]",".pricing-price__regular-price"])??k(["product:price:amount","price","og:price:amount"]));const o=M(r),c=k(["product:price:currency","price:currency"])||j(r,"USD");let s,d;const m=document.querySelector('[data-component-name="ReviewStatsContextualized"]');if(m){const a=m.querySelector("span.font-weight-bold");if(s=(g=a==null?void 0:a.textContent)==null?void 0:g.trim(),!s){const E=(((x=m.querySelector("p.visually-hidden"))==null?void 0:x.textContent)||"").match(/Rating\s+(\d+(?:\.\d+)?)\s+out\s+of/i);E&&(s=E[1])}const f=m.querySelector("span.c-reviews"),z=(((b=f==null?void 0:f.textContent)==null?void 0:b.trim())||"").match(/(\d+)\s*review/i);if(z&&(d=z[1]),!d){const E=(((A=m.querySelector("p.visually-hidden"))==null?void 0:A.textContent)||"").match(/(\d+)\s+review/i);E&&(d=E[1])}}s||(s=h([".c-review-average",".ugc-c-review-average","[data-automation=overall-rating]"])),d||(d=h([".c-review-count",".ugc-c-review-count","[data-automation=review-count]"]));const u=ce();return t=t||(u==null?void 0:u.Brand)||(u==null?void 0:u["Brand Name"]),i=i||(u==null?void 0:u.Model)||(u==null?void 0:u["Model Number"]),{title:e,brand:t,model:i,price:o!==void 0?{value:o,currency:c}:void 0,rating:H(s),review_count:M(d),key_specs:u,visible_reviews:O(["[data-component-name=CustomerReviewListSection] #review-list li p","#review-list li p","[data-testid=enhanced-review-content]","[data-testid=review-card]",".ugc-review-body",".review-text",".review-item"]),shipping_returns:le()}},pe=()=>{const e={};["[data-testid=specifications-section]","[data-testid=product-specifications]","#product-specifications","#specifications"].forEach(i=>{const r=document.querySelector(i);r&&$(r,e)});const n=V();return n&&Object.entries(n).forEach(([i,r])=>{e[i]||(e[i]=r)}),Object.keys(e).length>0?e:void 0},ue=()=>{var s,d,m;const e=document.querySelector("#fulfillment-Shipping-content");if(!e)return;const t=[],n=e.querySelector('[data-seo-id="fulfillment-shipping-intent"]'),i=(s=n==null?void 0:n.textContent)==null?void 0:s.trim();i&&t.push(i);const r=n==null?void 0:n.nextElementSibling,l=(d=r==null?void 0:r.textContent)==null?void 0:d.trim();l&&l!==i&&t.push(l);const o=e.querySelector(".f7.b.green, .f7.b"),c=(m=o==null?void 0:o.textContent)==null?void 0:m.trim();return c&&t.push(c),t.length>0?t.join(" - "):void 0},me=()=>{const e=[];return document.querySelectorAll('[data-testid="enhanced-review-content"]').forEach(n=>{var c,s;if(e.length>=5)return;const i=n.querySelector("h3"),r=((c=i==null?void 0:i.textContent)==null?void 0:c.trim())||"",l=n.querySelector('p[tabindex="-1"]'),o=((s=l==null?void 0:l.textContent)==null?void 0:s.trim())||"";if(o&&o.length>20){const d=r?`${r}. ${o}`:o;e.push(d.replace(/\s+/g," "))}}),e.length>0?e:void 0},fe=()=>{var m,u,y;const e=h(["[data-testid=product-title]","h1","[itemprop=name]"]),t=h(["[data-testid=brand-name]","[itemprop=brand]","a[data-testid=brand-name]","[data-automation-id=brand-name]"]),n=h(["[data-testid=price-wrap] [itemprop=price]","[data-testid=price-wrap]","[data-testid=price]","[itemprop=price]","[data-automation-id=product-price]"])??k(["product:price:amount","price","og:price:amount"]),i=M(n),r=k(["product:price:currency","price:currency"])||j(n,"USD"),l=document.querySelector('[data-testid="reviews-and-ratings"]');let o,c;if(l){const S=l.querySelector("span.w_iUH7");if(S){const g=((m=S.textContent)==null?void 0:m.trim())||"",x=g.match(/(\d+\.?\d*)\s*stars?/i);x&&(o=x[1]);const b=g.match(/(\d+(?:,\d+)?)\s*reviews?/i);b&&(c=b[1])}if(!o){const g=l.querySelector("span.f7"),b=(((u=g==null?void 0:g.textContent)==null?void 0:u.trim())||"").match(/\((\d+\.?\d*)\)/);b&&(o=b[1])}if(!c){const g=l.querySelector('[itemprop="ratingCount"]'),b=(((y=g==null?void 0:g.textContent)==null?void 0:y.trim())||"").match(/(\d+(?:,\d+)?)/);b&&(c=b[1])}}o||(o=h(["[data-testid=reviews-rating]","[itemprop=ratingValue]",".stars-container"])),c||(c=h(["[data-testid=reviews-header]","[data-testid=reviews-count]","[itemprop=reviewCount]",".stars-reviews-count"]));const s=pe(),d=(s==null?void 0:s.Model)||(s==null?void 0:s["Model Number"]);return{title:e,brand:t,model:d,price:i!==void 0?{value:i,currency:r}:void 0,rating:H(o),review_count:M(c),key_specs:s,visible_reviews:me()||O(["[data-testid=review-card]","[data-testid=review-text]","[data-testid=review-body]",".review-text",".prod-ProductReview",".review-body","[data-automation-id=review-text]","section[data-testid=reviews-section] [data-testid=review-card]"]),shipping_returns:ue()}},he=e=>{const t=e.toLowerCase();return t.includes("amazon.")?ae:t.includes("walmart.")?fe:t.endsWith("bestbuy.com")?de:null},ye=(e,t)=>{var i;const n={...e.key_specs??{},...t.key_specs??{}};return{page_url:location.href,store_domain:location.host,title:t.title??e.title,brand:t.brand??e.brand,model:t.model??e.model,price:t.price??e.price,rating:t.rating??e.rating,review_count:t.review_count??e.review_count,key_specs:Object.keys(n).length>0?n:void 0,visible_reviews:(i=t.visible_reviews)!=null&&i.length?t.visible_reviews:e.visible_reviews,shipping_returns:t.shipping_returns??e.shipping_returns}},be=()=>{const e=ne(),t=he(location.host),n=t?t():{};return ye(e,n)};function ge(e){if(!e||typeof e!="string")return"";const t=o=>o.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),n=[],i=/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;let r=0,l;for(;(l=i.exec(e))!==null;)n.push(t(e.slice(r,l.index)).replace(/\n/g,"<br>").replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>")),n.push(`<a href="${t(l[2])}" target="_blank" rel="noreferrer noopener">${t(l[1])}</a>`),r=i.lastIndex;return n.push(t(e.slice(r)).replace(/\n/g,"<br>").replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>")),n.join("")}const X="shopsense-sidebar";let K=null,P=null,Y=null,W=null,B=null,q=null,F=null,L=null,p=null;const xe=async()=>{try{const e=await chrome.runtime.sendMessage({type:"GET_TAB_ID"});if(typeof(e==null?void 0:e.tabId)=="number")return e.tabId}catch{}return null},I=e=>{if(!Y||!P)return;Y.textContent=e,P.classList.remove("busy","error");const t=e.toLowerCase();t.includes("fail")||t.includes("error")?P.classList.add("error"):(t.includes("analyz")||t.includes("send"))&&P.classList.add("busy")},D=e=>{if(!F||!L)return;F.style.display=e?"block":"none",L.style.display=e?"block":"none",q&&(q.disabled=!e,e||(q.value=""));const t=L.querySelector("button[type='submit']");t&&(t.disabled=!e)},ve=(e,t)=>{var i,r,l;e.innerHTML="";const n=document.createElement("p");if(n.textContent=t.summary??"No summary available.",e.appendChild(n),t.price){const o=document.createElement("div");o.className="meta-row",o.textContent=`Price: ${t.price.value} ${t.price.currency}`,e.appendChild(o)}if(t.rating!==void 0){const o=document.createElement("div");o.className="meta-row",o.textContent=`Rating: ${t.rating}`,e.appendChild(o)}if(t.review_count!==void 0){const o=document.createElement("div");o.className="meta-row",o.textContent=`Reviews: ${t.review_count}`,e.appendChild(o)}if((i=t.key_points)!=null&&i.length){const o=document.createElement("ul");t.key_points.forEach(c=>{const s=document.createElement("li");s.textContent=c,o.appendChild(s)}),e.appendChild(o)}if(t.specs&&Object.keys(t.specs).length>0){const o=document.createElement("div");o.className="specs",Object.entries(t.specs).forEach(([c,s])=>{const d=document.createElement("div");d.className="spec-row",d.textContent=`${c}: ${s}`,o.appendChild(d)}),e.appendChild(o)}if((r=t.citations)!=null&&r.length){const o=document.createElement("div");o.className="citations",t.citations.forEach(c=>{const s=document.createElement("a");s.href=c.url,s.target="_blank",s.rel="noreferrer",s.textContent=c.title??c.url,o.appendChild(s)}),e.appendChild(o)}if((l=t.suggested_questions)!=null&&l.length){const o=document.createElement("div");o.className="suggested-questions",t.suggested_questions.forEach(c=>{const s=document.createElement("button");s.type="button",s.className="suggested-question-btn",s.textContent=c,s.style.display="block",s.style.width="100%",s.style.textAlign="left",s.style.padding="0.5rem 0.75rem",s.style.marginBottom="0.35rem",s.style.cursor="pointer",s.style.border="1px solid #e0e0e0",s.style.borderRadius="4px",s.style.background="#f5f5f5",s.style.fontSize="0.9rem",s.addEventListener("click",()=>{D(!0),B&&Q(B,{role:"user",content:c}),chrome.runtime.sendMessage({type:"CHAT_SEND",question:c})}),o.appendChild(s)}),e.appendChild(o)}},Q=(e,t)=>{var r;const n=document.createElement("div");n.className=`chat-message ${t.role}`;const i=document.createElement("div");if(i.className="chat-text",i.innerHTML=ge(t.content),n.appendChild(i),(r=t.citations)!=null&&r.length){const l=document.createElement("div");l.className="chat-citations",t.citations.forEach(o=>{const c=document.createElement("a");c.href=o.url,c.target="_blank",c.rel="noreferrer",c.textContent=o.title??o.url,l.appendChild(c)}),n.appendChild(l)}e.appendChild(n),e.scrollTop=e.scrollHeight},te=()=>{if(p)return;const e=document.getElementById(X);if(e){p=e;return}const t=document.createElement("div");t.id=X,t.style.position="fixed",t.style.top="16px",t.style.right="16px",t.style.left="auto",t.style.bottom="auto",t.style.margin="0",t.style.transform="none",t.style.width="340px",t.style.height="calc(100vh - 32px)",t.style.zIndex="2147483647",t.style.display="none";const n=t.attachShadow({mode:"open"});n.innerHTML=`
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
          <section id="ss-chat-section" class="panel" style="display: none;">
            <h2>Chat</h2>
            <div id="ss-chat" class="chat-log"></div>
          </section>
        </div>
        <form id="ss-chat-form" class="chat-input" style="display: none;">
          <textarea id="ss-chat-input" rows="2" placeholder="Ask about this product..."></textarea>
          <button class="btn btn-primary" type="submit">Send</button>
        </form>
      </div>
    </div>
  `,document.documentElement.appendChild(t),p=t,P=n.querySelector("#ss-status-dot"),Y=n.querySelector("#ss-status-text"),W=n.querySelector("#ss-analyze"),B=n.querySelector("#ss-chat"),q=n.querySelector("#ss-chat-input"),F=n.querySelector("#ss-chat-section");const i=n.querySelector("#ss-auth-container"),r=n.querySelector("#ss-main-content"),l=n.querySelector("#ss-analyze-btn");L=n.querySelector("#ss-chat-form");const o=n.querySelector("#ss-settings-btn"),c=n.querySelector("#ss-minimize-btn"),s=n.querySelector("#ss-sidebar");D(!1);const d=async()=>{try{const a=await chrome.runtime.sendMessage({type:"CHECK_AUTH"});if(a!=null&&a.isAuthenticated){const f=await chrome.runtime.sendMessage({type:"CHECK_PREFERENCES"});f!=null&&f.hasPreferences?y():u()}else m()}catch(a){console.error("Auth check failed:",a),m()}},m=()=>{i.style.display="flex",r.style.display="none",i.innerHTML=`
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
    `;let a="login";const f=i.querySelector('[data-mode="login"]'),C=i.querySelector('[data-mode="signup"]'),z=i.querySelector("#ss-auth-form"),v=i.querySelector("#ss-auth-email"),E=i.querySelector("#ss-auth-password"),w=i.querySelector("#ss-auth-error"),T=i.querySelector("#ss-auth-submit"),N=_=>{a=_,f.classList.toggle("active",_==="login"),C.classList.toggle("active",_==="signup"),T.textContent=_==="login"?"Sign In":"Sign Up",w.style.display="none"};f.addEventListener("click",()=>N("login")),C.addEventListener("click",()=>N("signup")),z.addEventListener("submit",async _=>{_.preventDefault(),w.style.display="none";const Z=v.value.trim(),J=E.value;if(!Z||!J){w.textContent="Please enter email and password.",w.style.display="block";return}T.disabled=!0,T.textContent=a==="login"?"Signing in...":"Signing up...";try{const R=await chrome.runtime.sendMessage({type:a==="login"?"SIGN_IN":"SIGN_UP",email:Z,password:J});if(R!=null&&R.error)w.textContent=R.error,w.style.display="block";else{const U=await chrome.runtime.sendMessage({type:"CHECK_PREFERENCES"});U!=null&&U.hasPreferences?y():u()}}catch(R){w.textContent=R.message||"An error occurred.",w.style.display="block"}finally{T.disabled=!1,T.textContent=a==="login"?"Sign In":"Sign Up"}})},u=async()=>{i.style.display="flex",r.style.display="none";let a=null;try{const v=await chrome.runtime.sendMessage({type:"GET_PREFERENCES"});a=(v==null?void 0:v.preferences)||null}catch(v){console.error("Failed to load preferences:",v)}i.innerHTML=`
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
    `;const f=i.querySelector("#ss-preferences-form"),C=i.querySelector("#ss-pref-error"),z=i.querySelector("#ss-pref-submit");if(a){const v=i.querySelector("#ss-pref-price"),E=i.querySelector("#ss-pref-quality"),w=i.querySelector("#ss-pref-brand"),T=i.querySelector("#ss-pref-sustainability"),N=i.querySelector("#ss-pref-reviews"),_=i.querySelector("#ss-pref-innovation");v&&a.price&&(v.value=a.price),E&&a.quality&&(E.value=a.quality),w&&a.brand&&(w.value=a.brand),T&&a.sustainability&&(T.value=a.sustainability),N&&a.reviews&&(N.value=a.reviews),_&&a.innovation&&(_.value=a.innovation)}f.addEventListener("submit",async v=>{v.preventDefault(),C.style.display="none";const E={price:i.querySelector("#ss-pref-price").value||null,quality:i.querySelector("#ss-pref-quality").value||null,brand:i.querySelector("#ss-pref-brand").value||null,sustainability:i.querySelector("#ss-pref-sustainability").value||null,reviews:i.querySelector("#ss-pref-reviews").value||null,innovation:i.querySelector("#ss-pref-innovation").value||null};z.disabled=!0,z.textContent="Saving...";try{const w=await chrome.runtime.sendMessage({type:"SAVE_PREFERENCES",preferences:E});w!=null&&w.error?(C.textContent=w.error,C.style.display="block"):y()}catch(w){C.textContent=w.message||"An error occurred.",C.style.display="block"}finally{z.disabled=!1,z.textContent="Save Preferences"}})},y=()=>{i.style.display="none",r.style.display="flex",D(!1)};l.addEventListener("click",async()=>{I("Analyzing..."),await chrome.runtime.sendMessage({type:"ANALYZE_CLICK"})}),L.addEventListener("submit",async a=>{a.preventDefault();const f=(q==null?void 0:q.value.trim())??"";!f||!B||(Q(B,{role:"user",content:f}),q&&(q.value=""),await chrome.runtime.sendMessage({type:"CHAT_SEND",question:f}))}),q==null||q.addEventListener("keydown",a=>{a.isComposing||a.key==="Enter"&&!a.shiftKey&&(a.preventDefault(),L==null||L.requestSubmit())}),o.addEventListener("click",()=>{u()});let S=!1;const g=n.querySelector("#ss-minimized-icon"),x=n.querySelector("#ss-close-mini"),b=n.querySelector("#ss-more-options-mini"),A=()=>{if(S=!S,S){if(s.classList.add("minimized"),c.title="Expand",p){const a=p.style.top||window.getComputedStyle(p).top||"16px";p.style.position="fixed",p.style.top=a,p.style.right="16px",p.style.left="auto",p.style.bottom="auto",p.style.width="80px",p.style.height="80px",p.style.margin="0",p.style.transform="none"}}else if(s.classList.remove("minimized"),c.title="Minimize",p){const a=p.style.top||window.getComputedStyle(p).top||"16px";p.style.position="fixed",p.style.top=a,p.style.right="16px",p.style.left="auto",p.style.bottom="auto",p.style.width="340px",p.style.height="calc(100vh - 32px)",p.style.margin="0",p.style.transform="none"}};c.addEventListener("click",a=>{a.stopPropagation(),A()}),g.addEventListener("click",a=>{a.stopPropagation(),S&&A()}),x.addEventListener("click",a=>{a.stopPropagation(),p&&(p.style.display="none")}),b.addEventListener("click",a=>{a.stopPropagation(),u()}),d()},we=()=>{te(),p&&(p.style.display="block")},Se=()=>{if(te(),!p)return;const e=p.style.display==="none";p.style.display=e?"block":"none"},Ce=()=>{const e=be();return console.log("[ShopSense] extracted",e),e};chrome.runtime.onMessage.addListener((e,t,n)=>{if(e.type==="EXTRACT_REQUEST")return n(Ce()),!0;const i="tabId"in e?e.tabId:void 0;return i!=null&&K!=null&&i!==K?!1:e.type==="TOGGLE_SIDEBAR"?(Se(),!0):(we(),e.type==="STATUS"||e.type==="ERROR"?(I(e.message),!0):e.type==="ANALYZE_RESULT"&&W?(ve(W,e.result),I("Analyze completed"),D(!0),!0):e.type==="CHAT_RESPONSE"&&B?(Q(B,e.message),I("Chat ready"),!0):!1)});const ke=async()=>{K=await xe()};ke();
