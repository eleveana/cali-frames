const products=[{name:'Solana Beach',slug:'solana-beach',region:'San Diego'},{name:'Oceanside',slug:'oceanside',region:'San Diego'},{name:'Cabrillo',slug:'cabrillo',region:'San Diego'},{name:'Newport',slug:'newport',region:'Orange County'},{name:'Redondo',slug:'redondo',region:'Los Angeles'},{name:'San Clemente',slug:'san-clemente',region:'Orange County'},{name:'Riverside',slug:'riverside',region:'Inland'},{name:'Dana Point',slug:'dana-point',region:'Orange County'},{name:'Del Mar',slug:'del-mar',region:'San Diego'},{name:'Laguna Beach',slug:'laguna-beach',region:'Orange County'},{name:'La Jolla',slug:'la-jolla',region:'San Diego'},{name:'Carlsbad',slug:'carlsbad',region:'San Diego'},{name:'Encinitas',slug:'encinitas',region:'San Diego'},{name:'Cardiff',slug:'cardiff',region:'San Diego'},{name:'Torrey Pines',slug:'torrey-pines',region:'San Diego'}];
const FRAMES=['Oak frame','Black frame','White frame','Unframed print'];
const arrow='<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="display:inline-block;vertical-align:-.12em;flex-shrink:0"><path d="M7 17 17 7M7 7h10v10"/></svg>';
const $=s=>document.querySelector(s);
let region='All',selected,catalog=new Map();

// Picks are shared with the custom poster page through localStorage.
// City picks with a variantId (and custom posters) check out on Shopify;
// city picks without one are still sent as an email inquiry.
let picks=loadPicks();
function loadPicks(){
  try{
    const saved=JSON.parse(localStorage.getItem('califrames-picks')||'[]');
    if(Array.isArray(saved))return saved.filter(x=>x&&(x.custom?Array.isArray(x.attributes):products.some(p=>p.slug===x.slug)&&FRAMES.includes(x.frame)));
  }catch{}
  return[];
}
function savePicks(){
  $('#count').textContent=picks.length;
  try{localStorage.setItem('califrames-picks',JSON.stringify(picks))}catch{}
}
const productFor=slug=>products.find(p=>p.slug===slug);
const shopifyFor=slug=>findProduct(catalog,slug);

function render(){
  const q=$('#search').value.trim().toLowerCase();
  const shown=products.filter(p=>(region==='All'||p.region===region)&&p.name.toLowerCase().includes(q));
  $('#grid').innerHTML=shown.map(p=>{
    const sp=shopifyFor(p.slug);
    const price=sp?` · from ${money(Math.min(...sp.variants.map(v=>v.price)))}`:'';
    return`<button class="card" data-slug="${p.slug}" aria-label="View ${p.name} poster"><div class="card-art"><img src="assets/${p.slug}-hq.webp" alt="${p.name} illustrated California poster" loading="lazy" width="1448" height="2048"></div><div class="card-title">${p.name}<span aria-hidden="true">${arrow}</span></div><small>${p.region} · California city series${price}</small></button>`;
  }).join('');
  $('#result-count').textContent=`${shown.length} ${shown.length===1?'place':'places'} to love`;
  $('#empty').hidden=shown.length>0;
}
$('.filters').addEventListener('click',e=>{
  if(!e.target.matches('button'))return;
  region=e.target.dataset.region;
  document.querySelectorAll('.filters button').forEach(b=>b.classList.toggle('active',b===e.target));
  render();
});
$('#search').addEventListener('input',render);

function updatePrice(){
  const sp=shopifyFor(selected.slug);
  if(!sp)return;
  const v=sp.variants.find(v=>v.id===$('#size').value);
  $('#add').innerHTML=`Add to cart — ${money(v.price)} +`;
}
$('#size').addEventListener('change',updatePrice);

$('#grid').addEventListener('click',e=>{
  const c=e.target.closest('.card');
  if(!c)return;
  selected=productFor(c.dataset.slug);
  const sp=shopifyFor(selected.slug);
  $('#product-title').textContent=selected.name;
  $('#product-region').textContent=selected.region+' · CALIFORNIA';
  $('#product-description').textContent=`A little ${selected.name}, for wherever you call home. Part of our colorful California city poster collection.`;
  $('#product-img').src=`assets/${selected.slug}-hq.webp`;
  $('#product-img').alt=selected.name+' poster artwork preview';
  $('#frame').value='Oak frame';
  $('#size-field').hidden=!sp;
  if(sp){
    $('#size').innerHTML=sp.variants.map(v=>`<option value="${v.id}">${v.title} — ${money(v.price)}</option>`).join('');
    $('#product-fine').textContent='Secure checkout through Shopify. We’ll be in touch about shipping or pickup.';
    updatePrice();
  }else{
    $('#product-fine').textContent='Pricing, size, frame availability, and fulfillment confirmed by email. Product previews show the artwork.';
    $('#add').textContent='Add to your picks +';
  }
  $('#product').showModal();
});

$('#add').addEventListener('click',()=>{
  const sp=shopifyFor(selected.slug);
  const pick={slug:selected.slug,frame:$('#frame').value};
  if(sp){
    const v=sp.variants.find(v=>v.id===$('#size').value);
    Object.assign(pick,{variantId:v.id,size:v.title,price:v.price});
  }
  picks.push(pick);
  savePicks();
  $('#product').close();
  $('#toast').textContent=`${selected.name} added to your ${sp?'cart':'picks'}`;
  $('#toast').classList.add('visible');
  setTimeout(()=>$('#toast').classList.remove('visible'),2500);
});

const isOnline=x=>x.custom||x.variantId;
function customPrice(){
  const cp=catalog.get(CUSTOM_POSTER_HANDLE);
  return cp?cp.variants[0].price:null;
}
function renderBag(){
  const root=$('#bag-items');
  root.replaceChildren();
  $('#bag-error').hidden=true;
  if(!picks.length){
    const p=document.createElement('p');
    p.textContent='Your next happy place is waiting. Explore the collection and add a city you love.';
    root.append(p);
  }
  picks.forEach((item,i)=>{
    const row=document.createElement('div');
    if(item.custom){
      const price=customPrice();
      row.innerHTML=`<div class="custom-thumb" aria-hidden="true">✦</div><p></p><button data-remove="${i}">Remove</button>`;
      row.querySelector('p').append(item.title||'Custom poster',Object.assign(document.createElement('small'),{textContent:`Designed just for you${price?' · '+money(price):''}`}));
      row.querySelector('button').setAttribute('aria-label','Remove custom poster');
    }else{
      const p=productFor(item.slug);
      const detail=item.variantId?`${item.size} · ${item.frame} · ${money(item.price)}`:`${item.frame} · price by email`;
      row.innerHTML=`<img src="assets/${p.slug}-hq.webp" alt="${p.name} poster"><p>${p.name}<small>${detail}</small></p><button data-remove="${i}" aria-label="Remove ${p.name}">Remove</button>`;
    }
    root.append(row);
  });

  const online=picks.filter(isOnline),email=picks.filter(x=>!isOnline(x));
  const total=online.reduce((n,x)=>n+(x.custom?customPrice()||0:x.price),0);
  $('#checkout').hidden=!online.length;
  $('#checkout').innerHTML=`Check out${total?' — '+money(total):''} ${arrow}`;
  $('#email-order').hidden=!email.length;
  $('#bag-fine').textContent=email.length&&online.length
    ?'Checkout covers your cart items. Cities marked “price by email” aren’t in the online shop yet, so email those and we’ll confirm the details.'
    :email.length?'This is an order inquiry. We’ll confirm the details and total before payment.'
    :online.length?'Secure checkout through Shopify. Taxes and shipping are calculated at checkout.':'';
  const body='Hi Califrames! I’m interested in these posters:\n\n'+email.map(x=>productFor(x.slug).name+' — '+x.frame).join('\n')+'\n\nPlease send me available sizes, pricing, and pickup or delivery options.\n\nThank you!';
  $('#email-order').href='mailto:hello@califrames.com?subject='+encodeURIComponent('My Califrames poster selection')+'&body='+encodeURIComponent(body);
}

$('#checkout').addEventListener('click',async()=>{
  const btn=$('#checkout');
  btn.disabled=true;
  try{
    await loadCatalog();
    const custom=catalog.get(CUSTOM_POSTER_HANDLE);
    const lines=picks.filter(isOnline).map(x=>x.custom
      ?{variantId:custom.variants[0].id,attributes:x.attributes}
      :{variantId:x.variantId,attributes:[{key:'Frame',value:x.frame}]});
    const cart=await createCheckout(lines);
    try{localStorage.setItem('califrames-checkout-cart',cart.id)}catch{}
    location.href=cart.url;
  }catch(err){
    console.error('Checkout failed',err);
    $('#bag-error').textContent='We couldn’t start checkout. Please try again, or email hello@califrames.com and we’ll help.';
    $('#bag-error').hidden=false;
    btn.disabled=false;
  }
});
function openBag(){renderBag();$('#bag').showModal()}
$('#open-bag').addEventListener('click',openBag);
$('#bag-items').addEventListener('click',e=>{
  const b=e.target.closest('[data-remove]');
  if(!b)return;
  picks.splice(Number(b.dataset.remove),1);
  savePicks();
  renderBag();
});
$('#keep-shopping').addEventListener('click',()=>{$('#bag').close();$('#collection').scrollIntoView({behavior:'smooth'})});
document.querySelectorAll('dialog').forEach(d=>{
  d.querySelector('.close').addEventListener('click',()=>d.close());
  d.addEventListener('click',e=>{
    if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}
  });
});
window.addEventListener('pageshow',e=>{if(e.persisted)$('#checkout').disabled=false});

// After an order is placed, drop the items that were checked out.
async function clearCompletedCheckout(){
  let id;
  try{id=localStorage.getItem('califrames-checkout-cart')}catch{}
  if(!id||!await cartIsCompleted(id))return;
  picks=picks.filter(x=>!isOnline(x));
  savePicks();
  try{localStorage.removeItem('califrames-checkout-cart')}catch{}
}

render();
savePicks();
if(new URLSearchParams(location.search).has('cart'))openBag();
clearCompletedCheckout().catch(err=>console.error('Cart check failed',err));
loadCatalog().then(c=>{
  catalog=c;
  render();
  if($('#bag').open)renderBag();
}).catch(err=>console.error('Shopify catalog unavailable, using email orders',err));
