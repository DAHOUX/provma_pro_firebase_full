// Admin panel using modular Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-firestore.js";

let app, auth, db;
async function init(){
  if(typeof firebaseConfig === 'undefined'){
    document.getElementById('userInfo').textContent = 'firebase-config.js absent — copie ta config.';
    document.getElementById('btnSignIn').disabled = true;
    return;
  }
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  document.getElementById('btnSignIn').addEventListener('click', async ()=>{
    const provider = new GoogleAuthProvider();
    try{
      await signInWithPopup(auth, provider);
    }catch(e){ console.error(e); alert('Sign-in failed: '+e.message) }
  });
  document.getElementById('btnSignOut').addEventListener('click', ()=>signOut(auth));
  document.getElementById('addVideoForm').addEventListener('submit', addVideo);

  onAuthStateChanged(auth, user=>{
    if(user){
      document.getElementById('userInfo').innerHTML = `<strong>${user.displayName}</strong> — ${user.email}`;
      document.getElementById('btnSignIn').style.display = 'none';
      document.getElementById('btnSignOut').style.display = 'inline-block';
      document.getElementById('controls').style.display = 'block';
      loadAdminVideos();
    }else{
      document.getElementById('userInfo').textContent = 'Aucun utilisateur connecté';
      document.getElementById('btnSignIn').style.display = 'inline-block';
      document.getElementById('btnSignOut').style.display = 'none';
      document.getElementById('controls').style.display = 'none';
    }
  });
}

async function loadAdminVideos(){
  const q = query(collection(db, 'videos'), orderBy('order'));
  const snap = await getDocs(q);
  const el = document.getElementById('videosAdmin');
  el.innerHTML = '';
  snap.forEach(docSnap=>{
    const d = docSnap.data();
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<strong>${d.title}</strong> — <span>${d.views||0} vues</span>
      <div style="margin-top:8px">
        <button data-id="${docSnap.id}" class="btnReset">Réinitialiser à 0</button>
        <button data-id="${docSnap.id}" class="btnDelete">Supprimer</button>
      </div>
    `;
    el.appendChild(div);
  });
  // attach handlers
  document.querySelectorAll('.btnReset').forEach(b=>{
    b.addEventListener('click', async (e)=>{
      const id = e.currentTarget.dataset.id;
      await updateDoc(doc(db,'videos',id), { views: 0 });
      loadAdminVideos();
    });
  });
  document.querySelectorAll('.btnDelete').forEach(b=>{
    b.addEventListener('click', async (e)=>{
      const id = e.currentTarget.dataset.id;
      if(confirm('Supprimer la vidéo ?')){ await deleteDoc(doc(db,'videos',id)); loadAdminVideos(); }
    });
  });
}

async function addVideo(e){
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const src = document.getElementById('src').value.trim();
  if(!title||!src) return;
  // compute order value
  const snap = await getDocs(collection(db,'videos'));
  const order = snap.size + 1;
  await addDoc(collection(db,'videos'), { title, src, views: 0, order });
  document.getElementById('title').value=''; document.getElementById('src').value='';
  loadAdminVideos();
}

document.addEventListener('DOMContentLoaded', init);
