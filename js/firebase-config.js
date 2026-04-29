(function () {
  if (!window.firebase) {
    console.error("Firebase SDK غير محمل");
    return;
  }

  const firebaseConfig = {
    apiKey: "AIzaSyDTQOvTrVteyFoxacYHxMNSmoCQBSF5pqc",
    authDomain: "quran-tracking-for-tutor-387ce.firebaseapp.com",
    projectId: "quran-tracking-for-tutor-387ce",
    storageBucket: "quran-tracking-for-tutor-387ce.firebasestorage.app",
    messagingSenderId: "1034262668810",
    appId: "1:1034262668810:web:40f9065973f7e8bdfd21f3",
  };

  window.firebaseApp = firebase.initializeApp(firebaseConfig);
  window.auth = firebase.auth();
  window.db = firebase.firestore();

  auth
    .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch((err) => console.error("Persistence error:", err));
})();
