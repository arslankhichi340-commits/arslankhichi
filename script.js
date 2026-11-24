const $ = id => document.getElementById(id);
let currentPrompt = "";
let historyItems = JSON.parse(localStorage.getItem("ak_history") || "[]");
let favorites = JSON.parse(localStorage.getItem("ak_favorites") || "[]");

const promptData = [
  ["Business","Business Growth Strategist","Create a practical business growth plan for [BUSINESS]. Include target customers, positioning, pricing, marketing channels, budget priorities and measurable milestones."],
  ["Writing","Professional Blog Writer","Act as an experienced blog writer. Create an engaging, well-researched article about [TOPIC] for [AUDIENCE]. Use a compelling introduction, clear headings, examples and a useful conclusion."],
  ["Image","Cinematic Portrait Prompt","Create a photorealistic cinematic portrait of [SUBJECT]. Describe pose, wardrobe, environment, lens, composition, lighting, color grading and mood. Keep anatomy natural and details realistic."],
  ["Education","Personal Learning Coach","Act as a patient expert tutor. Teach me [TOPIC] from beginner to confident level. Explain concepts simply, use examples, give practice questions and check my understanding."],
  ["Marketing","Social Media Campaign","Build a 30-day social media campaign for [BRAND]. Include audience, content pillars, daily post ideas, captions, calls to action and performance measures."],
  ["Development","Website Product Planner","Act as a senior product designer and frontend developer. Plan a responsive website for [PROJECT]. Define pages, user journeys, visual direction, accessibility and core interactions."]
];

function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2200)}
function showView(name){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active-view"));
  const view=$(name+"View"); if(view)view.classList.add("active-view");
  document.querySelectorAll(".side-link").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  const labels={assistant:"AI Assistant",image:"Image Studio",library:"Prompt Library",history:"Prompt History",templates:"Prompt Templates",favorites:"Favorites"};
  $("crumb").textContent=labels[name]||"Workspace";
  $("sidebar").classList.remove("open");
  if(name==="history")renderHistory();
  if(name==="favorites")renderFavorites();
}
document.querySelectorAll(".side-link").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
$("menuBtn").addEventListener("click",()=>$("sidebar").classList.add("open"));
$("closeSidebar").addEventListener("click",()=>$("sidebar").classList.remove("open"));
$("newChat").addEventListener("click",()=>{showView("assistant");$("ideaInput").value="";$("outputText").textContent="Your polished prompt will appear here. Start by describing your idea above.";$("outputText").classList.add("empty-output");$("wordCount").textContent="0 words";currentPrompt="";});
$("exploreTools").addEventListener("click",()=>showView("templates"));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.goto)));
document.querySelectorAll(".quick-card").forEach(b=>b.addEventListener("click",()=>{$("aiCategory").value=b.dataset.kind==="Image"?"Image Generation":b.dataset.kind==="Learning"?"Education":b.dataset.kind;$("ideaInput").focus();window.scrollTo({top:0,behavior:"smooth"});}));
document.querySelectorAll(".idea-chip").forEach(b=>b.addEventListener("click",()=>{$("ideaInput").value=b.dataset.idea;$("ideaInput").focus();}));

function makePrompt(){
  const idea=$("ideaInput").value.trim();
  if(!idea){toast("Please describe your idea first.");$("ideaInput").focus();return;}
  const tool=$("aiTool").value, category=$("aiCategory").value, style=$("aiStyle").value;
  currentPrompt=`You are an expert ${category.toLowerCase()} specialist working with ${tool}.\n\nOBJECTIVE\n${idea}\n\nHOW TO RESPOND\n1. Understand the goal and identify any important missing context.\n2. Create a ${style.toLowerCase()} quality response tailored to the objective.\n3. Organize the answer with useful headings and logical steps.\n4. Include concrete examples, practical recommendations and relevant details.\n5. State assumptions clearly; do not invent facts or sources.\n6. Make the final result clear, actionable and ready to use.\n\nOUTPUT\nStart with the most useful answer. Use the format best suited to the task. If clarification is essential, ask concise questions before making assumptions.`;
  $("outputText").textContent=currentPrompt;$("outputText").classList.remove("empty-output");
  $("wordCount").textContent=currentPrompt.trim().split(/\s+/).length+" words";
  historyItems.unshift({text:currentPrompt,date:new Date().toLocaleString()});historyItems=historyItems.slice(0,30);localStorage.setItem("ak_history",JSON.stringify(historyItems));
  $("outputPanel").scrollIntoView({behavior:"smooth",block:"nearest"});toast("Your prompt is ready.");
}
$("generateBtn").addEventListener("click",makePrompt);
$("copyBtn").addEventListener("click",async()=>{if(!currentPrompt){toast("Generate a prompt first.");return;}try{await navigator.clipboard.writeText(currentPrompt);toast("Prompt copied to clipboard.");}catch{toast("Clipboard unavailable in this browser.");}});
$("favoriteBtn").addEventListener("click",()=>{if(!currentPrompt){toast("Generate a prompt first.");return;}if(!favorites.includes(currentPrompt)){favorites.unshift(currentPrompt);localStorage.setItem("ak_favorites",JSON.stringify(favorites));toast("Saved to favorites.");}else toast("Already in favorites.");});
$("sendToImage").addEventListener("click",()=>{if(currentPrompt)$("imageIdea").value=$("ideaInput").value;showView("image");});

function buildImage(){
  const idea=$("imageIdea").value.trim();if(!idea){toast("Describe the image first.");$("imageIdea").focus();return;}
  const details=$("imageDetails").value.trim();
  const result=`Create a ${$("visualStyle").value.toLowerCase()} image.\n\nSUBJECT & SCENE\n${idea}\n\nVISUAL DIRECTION\n- Style: ${$("visualStyle").value}\n- Aspect ratio: ${$("aspect").value}\n- Lighting: ${$("lighting").value}\n- Composition: intentional framing, clear focal point, balanced visual hierarchy\n- Quality: refined details, coherent perspective, natural textures and professional finish\n${details?`\nADDITIONAL DETAILS\n${details}`:""}\n\nAVOID\nUnwanted text, watermarks, distorted anatomy, inconsistent objects, blurry details and visual clutter unless specifically requested.\n\nCreate a cohesive image that follows the brief closely.`;
  $("canvasPlaceholder").hidden=true;$("imageResult").hidden=false;$("imageResult").textContent=result;window.currentImagePrompt=result;toast("Image prompt prepared. Connect an image provider to render it.");
}
$("buildImagePrompt").addEventListener("click",buildImage);
$("copyImagePrompt").addEventListener("click",async()=>{if(!window.currentImagePrompt){toast("Build an image prompt first.");return;}try{await navigator.clipboard.writeText(window.currentImagePrompt);toast("Image prompt copied.");}catch{toast("Clipboard unavailable.");}});

function renderLibrary(){
  const query=($("librarySearch")?.value||"").toLowerCase(),filter=$("libraryFilter")?.value||"All categories";
  $("libraryGrid").innerHTML="";
  const filtered=promptData.filter(x=>(filter==="All categories"||x[0]===filter)&&x.join(" ").toLowerCase().includes(query));
  if(!filtered.length){$("libraryGrid").innerHTML='<div class="empty-state">No prompts found. Try another search.</div>';return;}
  filtered.forEach((item,i)=>{const card=document.createElement("article");card.className="library-card";card.innerHTML=`<span class="card-cat">${item[0].toUpperCase()}</span><h3>${item[1]}</h3><p>${item[2]}</p><button type="button">Use this prompt →</button>`;card.querySelector("button").addEventListener("click",()=>{showView("assistant");$("ideaInput").value=item[2];$("aiCategory").value=item[0]==="Image"?"Image Generation":item[0];makePrompt();});$("libraryGrid").appendChild(card);});
}
$("librarySearch").addEventListener("input",renderLibrary);$("libraryFilter").addEventListener("change",renderLibrary);

function renderHistory(){const box=$("historyList");box.innerHTML="";if(!historyItems.length){box.innerHTML='<div class="empty-state">No prompts yet. Create your first prompt in AI Assistant.</div>';return;}historyItems.forEach(item=>{const row=document.createElement("div");row.className="history-item";const p=document.createElement("p");p.textContent=item.text;const btn=document.createElement("button");btn.textContent="Copy";btn.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(item.text);toast("Copied.");}catch{toast("Clipboard unavailable.");}});row.append(p,btn);box.append(row);});}
function renderFavorites(){const box=$("favoritesList");box.innerHTML="";if(!favorites.length){box.innerHTML='<div class="empty-state">No favorites saved yet. Use the Save button on a generated prompt.</div>';return;}favorites.forEach(text=>{const row=document.createElement("div");row.className="history-item";const p=document.createElement("p");p.textContent=text;const btn=document.createElement("button");btn.textContent="Copy";btn.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(text);toast("Copied.");}catch{toast("Clipboard unavailable.");}});row.append(p,btn);box.append(row);});}
document.querySelectorAll(".template-card button").forEach(b=>b.addEventListener("click",()=>{showView("assistant");$("ideaInput").value=b.dataset.template;toast("Template added to prompt builder.");}));
renderLibrary();
