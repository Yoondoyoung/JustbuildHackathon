const y=(e,t=document)=>{var n;for(const i of e){const s=t.querySelector(i),l=(n=s==null?void 0:s.textContent)==null?void 0:n.trim();if(l)return l}},k=e=>{var t;for(const n of e){const i=document.querySelector(`meta[name="${n}"], meta[property="${n}"]`),s=(t=i==null?void 0:i.getAttribute("content"))==null?void 0:t.trim();if(s)return s}},M=e=>{if(!e)return;const t=e.replace(/[^0-9.]/g,""),n=Number(t);return Number.isFinite(n)?n:void 0},D=e=>{if(!e)return;const t=e.replace(/,/g,"").match(/(\d+(\.\d+)?)/);return t?M(t[1]):void 0},H=(e,t="USD")=>e?e.includes("£")?"GBP":e.includes("€")?"EUR":e.includes("¥")?"JPY":e.includes("₩")?"KRW":e.includes("$")?"USD":t:t,Z=e=>e.replace(/[:：]\s*$/,"").trim(),U=(e,t,n)=>{const i=t?Z(t):"",s=(n==null?void 0:n.trim())??"";!i||!s||e[i]||(e[i]=s)},j=(e,t)=>{e.querySelectorAll("table").forEach(n=>{n.querySelectorAll("tr").forEach(i=>{var s,l;U(t,(s=i.querySelector("th"))==null?void 0:s.textContent,(l=i.querySelector("td"))==null?void 0:l.textContent)})}),e.querySelectorAll("dl").forEach(n=>{Array.from(n.querySelectorAll("dt")).forEach(s=>{var l;U(t,s.textContent,(l=s.nextElementSibling)==null?void 0:l.textContent)})}),e.querySelectorAll("li").forEach(n=>{const i=n.querySelector("span.a-text-bold, strong, b");if(!i)return;const s=i.textContent??"",l=Z(s);if(!l)return;const a=(n.textContent??"").replace(s,"").replace(/^[\s:-]+/,"").trim();U(t,l,a)})},V=(e=document)=>{const t={};return j(e,t),Object.keys(t).length>0?t:void 0},ee=["[itemprop=review]","[data-hook=review]",".review",".reviews-list .review-item","[data-testid=review-card]",".ugc-review-body"],$=(e=ee,t=document)=>{const n=[];return t.querySelectorAll(e.join(",")).forEach(i=>{var l;if(n.length>=5)return;const s=(l=i.textContent)==null?void 0:l.trim();s&&s.length>20&&n.push(s.replace(/\s+/g," "))}),n.length>0?n:void 0},te=()=>{var r;const e=k(["og:title","twitter:title"])||y(["h1","[itemprop=name]","[data-test=product-title]"])||document.title,t=k(["product:brand","og:brand"])||y(["[itemprop=brand]","[data-brand]",".brand",".product-brand"]),n=k(["product:mpn","product:model"])||y(["[itemprop=mpn]","[data-model]"]),i=k(["product:price:amount","price","og:price:amount"])||y(["[itemprop=price]","[data-test=product-price]",".price"]),s=k(["product:price:currency","price:currency"])||((r=document.querySelector("[itemprop=priceCurrency]"))==null?void 0:r.getAttribute("content"))||H(i,"USD"),l=k(["rating","ratingValue"])||y(["[itemprop=ratingValue]","[data-test=rating]",".rating"]),o=k(["reviewCount"])||y(["[itemprop=reviewCount]","[data-hook=total-review-count]",".review-count"]),a=M(i);return{title:e,brand:t,model:n,price:a!==void 0?{value:a,currency:s}:void 0,rating:D(l),review_count:M(o),key_specs:V(),visible_reviews:$()}},ie=e=>e&&e.replace(/^Brand:\s*/i,"").replace(/^Visit the\s*/i,"").replace(/\s*Store$/i,"").trim()||void 0,ne=()=>{const e={};["#productDetails_techSpec_section_1","#productDetails_detailBullets_sections1","#technicalSpecifications_feature_div","#detailBullets_feature_div","#detailBulletsWrapper_feature_div","#prodDetails"].forEach(i=>{const s=document.querySelector(i);s&&j(s,e)});const n=V();return n&&Object.entries(n).forEach(([i,s])=>{e[i]||(e[i]=s)}),Object.keys(e).length>0?e:void 0},oe=()=>y(["#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE","#mir-layout-DELIVERY_BLOCK-slot-DELIVERY_MESSAGE","#deliveryMessageMirId","#deliveryMessage","#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_SMALL"]),re=()=>{const e=y(["#productTitle","h1#title"]),t=document.querySelector("#bylineInfo"),n=ie((t==null?void 0:t.getAttribute("aria-label"))??(t==null?void 0:t.textContent)??""),i=y(["#corePrice_feature_div .a-offscreen","#apex_desktop .a-price .a-offscreen","#priceblock_ourprice","#priceblock_dealprice","#priceblock_saleprice"])??k(["product:price:amount","price","og:price:amount"]),s=M(i),l=k(["product:price:currency","price:currency"])||H(i,"USD"),o=document.querySelector("#acrPopover"),a=(o==null?void 0:o.getAttribute("title"))||(o==null?void 0:o.textContent)||y(["#averageCustomerReviews .a-icon-alt","span[data-hook=rating-out-of-text]"]),r=y(["#acrCustomerReviewText","span[data-hook=total-review-count]"]),d=ne(),m=(d==null?void 0:d["Item model number"])||(d==null?void 0:d.Model)||y(["[itemprop=mpn]"]);return{title:e,brand:n,model:m,price:s!==void 0?{value:s,currency:l}:void 0,rating:D(a),review_count:M(r),key_specs:d,visible_reviews:$(["[data-hook=review-body]",".review-text","[data-hook=review]"]),shipping_returns:oe()}},se=()=>{var o;const e={},t=document.querySelector('[data-testid="brix-sheet"]');t&&t.querySelectorAll('div.inline-flex.w-full, div[class*="inline-flex"][class*="w-full"], div[class*="dB7j8sHUbncyf79K"]').forEach(r=>{var u,f;const d=r.querySelector('div.font-weight-medium, div[class*="font-weight-medium"]'),m=r.querySelector('div[class*="pl-300"], div.grow.basis-none[class*="pl-300"]');if(d&&m){const C=d.cloneNode(!0);C.querySelectorAll("button").forEach(T=>T.remove());let v=((u=C.textContent)==null?void 0:u.trim())||"";const b=((f=m.textContent)==null?void 0:f.trim())||"";v=v.replace(/\s+/g," ").trim(),v&&b&&v.length>0&&b.length>0&&(e[v]=b)}});const n=document.querySelectorAll("h2.h5");let i=null;for(const a of Array.from(n))if(((o=a.textContent)==null?void 0:o.trim())==="Highlights"){i=a;break}if(i){const a=i.parentElement;a&&a.querySelectorAll("button.c-button-unstyled").forEach(d=>{var u,f,C;const m=d.querySelector("div.flex.flex-column");if(m){const h=m.querySelector("div:first-child"),v=m.querySelector('div.font-500, div[class*="font-500"]');if(h&&v){const b=h.cloneNode(!0);b.querySelectorAll("svg").forEach(q=>q.remove());let g=((u=b.textContent)==null?void 0:u.trim())||"",c=((f=v.textContent)==null?void 0:f.trim())||"";const x=v.cloneNode(!0);x.querySelectorAll("svg").forEach(q=>q.remove()),c=((C=x.textContent)==null?void 0:C.trim())||"",g=g.replace(/\s+/g," ").trim(),c=c.replace(/\s+/g," ").trim(),g&&c&&g.length>0&&c.length>0&&(e[g]||(e[g]=c))}}})}["#specifications",".specifications",".specification-table",".product-data"].forEach(a=>{const r=document.querySelector(a);r&&j(r,e)});const l=V();return l&&Object.entries(l).forEach(([a,r])=>{e[a]||(e[a]=r)}),Object.keys(e).length>0?e:void 0},ae=()=>{var o,a,r,d;const e=document.querySelector('[data-component-name="FulfillmentSelector"]');if(!e)return y([".fulfillment-additional-info",".availabilityMessage",".fulfillment-fulfillment-summary"]);const t=[],n=e.querySelector('button[data-test-id="pickup"]');if(n){const u=(n.getAttribute("aria-label")||"").match(/(?:Ready on|Pickup)\s+([^,]+,\s*[^,]+)/i);if(u)t.push(`Pickup: ${u[1]}`);else{const f=(a=(o=n.querySelector("strong"))==null?void 0:o.textContent)==null?void 0:a.trim();f&&t.push(`Pickup: ${f}`)}}const i=e.querySelector('button[data-test-id="shipping"]');if(i){const u=(i.getAttribute("aria-label")||"").match(/(?:Get it by|Shipping)\s+([^,]+,\s*[^,]+)/i);if(u)t.push(`Shipping: ${u[1]}`);else{const f=(d=(r=i.querySelector("strong"))==null?void 0:r.textContent)==null?void 0:d.trim();f&&t.push(`Shipping: ${f}`)}}const l=(e.textContent||"").match(/Order now for pickup on ([^a]+) at\s+([^<]+)/i);return l&&t.push(`Pickup location: ${l[2].trim()}`),t.length>0?t.join(" - "):void 0},ce=()=>{var f,C,h,v,b,T;const e=y([".sku-title h1","h1.sku-title","h1"]);let t;const n=document.querySelector('[data-component-name="ProductHeader"]');if(n){const g=n.querySelector(".description a");t=(f=g==null?void 0:g.textContent)==null?void 0:f.trim()}let i;if(n){const g=n.querySelector(".disclaimer");if(g){const x=(g.textContent||"").match(/Model:\s*([^\s]+)/i);x&&(i=x[1])}}let s;const l=document.querySelector('[data-testid="price-block-customer-price"]');l&&(s=(C=l.textContent)==null?void 0:C.trim()),s||(s=y([".priceView-hero-price span",".priceView-customer-price span","[data-testid=customer-price]",".pricing-price__regular-price"])??k(["product:price:amount","price","og:price:amount"]));const o=M(s),a=k(["product:price:currency","price:currency"])||H(s,"USD");let r,d;const m=document.querySelector('[data-component-name="ReviewStatsContextualized"]');if(m){const g=m.querySelector("span.font-weight-bold");if(r=(h=g==null?void 0:g.textContent)==null?void 0:h.trim(),!r){const w=(((v=m.querySelector("p.visually-hidden"))==null?void 0:v.textContent)||"").match(/Rating\s+(\d+(?:\.\d+)?)\s+out\s+of/i);w&&(r=w[1])}const c=m.querySelector("span.c-reviews"),E=(((b=c==null?void 0:c.textContent)==null?void 0:b.trim())||"").match(/(\d+)\s*review/i);if(E&&(d=E[1]),!d){const w=(((T=m.querySelector("p.visually-hidden"))==null?void 0:T.textContent)||"").match(/(\d+)\s+review/i);w&&(d=w[1])}}r||(r=y([".c-review-average",".ugc-c-review-average","[data-automation=overall-rating]"])),d||(d=y([".c-review-count",".ugc-c-review-count","[data-automation=review-count]"]));const u=se();return t=t||(u==null?void 0:u.Brand)||(u==null?void 0:u["Brand Name"]),i=i||(u==null?void 0:u.Model)||(u==null?void 0:u["Model Number"]),{title:e,brand:t,model:i,price:o!==void 0?{value:o,currency:a}:void 0,rating:D(r),review_count:M(d),key_specs:u,visible_reviews:$(["[data-component-name=CustomerReviewListSection] #review-list li p","#review-list li p","[data-testid=enhanced-review-content]","[data-testid=review-card]",".ugc-review-body",".review-text",".review-item"]),shipping_returns:ae()}},le=()=>{const e={};["[data-testid=specifications-section]","[data-testid=product-specifications]","#product-specifications","#specifications"].forEach(i=>{const s=document.querySelector(i);s&&j(s,e)});const n=V();return n&&Object.entries(n).forEach(([i,s])=>{e[i]||(e[i]=s)}),Object.keys(e).length>0?e:void 0},de=()=>{var r,d,m;const e=document.querySelector("#fulfillment-Shipping-content");if(!e)return;const t=[],n=e.querySelector('[data-seo-id="fulfillment-shipping-intent"]'),i=(r=n==null?void 0:n.textContent)==null?void 0:r.trim();i&&t.push(i);const s=n==null?void 0:n.nextElementSibling,l=(d=s==null?void 0:s.textContent)==null?void 0:d.trim();l&&l!==i&&t.push(l);const o=e.querySelector(".f7.b.green, .f7.b"),a=(m=o==null?void 0:o.textContent)==null?void 0:m.trim();return a&&t.push(a),t.length>0?t.join(" - "):void 0},pe=()=>{const e=[];return document.querySelectorAll('[data-testid="enhanced-review-content"]').forEach(n=>{var a,r;if(e.length>=5)return;const i=n.querySelector("h3"),s=((a=i==null?void 0:i.textContent)==null?void 0:a.trim())||"",l=n.querySelector('p[tabindex="-1"]'),o=((r=l==null?void 0:l.textContent)==null?void 0:r.trim())||"";if(o&&o.length>20){const d=s?`${s}. ${o}`:o;e.push(d.replace(/\s+/g," "))}}),e.length>0?e:void 0},ue=()=>{var m,u,f;const e=y(["[data-testid=product-title]","h1","[itemprop=name]"]),t=y(["[data-testid=brand-name]","[itemprop=brand]","a[data-testid=brand-name]","[data-automation-id=brand-name]"]),n=y(["[data-testid=price-wrap] [itemprop=price]","[data-testid=price-wrap]","[data-testid=price]","[itemprop=price]","[data-automation-id=product-price]"])??k(["product:price:amount","price","og:price:amount"]),i=M(n),s=k(["product:price:currency","price:currency"])||H(n,"USD"),l=document.querySelector('[data-testid="reviews-and-ratings"]');let o,a;if(l){const C=l.querySelector("span.w_iUH7");if(C){const h=((m=C.textContent)==null?void 0:m.trim())||"",v=h.match(/(\d+\.?\d*)\s*stars?/i);v&&(o=v[1]);const b=h.match(/(\d+(?:,\d+)?)\s*reviews?/i);b&&(a=b[1])}if(!o){const h=l.querySelector("span.f7"),b=(((u=h==null?void 0:h.textContent)==null?void 0:u.trim())||"").match(/\((\d+\.?\d*)\)/);b&&(o=b[1])}if(!a){const h=l.querySelector('[itemprop="ratingCount"]'),b=(((f=h==null?void 0:h.textContent)==null?void 0:f.trim())||"").match(/(\d+(?:,\d+)?)/);b&&(a=b[1])}}o||(o=y(["[data-testid=reviews-rating]","[itemprop=ratingValue]",".stars-container"])),a||(a=y(["[data-testid=reviews-header]","[data-testid=reviews-count]","[itemprop=reviewCount]",".stars-reviews-count"]));const r=le(),d=(r==null?void 0:r.Model)||(r==null?void 0:r["Model Number"]);return{title:e,brand:t,model:d,price:i!==void 0?{value:i,currency:s}:void 0,rating:D(o),review_count:M(a),key_specs:r,visible_reviews:pe()||$(["[data-testid=review-card]","[data-testid=review-text]","[data-testid=review-body]",".review-text",".prod-ProductReview",".review-body","[data-automation-id=review-text]","section[data-testid=reviews-section] [data-testid=review-card]"]),shipping_returns:de()}},me=e=>{const t=e.toLowerCase();return t.includes("amazon.")?re:t.includes("walmart.")?ue:t.endsWith("bestbuy.com")?ce:null},fe=(e,t)=>{var i;const n={...e.key_specs??{},...t.key_specs??{}};return{page_url:location.href,store_domain:location.host,title:t.title??e.title,brand:t.brand??e.brand,model:t.model??e.model,price:t.price??e.price,rating:t.rating??e.rating,review_count:t.review_count??e.review_count,key_specs:Object.keys(n).length>0?n:void 0,visible_reviews:(i=t.visible_reviews)!=null&&i.length?t.visible_reviews:e.visible_reviews,shipping_returns:t.shipping_returns??e.shipping_returns}},he=()=>{const e=te(),t=me(location.host),n=t?t():{};return fe(e,n)},Q="shopsense-sidebar";let G=null,R=null,K=null,Y=null,I=null,_=null,p=null;const ye=async()=>{try{const e=await chrome.runtime.sendMessage({type:"GET_TAB_ID"});if(typeof(e==null?void 0:e.tabId)=="number")return e.tabId}catch{}return null},P=e=>{if(!K||!R)return;K.textContent=e,R.classList.remove("busy","error");const t=e.toLowerCase();t.includes("fail")||t.includes("error")?R.classList.add("error"):(t.includes("analyz")||t.includes("send"))&&R.classList.add("busy")},be=(e,t)=>{var i,s,l;e.innerHTML="";const n=document.createElement("p");if(n.textContent=t.summary??"No summary available.",e.appendChild(n),t.price){const o=document.createElement("div");o.className="meta-row",o.textContent=`Price: ${t.price.value} ${t.price.currency}`,e.appendChild(o)}if(t.rating!==void 0){const o=document.createElement("div");o.className="meta-row",o.textContent=`Rating: ${t.rating}`,e.appendChild(o)}if(t.review_count!==void 0){const o=document.createElement("div");o.className="meta-row",o.textContent=`Reviews: ${t.review_count}`,e.appendChild(o)}if((i=t.key_points)!=null&&i.length){const o=document.createElement("ul");t.key_points.forEach(a=>{const r=document.createElement("li");r.textContent=a,o.appendChild(r)}),e.appendChild(o)}if(t.specs&&Object.keys(t.specs).length>0){const o=document.createElement("div");o.className="specs",Object.entries(t.specs).forEach(([a,r])=>{const d=document.createElement("div");d.className="spec-row",d.textContent=`${a}: ${r}`,o.appendChild(d)}),e.appendChild(o)}if((s=t.citations)!=null&&s.length){const o=document.createElement("div");o.className="citations",t.citations.forEach(a=>{const r=document.createElement("a");r.href=a.url,r.target="_blank",r.rel="noreferrer",r.textContent=a.title??a.url,o.appendChild(r)}),e.appendChild(o)}if((l=t.suggested_questions)!=null&&l.length){const o=document.createElement("div");o.className="suggested-questions",t.suggested_questions.forEach(a=>{const r=document.createElement("button");r.type="button",r.className="suggested-question-btn",r.textContent=a,r.style.display="block",r.style.width="100%",r.style.textAlign="left",r.style.padding="0.5rem 0.75rem",r.style.marginBottom="0.35rem",r.style.cursor="pointer",r.style.border="1px solid #e0e0e0",r.style.borderRadius="4px",r.style.background="#f5f5f5",r.style.fontSize="0.9rem",r.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"CHAT_SEND",question:a})}),o.appendChild(r)}),e.appendChild(o)}},J=(e,t)=>{var s;const n=document.createElement("div");n.className=`chat-message ${t.role}`;const i=document.createElement("div");if(i.className="chat-text",i.textContent=t.content,n.appendChild(i),(s=t.citations)!=null&&s.length){const l=document.createElement("div");l.className="chat-citations",t.citations.forEach(o=>{const a=document.createElement("a");a.href=o.url,a.target="_blank",a.rel="noreferrer",a.textContent=o.title??o.url,l.appendChild(a)}),n.appendChild(l)}e.appendChild(n),e.scrollTop=e.scrollHeight},X=()=>{if(p)return;const e=document.getElementById(Q);if(e){p=e;return}const t=document.createElement("div");t.id=Q,t.style.position="fixed",t.style.top="16px",t.style.right="16px",t.style.left="auto",t.style.bottom="auto",t.style.margin="0",t.style.transform="none",t.style.width="340px",t.style.height="calc(100vh - 32px)",t.style.zIndex="2147483647",t.style.display="none";const n=t.attachShadow({mode:"open"});n.innerHTML=`
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
      .chat-log { max-height: 220px; overflow-y: auto; font-size: 13px; }
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
          <button id="ss-analyze" class="btn btn-secondary" type="button">Analyze Page</button>
        </div>
        <div class="content">
          <section id="ss-analyze" class="panel"></section>
          <section class="panel">
            <h2>Chat</h2>
            <div id="ss-chat" class="chat-log"></div>
          </section>
        </div>
        <form id="ss-chat-form" class="chat-input">
          <textarea id="ss-chat-input" rows="2" placeholder="Ask about this product..."></textarea>
          <button class="btn btn-primary" type="submit">Send</button>
        </form>
      </div>
    </div>
  `,document.documentElement.appendChild(t),p=t,R=n.querySelector("#ss-status-dot"),K=n.querySelector("#ss-status-text"),Y=n.querySelector("#ss-analyze"),I=n.querySelector("#ss-chat"),_=n.querySelector("#ss-chat-input");const i=n.querySelector("#ss-auth-container"),s=n.querySelector("#ss-main-content"),l=n.querySelector("button#ss-analyze"),o=n.querySelector("#ss-chat-form"),a=n.querySelector("#ss-settings-btn"),r=n.querySelector("#ss-minimize-btn"),d=n.querySelector("#ss-sidebar"),m=async()=>{try{const c=await chrome.runtime.sendMessage({type:"CHECK_AUTH"});if(c!=null&&c.isAuthenticated){const x=await chrome.runtime.sendMessage({type:"CHECK_PREFERENCES"});x!=null&&x.hasPreferences?C():f()}else u()}catch(c){console.error("Auth check failed:",c),u()}},u=()=>{i.style.display="flex",s.style.display="none",i.innerHTML=`
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
    `;let c="login";const x=i.querySelector('[data-mode="login"]'),E=i.querySelector('[data-mode="signup"]'),q=i.querySelector("#ss-auth-form"),w=i.querySelector("#ss-auth-email"),L=i.querySelector("#ss-auth-password"),S=i.querySelector("#ss-auth-error"),A=i.querySelector("#ss-auth-submit"),N=z=>{c=z,x.classList.toggle("active",z==="login"),E.classList.toggle("active",z==="signup"),A.textContent=z==="login"?"Sign In":"Sign Up",S.style.display="none"};x.addEventListener("click",()=>N("login")),E.addEventListener("click",()=>N("signup")),q.addEventListener("submit",async z=>{z.preventDefault(),S.style.display="none";const F=w.value.trim(),W=L.value;if(!F||!W){S.textContent="Please enter email and password.",S.style.display="block";return}A.disabled=!0,A.textContent=c==="login"?"Signing in...":"Signing up...";try{const B=await chrome.runtime.sendMessage({type:c==="login"?"SIGN_IN":"SIGN_UP",email:F,password:W});if(B!=null&&B.error)S.textContent=B.error,S.style.display="block";else{const O=await chrome.runtime.sendMessage({type:"CHECK_PREFERENCES"});O!=null&&O.hasPreferences?C():f()}}catch(B){S.textContent=B.message||"An error occurred.",S.style.display="block"}finally{A.disabled=!1,A.textContent=c==="login"?"Sign In":"Sign Up"}})},f=async()=>{i.style.display="flex",s.style.display="none";let c=null;try{const w=await chrome.runtime.sendMessage({type:"GET_PREFERENCES"});c=(w==null?void 0:w.preferences)||null}catch(w){console.error("Failed to load preferences:",w)}i.innerHTML=`
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
    `;const x=i.querySelector("#ss-preferences-form"),E=i.querySelector("#ss-pref-error"),q=i.querySelector("#ss-pref-submit");if(c){const w=i.querySelector("#ss-pref-price"),L=i.querySelector("#ss-pref-quality"),S=i.querySelector("#ss-pref-brand"),A=i.querySelector("#ss-pref-sustainability"),N=i.querySelector("#ss-pref-reviews"),z=i.querySelector("#ss-pref-innovation");w&&c.price&&(w.value=c.price),L&&c.quality&&(L.value=c.quality),S&&c.brand&&(S.value=c.brand),A&&c.sustainability&&(A.value=c.sustainability),N&&c.reviews&&(N.value=c.reviews),z&&c.innovation&&(z.value=c.innovation)}x.addEventListener("submit",async w=>{w.preventDefault(),E.style.display="none";const L={price:i.querySelector("#ss-pref-price").value||null,quality:i.querySelector("#ss-pref-quality").value||null,brand:i.querySelector("#ss-pref-brand").value||null,sustainability:i.querySelector("#ss-pref-sustainability").value||null,reviews:i.querySelector("#ss-pref-reviews").value||null,innovation:i.querySelector("#ss-pref-innovation").value||null};q.disabled=!0,q.textContent="Saving...";try{const S=await chrome.runtime.sendMessage({type:"SAVE_PREFERENCES",preferences:L});S!=null&&S.error?(E.textContent=S.error,E.style.display="block"):C()}catch(S){E.textContent=S.message||"An error occurred.",E.style.display="block"}finally{q.disabled=!1,q.textContent="Save Preferences"}})},C=()=>{i.style.display="none",s.style.display="flex"};l.addEventListener("click",async()=>{P("Analyzing..."),await chrome.runtime.sendMessage({type:"ANALYZE_CLICK"})}),o.addEventListener("submit",async c=>{c.preventDefault();const x=(_==null?void 0:_.value.trim())??"";!x||!I||(J(I,{role:"user",content:x}),_&&(_.value=""),await chrome.runtime.sendMessage({type:"CHAT_SEND",question:x}))}),_==null||_.addEventListener("keydown",c=>{c.key==="Enter"&&!c.shiftKey&&(c.preventDefault(),o.requestSubmit())}),a.addEventListener("click",()=>{f()});let h=!1;const v=n.querySelector("#ss-minimized-icon"),b=n.querySelector("#ss-close-mini"),T=n.querySelector("#ss-more-options-mini"),g=()=>{if(h=!h,h){if(d.classList.add("minimized"),r.title="Expand",p){const c=p.style.top||window.getComputedStyle(p).top||"16px";p.style.position="fixed",p.style.top=c,p.style.right="16px",p.style.left="auto",p.style.bottom="auto",p.style.width="80px",p.style.height="80px",p.style.margin="0",p.style.transform="none"}}else if(d.classList.remove("minimized"),r.title="Minimize",p){const c=p.style.top||window.getComputedStyle(p).top||"16px";p.style.position="fixed",p.style.top=c,p.style.right="16px",p.style.left="auto",p.style.bottom="auto",p.style.width="340px",p.style.height="calc(100vh - 32px)",p.style.margin="0",p.style.transform="none"}};r.addEventListener("click",c=>{c.stopPropagation(),g()}),v.addEventListener("click",c=>{c.stopPropagation(),h&&g()}),b.addEventListener("click",c=>{c.stopPropagation(),p&&(p.style.display="none")}),T.addEventListener("click",c=>{c.stopPropagation(),f()}),m()},ge=()=>{X(),p&&(p.style.display="block")},ve=()=>{if(X(),!p)return;const e=p.style.display==="none";p.style.display=e?"block":"none"},xe=()=>{const e=he();return console.log("[ShopSense] extracted",e),e};chrome.runtime.onMessage.addListener((e,t,n)=>{if(e.type==="EXTRACT_REQUEST")return n(xe()),!0;const i="tabId"in e?e.tabId:void 0;return i!=null&&G!=null&&i!==G?!1:e.type==="TOGGLE_SIDEBAR"?(ve(),!0):(ge(),e.type==="STATUS"||e.type==="ERROR"?(P(e.message),!0):e.type==="ANALYZE_RESULT"&&Y?(be(Y,e.result),P("Analyze completed"),!0):e.type==="CHAT_RESPONSE"&&I?(J(I,e.message),P("Chat ready"),!0):!1)});const we=async()=>{G=await ye()};we();
