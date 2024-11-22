import { initializeApp } from "firebase/app"

const firebaseConfig = {
  apiKey: "AIzaSyAUSHF3nEc3rbHIf59rgcRH3tL7eZdv5d0",
  authDomain: "spark-horizons.firebaseapp.com",
  projectId: "spark-horizons",
  storageBucket: "spark-horizons.firebasestorage.app",
  messagingSenderId: "133364967819",
  appId: "1:133364967819:web:85e5ba9fc35f344892a78e",
  measurementId: "G-ZXTFPJ7TPS"
};

const app = initializeApp(firebaseConfig);

export {
  app,
}