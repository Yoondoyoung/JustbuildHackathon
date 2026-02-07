const b=(e,t=document)=>{var n;for(const i of e){const o=t.querySelector(i),l=(n=o==null?void 0:o.textContent)==null?void 0:n.trim();if(l)return l}},k=e=>{var t;for(const n of e){const i=document.querySelector(`meta[name="${n}"], meta[property="${n}"]`),o=(t=i==null?void 0:i.getAttribute("content"))==null?void 0:t.trim();if(o)return o}},z=e=>{if(!e)return;const t=e.replace(/[^0-9.]/g,""),n=Number(t);return Number.isFinite(n)?n:void 0},D=e=>{if(!e)return;const t=e.replace(/,/g,"").match(/(\d+(\.\d+)?)/);return t?z(t[1]):void 0},j=(e,t="USD")=>e?e.includes("£")?"GBP":e.includes("€")?"EUR":e.includes("¥")?"JPY":e.includes("₩")?"KRW":e.includes("$")?"USD":t:t,Z=e=>e.replace(/[:：]\s*$/,"").trim(),U=(e,t,n)=>{const i=t?Z(t):"",o=(n==null?void 0:n.trim())??"";!i||!o||e[i]||(e[i]=o)},H=(e,t)=>{e.querySelectorAll("table").forEach(n=>{n.querySelectorAll("tr").forEach(i=>{var o,l;U(t,(o=i.querySelector("th"))==null?void 0:o.textContent,(l=i.querySelector("td"))==null?void 0:l.textContent)})}),e.querySelectorAll("dl").forEach(n=>{Array.from(n.querySelectorAll("dt")).forEach(o=>{var l;U(t,o.textContent,(l=o.nextElementSibling)==null?void 0:l.textContent)})}),e.querySelectorAll("li").forEach(n=>{const i=n.querySelector("span.a-text-bold, strong, b");if(!i)return;const o=i.textContent??"",l=Z(o);if(!l)return;const s=(n.textContent??"").replace(o,"").replace(/^[\s:-]+/,"").trim();U(t,l,s)})},V=(e=document)=>{const t={};return H(e,t),Object.keys(t).length>0?t:void 0},ee=["[itemprop=review]","[data-hook=review]",".review",".reviews-list .review-item","[data-testid=review-card]",".ugc-review-body"],$=(e=ee,t=document)=>{const n=[];return t.querySelectorAll(e.join(",")).forEach(i=>{var l;if(n.length>=5)return;const o=(l=i.textContent)==null?void 0:l.trim();o&&o.length>20&&n.push(o.replace(/\s+/g," "))}),n.length>0?n:void 0},te=()=>{var a;const e=k(["og:title","twitter:title"])||b(["h1","[itemprop=name]","[data-test=product-title]"])||document.title,t=k(["product:brand","og:brand"])||b(["[itemprop=brand]","[data-brand]",".brand",".product-brand"]),n=k(["product:mpn","product:model"])||b(["[itemprop=mpn]","[data-model]"]),i=k(["product:price:amount","price","og:price:amount"])||b(["[itemprop=price]","[data-test=product-price]",".price"]),o=k(["product:price:currency","price:currency"])||((a=document.querySelector("[itemprop=priceCurrency]"))==null?void 0:a.getAttribute("content"))||j(i,"USD"),l=k(["rating","ratingValue"])||b(["[itemprop=ratingValue]","[data-test=rating]",".rating"]),r=k(["reviewCount"])||b(["[itemprop=reviewCount]","[data-hook=total-review-count]",".review-count"]),s=z(i);return{title:e,brand:t,model:n,price:s!==void 0?{value:s,currency:o}:void 0,rating:D(l),review_count:z(r),key_specs:V(),visible_reviews:$()}},ie=e=>e&&e.replace(/^Brand:\s*/i,"").replace(/^Visit the\s*/i,"").replace(/\s*Store$/i,"").trim()||void 0,ne=()=>{const e={};["#productDetails_techSpec_section_1","#productDetails_detailBullets_sections1","#technicalSpecifications_feature_div","#detailBullets_feature_div","#detailBulletsWrapper_feature_div","#prodDetails"].forEach(i=>{const o=document.querySelector(i);o&&H(o,e)});const n=V();return n&&Object.entries(n).forEach(([i,o])=>{e[i]||(e[i]=o)}),Object.keys(e).length>0?e:void 0},oe=()=>b(["#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE","#mir-layout-DELIVERY_BLOCK-slot-DELIVERY_MESSAGE","#deliveryMessageMirId","#deliveryMessage","#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_SMALL"]),re=()=>{const e=b(["#productTitle","h1#title"]),t=document.querySelector("#bylineInfo"),n=ie((t==null?void 0:t.getAttribute("aria-label"))??(t==null?void 0:t.textContent)??""),i=b(["#corePrice_feature_div .a-offscreen","#apex_desktop .a-price .a-offscreen","#priceblock_ourprice","#priceblock_dealprice","#priceblock_saleprice"])??k(["product:price:amount","price","og:price:amount"]),o=z(i),l=k(["product:price:currency","price:currency"])||j(i,"USD"),r=document.querySelector("#acrPopover"),s=(r==null?void 0:r.getAttribute("title"))||(r==null?void 0:r.textContent)||b(["#averageCustomerReviews .a-icon-alt","span[data-hook=rating-out-of-text]"]),a=b(["#acrCustomerReviewText","span[data-hook=total-review-count]"]),d=ne(),m=(d==null?void 0:d["Item model number"])||(d==null?void 0:d.Model)||b(["[itemprop=mpn]"]);return{title:e,brand:n,model:m,price:o!==void 0?{value:o,currency:l}:void 0,rating:D(s),review_count:z(a),key_specs:d,visible_reviews:$(["[data-hook=review-body]",".review-text","[data-hook=review]"]),shipping_returns:oe()}},se=()=>{var r;const e={},t=document.querySelector('[data-testid="brix-sheet"]');t&&t.querySelectorAll('div.inline-flex.w-full, div[class*="inline-flex"][class*="w-full"], div[class*="dB7j8sHUbncyf79K"]').forEach(a=>{var u,f;const d=a.querySelector('div.font-weight-medium, div[class*="font-weight-medium"]'),m=a.querySelector('div[class*="pl-300"], div.grow.basis-none[class*="pl-300"]');if(d&&m){const C=d.cloneNode(!0);C.querySelectorAll("button").forEach(A=>A.remove());let g=((u=C.textContent)==null?void 0:u.trim())||"";const y=((f=m.textContent)==null?void 0:f.trim())||"";g=g.replace(/\s+/g," ").trim(),g&&y&&g.length>0&&y.length>0&&(e[g]=y)}});const n=document.querySelectorAll("h2.h5");let i=null;for(const s of Array.from(n))if(((r=s.textContent)==null?void 0:r.trim())==="Highlights"){i=s;break}if(i){const s=i.parentElement;s&&s.querySelectorAll("button.c-button-unstyled").forEach(d=>{var u,f,C;const m=d.querySelector("div.flex.flex-column");if(m){const h=m.querySelector("div:first-child"),g=m.querySelector('div.font-500, div[class*="font-500"]');if(h&&g){const y=h.cloneNode(!0);y.querySelectorAll("svg").forEach(q=>q.remove());let v=((u=y.textContent)==null?void 0:u.trim())||"",c=((f=g.textContent)==null?void 0:f.trim())||"";const x=g.cloneNode(!0);x.querySelectorAll("svg").forEach(q=>q.remove()),c=((C=x.textContent)==null?void 0:C.trim())||"",v=v.replace(/\s+/g," ").trim(),c=c.replace(/\s+/g," ").trim(),v&&c&&v.length>0&&c.length>0&&(e[v]||(e[v]=c))}}})}["#specifications",".specifications",".specification-table",".product-data"].forEach(s=>{const a=document.querySelector(s);a&&H(a,e)});const l=V();return l&&Object.entries(l).forEach(([s,a])=>{e[s]||(e[s]=a)}),Object.keys(e).length>0?e:void 0},ae=()=>{var r,s,a,d;const e=document.querySelector('[data-component-name="FulfillmentSelector"]');if(!e)return b([".fulfillment-additional-info",".availabilityMessage",".fulfillment-fulfillment-summary"]);const t=[],n=e.querySelector('button[data-test-id="pickup"]');if(n){const u=(n.getAttribute("aria-label")||"").match(/(?:Ready on|Pickup)\s+([^,]+,\s*[^,]+)/i);if(u)t.push(`Pickup: ${u[1]}`);else{const f=(s=(r=n.querySelector("strong"))==null?void 0:r.textContent)==null?void 0:s.trim();f&&t.push(`Pickup: ${f}`)}}const i=e.querySelector('button[data-test-id="shipping"]');if(i){const u=(i.getAttribute("aria-label")||"").match(/(?:Get it by|Shipping)\s+([^,]+,\s*[^,]+)/i);if(u)t.push(`Shipping: ${u[1]}`);else{const f=(d=(a=i.querySelector("strong"))==null?void 0:a.textContent)==null?void 0:d.trim();f&&t.push(`Shipping: ${f}`)}}const l=(e.textContent||"").match(/Order now for pickup on ([^a]+) at\s+([^<]+)/i);return l&&t.push(`Pickup location: ${l[2].trim()}`),t.length>0?t.join(" - "):void 0},ce=()=>{var f,C,h,g,y,A;const e=b([".sku-title h1","h1.sku-title","h1"]);let t;const n=document.querySelector('[data-component-name="ProductHeader"]');if(n){const v=n.querySelector(".description a");t=(f=v==null?void 0:v.textContent)==null?void 0:f.trim()}let i;if(n){const v=n.querySelector(".disclaimer");if(v){const x=(v.textContent||"").match(/Model:\s*([^\s]+)/i);x&&(i=x[1])}}let o;const l=document.querySelector('[data-testid="price-block-customer-price"]');l&&(o=(C=l.textContent)==null?void 0:C.trim()),o||(o=b([".priceView-hero-price span",".priceView-customer-price span","[data-testid=customer-price]",".pricing-price__regular-price"])??k(["product:price:amount","price","og:price:amount"]));const r=z(o),s=k(["product:price:currency","price:currency"])||j(o,"USD");let a,d;const m=document.querySelector('[data-component-name="ReviewStatsContextualized"]');if(m){const v=m.querySelector("span.font-weight-bold");if(a=(h=v==null?void 0:v.textContent)==null?void 0:h.trim(),!a){const w=(((g=m.querySelector("p.visually-hidden"))==null?void 0:g.textContent)||"").match(/Rating\s+(\d+(?:\.\d+)?)\s+out\s+of/i);w&&(a=w[1])}const c=m.querySelector("span.c-reviews"),E=(((y=c==null?void 0:c.textContent)==null?void 0:y.trim())||"").match(/(\d+)\s*review/i);if(E&&(d=E[1]),!d){const w=(((A=m.querySelector("p.visually-hidden"))==null?void 0:A.textContent)||"").match(/(\d+)\s+review/i);w&&(d=w[1])}}a||(a=b([".c-review-average",".ugc-c-review-average","[data-automation=overall-rating]"])),d||(d=b([".c-review-count",".ugc-c-review-count","[data-automation=review-count]"]));const u=se();return t=t||(u==null?void 0:u.Brand)||(u==null?void 0:u["Brand Name"]),i=i||(u==null?void 0:u.Model)||(u==null?void 0:u["Model Number"]),{title:e,brand:t,model:i,price:r!==void 0?{value:r,currency:s}:void 0,rating:D(a),review_count:z(d),key_specs:u,visible_reviews:$(["[data-component-name=CustomerReviewListSection] #review-list li p","#review-list li p","[data-testid=enhanced-review-content]","[data-testid=review-card]",".ugc-review-body",".review-text",".review-item"]),shipping_returns:ae()}},le=()=>{const e={};["[data-testid=specifications-section]","[data-testid=product-specifications]","#product-specifications","#specifications"].forEach(i=>{const o=document.querySelector(i);o&&H(o,e)});const n=V();return n&&Object.entries(n).forEach(([i,o])=>{e[i]||(e[i]=o)}),Object.keys(e).length>0?e:void 0},de=()=>{var a,d,m;const e=document.querySelector("#fulfillment-Shipping-content");if(!e)return;const t=[],n=e.querySelector('[data-seo-id="fulfillment-shipping-intent"]'),i=(a=n==null?void 0:n.textContent)==null?void 0:a.trim();i&&t.push(i);const o=n==null?void 0:n.nextElementSibling,l=(d=o==null?void 0:o.textContent)==null?void 0:d.trim();l&&l!==i&&t.push(l);const r=e.querySelector(".f7.b.green, .f7.b"),s=(m=r==null?void 0:r.textContent)==null?void 0:m.trim();return s&&t.push(s),t.length>0?t.join(" - "):void 0},pe=()=>{const e=[];return document.querySelectorAll('[data-testid="enhanced-review-content"]').forEach(n=>{var s,a;if(e.length>=5)return;const i=n.querySelector("h3"),o=((s=i==null?void 0:i.textContent)==null?void 0:s.trim())||"",l=n.querySelector('p[tabindex="-1"]'),r=((a=l==null?void 0:l.textContent)==null?void 0:a.trim())||"";if(r&&r.length>20){const d=o?`${o}. ${r}`:r;e.push(d.replace(/\s+/g," "))}}),e.length>0?e:void 0},ue=()=>{var m,u,f;const e=b(["[data-testid=product-title]","h1","[itemprop=name]"]),t=b(["[data-testid=brand-name]","[itemprop=brand]","a[data-testid=brand-name]","[data-automation-id=brand-name]"]),n=b(["[data-testid=price-wrap] [itemprop=price]","[data-testid=price-wrap]","[data-testid=price]","[itemprop=price]","[data-automation-id=product-price]"])??k(["product:price:amount","price","og:price:amount"]),i=z(n),o=k(["product:price:currency","price:currency"])||j(n,"USD"),l=document.querySelector('[data-testid="reviews-and-ratings"]');let r,s;if(l){const C=l.querySelector("span.w_iUH7");if(C){const h=((m=C.textContent)==null?void 0:m.trim())||"",g=h.match(/(\d+\.?\d*)\s*stars?/i);g&&(r=g[1]);const y=h.match(/(\d+(?:,\d+)?)\s*reviews?/i);y&&(s=y[1])}if(!r){const h=l.querySelector("span.f7"),y=(((u=h==null?void 0:h.textContent)==null?void 0:u.trim())||"").match(/\((\d+\.?\d*)\)/);y&&(r=y[1])}if(!s){const h=l.querySelector('[itemprop="ratingCount"]'),y=(((f=h==null?void 0:h.textContent)==null?void 0:f.trim())||"").match(/(\d+(?:,\d+)?)/);y&&(s=y[1])}}r||(r=b(["[data-testid=reviews-rating]","[itemprop=ratingValue]",".stars-container"])),s||(s=b(["[data-testid=reviews-header]","[data-testid=reviews-count]","[itemprop=reviewCount]",".stars-reviews-count"]));const a=le(),d=(a==null?void 0:a.Model)||(a==null?void 0:a["Model Number"]);return{title:e,brand:t,model:d,price:i!==void 0?{value:i,currency:o}:void 0,rating:D(r),review_count:z(s),key_specs:a,visible_reviews:pe()||$(["[data-testid=review-card]","[data-testid=review-text]","[data-testid=review-body]",".review-text",".prod-ProductReview",".review-body","[data-automation-id=review-text]","section[data-testid=reviews-section] [data-testid=review-card]"]),shipping_returns:de()}},me=e=>{const t=e.toLowerCase();return t.includes("amazon.")?re:t.includes("walmart.")?ue:t.endsWith("bestbuy.com")?ce:null},fe=(e,t)=>{var i;const n={...e.key_specs??{},...t.key_specs??{}};return{page_url:location.href,store_domain:location.host,title:t.title??e.title,brand:t.brand??e.brand,model:t.model??e.model,price:t.price??e.price,rating:t.rating??e.rating,review_count:t.review_count??e.review_count,key_specs:Object.keys(n).length>0?n:void 0,visible_reviews:(i=t.visible_reviews)!=null&&i.length?t.visible_reviews:e.visible_reviews,shipping_returns:t.shipping_returns??e.shipping_returns}},he=()=>{const e=te(),t=me(location.host),n=t?t():{};return fe(e,n)},Q="shopsense-sidebar";let G=null,N=null,K=null,Y=null,I=null,L=null,p=null;const be=async()=>{try{const e=await chrome.runtime.sendMessage({type:"GET_TAB_ID"});if(typeof(e==null?void 0:e.tabId)=="number")return e.tabId}catch{}return null},P=e=>{if(!K||!N)return;K.textContent=e,N.classList.remove("busy","error");const t=e.toLowerCase();t.includes("fail")||t.includes("error")?N.classList.add("error"):(t.includes("analyz")||t.includes("send"))&&N.classList.add("busy")},ye=(e,t)=>{var o,l;e.innerHTML="";const n=document.createElement("h2");n.textContent=t.title??"Analyze",e.appendChild(n);const i=document.createElement("p");if(i.textContent=t.summary??"No summary available.",e.appendChild(i),t.price){const r=document.createElement("div");r.className="meta-row",r.textContent=`Price: ${t.price.value} ${t.price.currency}`,e.appendChild(r)}if(t.rating!==void 0){const r=document.createElement("div");r.className="meta-row",r.textContent=`Rating: ${t.rating}`,e.appendChild(r)}if(t.review_count!==void 0){const r=document.createElement("div");r.className="meta-row",r.textContent=`Reviews: ${t.review_count}`,e.appendChild(r)}if((o=t.key_points)!=null&&o.length){const r=document.createElement("ul");t.key_points.forEach(s=>{const a=document.createElement("li");a.textContent=s,r.appendChild(a)}),e.appendChild(r)}if(t.specs&&Object.keys(t.specs).length>0){const r=document.createElement("div");r.className="specs",Object.entries(t.specs).forEach(([s,a])=>{const d=document.createElement("div");d.className="spec-row",d.textContent=`${s}: ${a}`,r.appendChild(d)}),e.appendChild(r)}if((l=t.citations)!=null&&l.length){const r=document.createElement("div");r.className="citations",t.citations.forEach(s=>{const a=document.createElement("a");a.href=s.url,a.target="_blank",a.rel="noreferrer",a.textContent=s.title??s.url,r.appendChild(a)}),e.appendChild(r)}},J=(e,t)=>{var o;const n=document.createElement("div");n.className=`chat-message ${t.role}`;const i=document.createElement("div");if(i.className="chat-text",i.textContent=t.content,n.appendChild(i),(o=t.citations)!=null&&o.length){const l=document.createElement("div");l.className="chat-citations",t.citations.forEach(r=>{const s=document.createElement("a");s.href=r.url,s.target="_blank",s.rel="noreferrer",s.textContent=r.title??r.url,l.appendChild(s)}),n.appendChild(l)}e.appendChild(n),e.scrollTop=e.scrollHeight},X=()=>{if(p)return;const e=document.getElementById(Q);if(e){p=e;return}const t=document.createElement("div");t.id=Q,t.style.position="fixed",t.style.top="16px",t.style.right="16px",t.style.left="auto",t.style.bottom="auto",t.style.margin="0",t.style.transform="none",t.style.width="340px",t.style.height="calc(100vh - 32px)",t.style.zIndex="2147483647",t.style.display="none";const n=t.attachShadow({mode:"open"});n.innerHTML=`
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
      .auth-wrapper { flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px; }
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
  `,document.documentElement.appendChild(t),p=t,N=n.querySelector("#ss-status-dot"),K=n.querySelector("#ss-status-text"),Y=n.querySelector("#ss-analyze"),I=n.querySelector("#ss-chat"),L=n.querySelector("#ss-chat-input");const i=n.querySelector("#ss-auth-container"),o=n.querySelector("#ss-main-content"),l=n.querySelector("button#ss-analyze"),r=n.querySelector("#ss-chat-form"),s=n.querySelector("#ss-settings-btn"),a=n.querySelector("#ss-minimize-btn"),d=n.querySelector("#ss-sidebar"),m=async()=>{try{const c=await chrome.runtime.sendMessage({type:"CHECK_AUTH"});if(c!=null&&c.isAuthenticated){const x=await chrome.runtime.sendMessage({type:"CHECK_PREFERENCES"});x!=null&&x.hasPreferences?C():f()}else u()}catch(c){console.error("Auth check failed:",c),u()}},u=()=>{i.style.display="flex",o.style.display="none",i.innerHTML=`
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
    `;let c="login";const x=i.querySelector('[data-mode="login"]'),E=i.querySelector('[data-mode="signup"]'),q=i.querySelector("#ss-auth-form"),w=i.querySelector("#ss-auth-email"),T=i.querySelector("#ss-auth-password"),S=i.querySelector("#ss-auth-error"),M=i.querySelector("#ss-auth-submit"),R=_=>{c=_,x.classList.toggle("active",_==="login"),E.classList.toggle("active",_==="signup"),M.textContent=_==="login"?"Sign In":"Sign Up",S.style.display="none"};x.addEventListener("click",()=>R("login")),E.addEventListener("click",()=>R("signup")),q.addEventListener("submit",async _=>{_.preventDefault(),S.style.display="none";const F=w.value.trim(),W=T.value;if(!F||!W){S.textContent="Please enter email and password.",S.style.display="block";return}M.disabled=!0,M.textContent=c==="login"?"Signing in...":"Signing up...";try{const B=await chrome.runtime.sendMessage({type:c==="login"?"SIGN_IN":"SIGN_UP",email:F,password:W});if(B!=null&&B.error)S.textContent=B.error,S.style.display="block";else{const O=await chrome.runtime.sendMessage({type:"CHECK_PREFERENCES"});O!=null&&O.hasPreferences?C():f()}}catch(B){S.textContent=B.message||"An error occurred.",S.style.display="block"}finally{M.disabled=!1,M.textContent=c==="login"?"Sign In":"Sign Up"}})},f=async()=>{i.style.display="flex",o.style.display="none";let c=null;try{const w=await chrome.runtime.sendMessage({type:"GET_PREFERENCES"});c=(w==null?void 0:w.preferences)||null}catch(w){console.error("Failed to load preferences:",w)}i.innerHTML=`
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
    `;const x=i.querySelector("#ss-preferences-form"),E=i.querySelector("#ss-pref-error"),q=i.querySelector("#ss-pref-submit");if(c){const w=i.querySelector("#ss-pref-price"),T=i.querySelector("#ss-pref-quality"),S=i.querySelector("#ss-pref-brand"),M=i.querySelector("#ss-pref-sustainability"),R=i.querySelector("#ss-pref-reviews"),_=i.querySelector("#ss-pref-innovation");w&&c.price_sensitivity&&(w.value=c.price_sensitivity),T&&c.quality_preference&&(T.value=c.quality_preference),S&&c.brand_preference&&(S.value=c.brand_preference),M&&c.sustainability&&(M.value=c.sustainability),R&&c.review_dependency&&(R.value=c.review_dependency),_&&c.innovation_adoption&&(_.value=c.innovation_adoption)}x.addEventListener("submit",async w=>{w.preventDefault(),E.style.display="none";const T={price:i.querySelector("#ss-pref-price").value||null,quality:i.querySelector("#ss-pref-quality").value||null,brand:i.querySelector("#ss-pref-brand").value||null,sustainability:i.querySelector("#ss-pref-sustainability").value||null,reviews:i.querySelector("#ss-pref-reviews").value||null,innovation:i.querySelector("#ss-pref-innovation").value||null};q.disabled=!0,q.textContent="Saving...";try{const S=await chrome.runtime.sendMessage({type:"SAVE_PREFERENCES",preferences:T});S!=null&&S.error?(E.textContent=S.error,E.style.display="block"):C()}catch(S){E.textContent=S.message||"An error occurred.",E.style.display="block"}finally{q.disabled=!1,q.textContent="Save Preferences"}})},C=()=>{i.style.display="none",o.style.display="flex"};l.addEventListener("click",async()=>{P("Analyzing..."),await chrome.runtime.sendMessage({type:"ANALYZE_CLICK"})}),r.addEventListener("submit",async c=>{c.preventDefault();const x=(L==null?void 0:L.value.trim())??"";!x||!I||(J(I,{role:"user",content:x}),L&&(L.value=""),await chrome.runtime.sendMessage({type:"CHAT_SEND",question:x}))}),s.addEventListener("click",()=>{f()});let h=!1;const g=n.querySelector("#ss-minimized-icon"),y=n.querySelector("#ss-close-mini"),A=n.querySelector("#ss-more-options-mini"),v=()=>{if(h=!h,h){if(d.classList.add("minimized"),a.title="Expand",p){const c=p.style.top||window.getComputedStyle(p).top||"16px";p.style.position="fixed",p.style.top=c,p.style.right="16px",p.style.left="auto",p.style.bottom="auto",p.style.width="80px",p.style.height="80px",p.style.margin="0",p.style.transform="none"}}else if(d.classList.remove("minimized"),a.title="Minimize",p){const c=p.style.top||window.getComputedStyle(p).top||"16px";p.style.position="fixed",p.style.top=c,p.style.right="16px",p.style.left="auto",p.style.bottom="auto",p.style.width="340px",p.style.height="calc(100vh - 32px)",p.style.margin="0",p.style.transform="none"}};a.addEventListener("click",c=>{c.stopPropagation(),v()}),g.addEventListener("click",c=>{c.stopPropagation(),h&&v()}),y.addEventListener("click",c=>{c.stopPropagation(),p&&(p.style.display="none")}),A.addEventListener("click",c=>{c.stopPropagation(),f()}),m()},ve=()=>{X(),p&&(p.style.display="block")},ge=()=>{if(X(),!p)return;const e=p.style.display==="none";p.style.display=e?"block":"none"},xe=()=>{const e=he();return console.log("[ShopSense] extracted",e),e};chrome.runtime.onMessage.addListener((e,t,n)=>e.type==="EXTRACT_REQUEST"?(n(xe()),!0):e.tabId&&G&&e.tabId!==G?!1:e.type==="TOGGLE_SIDEBAR"?(ge(),!0):(ve(),e.type==="STATUS"||e.type==="ERROR"?(P(e.message),!0):e.type==="ANALYZE_RESULT"&&Y?(ye(Y,e.result),P("Analyze completed"),!0):e.type==="CHAT_RESPONSE"&&I?(J(I,e.message),P("Chat ready"),!0):!1));const we=async()=>{G=await be()};we();
