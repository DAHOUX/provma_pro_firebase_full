// Public app using Firebase modular SDK (v9+). This file expects firebase-config.js to define `firebaseConfig`.
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, getDocs, doc, runTransaction } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-firestore.js";

let app;
let db;
const fallbackVideos = [
  { id: 'vid1', title: 'Nature drone test 1', src: 'assets/sample-video-pro.mp4', views: 0 },
  { id: 'vid2', title: 'Nature drone test 2', src: 'assets/sample-video-pro.mp4', views: 0 }
];

function fallbackRender(videos){
  const cont = document.getElementById('video-list');
  cont.innerHTML = '';
  videos.forEach(v=>{
    const card = document.createElement('div');
    card.className = 'card video-card';
    card.innerHTML = `
      <video controls preload="metadata" src="${v.src}"></video>
      <div class="vmeta">
        <div class="title">${v.title}</div>
        <div class="views"><span id="views_${v.id}">${v.views}</span> vues</div>
      </div>
    `;
    card.querySelector('video').addEventListener('play', ()=>{
      // local increment for demo
      const el = document.getElementById('views_'+v.id);
      const n = parseInt(el.textContent||'0')+1;
      el.textContent = n;
    });
    cont.appendChild(card);
  });
}

async function initFirebase(){
  if(typeof firebaseConfig === 'undefined'){
    console.warn('firebaseConfig absent — affichage local');
    fallbackRender(fallbackVideos);
    return;
  }
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);

  // load videos collection
  const q = query(collection(db, 'videos'), orderBy('order'));
  const snap = await getDocs(q);
  const videos = [];
  snap.forEach(d=>videos.push({ id: d.id, ...d.data() }));
  renderVideos(videos);
}

function renderVideos(videos){
  const cont = document.getElementById('video-list');
  cont.innerHTML = '';
  videos.forEach(v=>{
    const card = document.createElement('div');
    card.className = 'card video-card';
    card.innerHTML = `
      <video controls preload="metadata" src="${v.src}"></video>
      <div class="vmeta">
        <div class="title">${v.title}</div>
        <div class="views"><span id="views_${v.id}">${v.views||0}</span> vues</div>
      </div>
    `;
    const vidEl = card.querySelector('video');
    vidEl.addEventListener('play', ()=>incrementViewCount(v.id));
    cont.appendChild(card);
  });
}

async function incrementViewCount(videoId){
  if(!db){
    // fallback local increment
    const el = document.getElementById('views_'+videoId);
    const n = parseInt(el.textContent||'0') + 1;
    el.textContent = n;
    return;
  }
  const vidRef = doc(db, 'videos', videoId);
  try{
    await runTransaction(db, async (tx)=>{
      const sf = await tx.get(vidRef);
      if(!sf.exists()){
        tx.set(vidRef, { views: 1 }, { merge: true });
        return;
      }
      const cur = sf.data().views || 0;
      tx.update(vidRef, { views: cur + 1 });
    });
    // update UI (optimistic read)
    const el = document.getElementById('views_'+videoId);
    if(el) el.textContent = String( (parseInt(el.textContent||'0') + 1) );
  }catch(err){
    console.error('Transaction failed', err);
  }
}

document.addEventListener('DOMContentLoaded', initFirebase);
