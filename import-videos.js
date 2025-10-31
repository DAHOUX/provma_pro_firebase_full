/**
 * Node.js script to populate Firestore with sample videos
 * Usage: node import-videos.js
 * Make sure you have installed firebase-admin SDK and your service account JSON
 */
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // replace with your key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const videos = [
  { title: 'Nature Drone 1', src: 'assets/sample-video-pro.mp4', views: 0, order: 1 },
  { title: 'Nature Drone 2', src: 'assets/sample-video-pro.mp4', views: 0, order: 2 },
  { title: 'Forêt Mystique', src: 'assets/sample-video-pro.mp4', views: 0, order: 3 },
  { title: 'Rivière en montagne', src: 'assets/sample-video-pro.mp4', views: 0, order: 4 }
];

async function main(){
  for(const vid of videos){
    const docRef = db.collection('videos').doc();
    await docRef.set(vid);
    console.log('Added', vid.title);
  }
  console.log('Import terminé');
}

main().catch(console.error);
