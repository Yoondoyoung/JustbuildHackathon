const C="shopsense-sidebar";let y=null,m=null,g=null,v=null,b=null,p=null,d=null;const S=async()=>{try{const t=await chrome.runtime.sendMessage({type:"GET_TAB_ID"});if(typeof(t==null?void 0:t.tabId)=="number")return t.tabId}catch{}return null},f=t=>{if(!g||!m)return;g.textContent=t,m.classList.remove("busy","error");const e=t.toLowerCase();e.includes("fail")||e.includes("error")?m.classList.add("error"):(e.includes("analyz")||e.includes("send"))&&m.classList.add("busy")},k=(t,e)=>{var a,c;t.innerHTML="";const o=document.createElement("h2");o.textContent=e.title??"Analyze",t.appendChild(o);const r=document.createElement("p");if(r.textContent=e.summary??"No summary available.",t.appendChild(r),e.price){const n=document.createElement("div");n.className="meta-row",n.textContent=`Price: ${e.price.value} ${e.price.currency}`,t.appendChild(n)}if(e.rating!==void 0){const n=document.createElement("div");n.className="meta-row",n.textContent=`Rating: ${e.rating}`,t.appendChild(n)}if(e.review_count!==void 0){const n=document.createElement("div");n.className="meta-row",n.textContent=`Reviews: ${e.review_count}`,t.appendChild(n)}if((a=e.key_points)!=null&&a.length){const n=document.createElement("ul");e.key_points.forEach(i=>{const s=document.createElement("li");s.textContent=i,n.appendChild(s)}),t.appendChild(n)}if(e.specs&&Object.keys(e.specs).length>0){const n=document.createElement("div");n.className="specs",Object.entries(e.specs).forEach(([i,s])=>{const h=document.createElement("div");h.className="spec-row",h.textContent=`${i}: ${s}`,n.appendChild(h)}),t.appendChild(n)}if((c=e.citations)!=null&&c.length){const n=document.createElement("div");n.className="citations",e.citations.forEach(i=>{const s=document.createElement("a");s.href=i.url,s.target="_blank",s.rel="noreferrer",s.textContent=i.title??i.url,n.appendChild(s)}),t.appendChild(n)}},w=(t,e)=>{var a;const o=document.createElement("div");o.className=`chat-message ${e.role}`;const r=document.createElement("div");if(r.className="chat-text",r.textContent=e.content,o.appendChild(r),(a=e.citations)!=null&&a.length){const c=document.createElement("div");c.className="chat-citations",e.citations.forEach(n=>{const i=document.createElement("a");i.href=n.url,i.target="_blank",i.rel="noreferrer",i.textContent=n.title??n.url,c.appendChild(i)}),o.appendChild(c)}t.appendChild(o),t.scrollTop=t.scrollHeight},E=()=>{if(d)return;const t=document.getElementById(C);if(t){d=t;return}const e=document.createElement("div");e.id=C,e.style.position="fixed",e.style.inset="16px 16px auto auto",e.style.top="16px",e.style.right="16px",e.style.left="auto",e.style.margin="0",e.style.transform="none",e.style.width="340px",e.style.height="calc(100vh - 32px)",e.style.zIndex="2147483647",e.style.display="none";const o=e.attachShadow({mode:"open"});o.innerHTML=`
    <style>
      :host { all: initial; }
      * { box-sizing: border-box; font-family: system-ui, sans-serif; }
      .sidebar { height: 100%; background: #fff; border-radius: 16px; border: 1px solid #f0f0f0;
        box-shadow: 0 8px 30px rgba(0,0,0,0.12); display: flex; flex-direction: column; overflow: hidden; }
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
    </style>
    <div class="sidebar">
      <div class="header">
        <div class="title">ShopSense</div>
        <div class="status"><span class="dot" id="ss-status-dot"></span><span id="ss-status-text">Idle</span></div>
      </div>
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
  `,document.documentElement.appendChild(e),d=e,m=o.querySelector("#ss-status-dot"),g=o.querySelector("#ss-status-text"),v=o.querySelector("#ss-analyze"),b=o.querySelector("#ss-chat"),p=o.querySelector("#ss-chat-input");const r=o.querySelector("#ss-analyze"),a=o.querySelector("#ss-chat-form");r.addEventListener("click",async()=>{f("Analyzing..."),await chrome.runtime.sendMessage({type:"ANALYZE_CLICK"})}),a.addEventListener("submit",async c=>{c.preventDefault();const n=(p==null?void 0:p.value.trim())??"";!n||!b||(w(b,{role:"user",content:n}),p&&(p.value=""),await chrome.runtime.sendMessage({type:"CHAT_SEND",question:n}))})},z=()=>{E(),d&&(d.style.display="block")},A=()=>{if(E(),!d)return;const t=d.style.display==="none";d.style.display=t?"block":"none"},u=t=>{var e;for(const o of t){const r=document.querySelector(o),a=(e=r==null?void 0:r.textContent)==null?void 0:e.trim();if(a)return a}},l=t=>{var e;for(const o of t){const r=document.querySelector(`meta[name="${o}"], meta[property="${o}"]`),a=(e=r==null?void 0:r.getAttribute("content"))==null?void 0:e.trim();if(a)return a}},x=t=>{if(!t)return;const e=t.replace(/[^0-9.]/g,""),o=Number(e);return Number.isFinite(o)?o:void 0},_=()=>{const t={};return document.querySelectorAll("table").forEach(e=>{e.querySelectorAll("tr").forEach(o=>{var c,n,i,s;const r=(n=(c=o.querySelector("th"))==null?void 0:c.textContent)==null?void 0:n.trim(),a=(s=(i=o.querySelector("td"))==null?void 0:i.textContent)==null?void 0:s.trim();r&&a&&(t[r]=a)})}),document.querySelectorAll("dl").forEach(e=>{Array.from(e.querySelectorAll("dt")).forEach(r=>{var n,i,s;const a=(n=r.textContent)==null?void 0:n.trim(),c=(s=(i=r.nextElementSibling)==null?void 0:i.textContent)==null?void 0:s.trim();a&&c&&(t[a]=c)})}),Object.keys(t).length>0?t:void 0},q=()=>{const t=["[itemprop=review]","[data-hook=review]",".review",".reviews-list .review-item"],e=[];return document.querySelectorAll(t.join(",")).forEach(o=>{var a;if(e.length>=5)return;const r=(a=o.textContent)==null?void 0:a.trim();r&&r.length>20&&e.push(r.replace(/\s+/g," "))}),e.length>0?e:void 0},N=()=>{var s;const t=l(["og:title","twitter:title"])||u(["h1","[itemprop=name]","[data-test=product-title]"])||document.title,e=l(["product:brand","og:brand"])||u(["[itemprop=brand]","[data-brand]",".brand",".product-brand"]),o=l(["product:mpn","product:model"])||u(["[itemprop=mpn]","[data-model]"]),r=l(["product:price:amount","price","og:price:amount"])||u(["[itemprop=price]","[data-test=product-price]",".price"]),a=l(["product:price:currency","price:currency"])||((s=document.querySelector("[itemprop=priceCurrency]"))==null?void 0:s.getAttribute("content"))||"USD",c=l(["rating","ratingValue"])||u(["[itemprop=ratingValue]","[data-test=rating]",".rating"]),n=l(["reviewCount"])||u(["[itemprop=reviewCount]","[data-hook=total-review-count]",".review-count"]),i=x(r);return{page_url:location.href,store_domain:location.host,title:t,brand:e,model:o,price:i!==void 0?{value:i,currency:a}:void 0,rating:x(c),review_count:x(n),key_specs:_(),visible_reviews:q()}};chrome.runtime.onMessage.addListener((t,e,o)=>t.type==="EXTRACT_REQUEST"?(o(N()),!0):t.tabId&&y&&t.tabId!==y?!1:t.type==="TOGGLE_SIDEBAR"?(A(),!0):(z(),t.type==="STATUS"||t.type==="ERROR"?(f(t.message),!0):t.type==="ANALYZE_RESULT"&&v?(k(v,t.result),f("Analyze completed"),!0):t.type==="CHAT_RESPONSE"&&b?(w(b,t.message),f("Chat ready"),!0):!1));const T=async()=>{y=await S()};T();
