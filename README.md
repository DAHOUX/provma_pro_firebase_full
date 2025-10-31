# PROVMA — Version PRO visuelle + Firebase intégrée (scaffold)

Contenu inclus:
- `index.html` — page publique responsive (dark theme), récupère les vidéos depuis Firestore collection `videos`. Lecture incrémente les vues via transaction Firestore.
- `admin.html` — panneau admin avec connexion Google (Firebase Auth), ajouter/supprimer vidéos et réinitialiser compteurs.
- `js/*.mod.js` — modules ES (importent Firebase CDN v9+). Pas de bundler nécessaire.
- `firebase-config.js` — **À remplacer** par la config de ton projet Firebase.
- `assets/sample-video-pro.mp4` — fichier de test (remplace par vidéos réelles).

## Mise en route rapide (local)
1. Dézippe `provma_pro_firebase.zip`.
2. Crée un projet Firebase (console).
3. Active Authentication → Sign-in method → Google.
4. Crée Firestore (mode production ou test selon ton usage).
5. Copie ta configuration Firebase dans `firebase-config.js` (const firebaseConfig = {...}).
6. (Optionnel) Ajoute des documents dans la collection `videos` :
   - id auto, champs: title (string), src (string), views (number), order (number)
7. Ouvre `index.html` et `admin.html` depuis un serveur local (ex `npx http-server` ou Live Server)
   Les modules importés via CDN demandent d'ouvrir depuis un vrai serveur (pas `file://`).

## Règles Firestore recommandées (exemple minimal)
Replace in Firebase Console → Firestore → Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /videos/{videoId} {
      // lecture ouverte, écriture réservée aux admins (auth + custom claim) — example:
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

Pour un premier test en local tu peux temporairement autoriser les écritures (NON recommandé en production).

## Tu veux que je:
- Initialise Firestore avec des vidéos de test automatiquement (je peux générer un script d'import).
- Génère les règles Cloud Functions ou scripts d'initialisation pour créer un admin.
- Prépare le ZIP prêt à déployer sur Firebase Hosting (index.html rewrite) — dis-moi.
