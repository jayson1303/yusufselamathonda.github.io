// ==========================================================================
// FIREBASE CONFIGURATION & INITIALIZATION
// YUSUF SELAMAT MOTOR HONDA
// ==========================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail,
  browserLocalPersistence,
  setPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where, 
  writeBatch, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { 
  getStorage, 
  ref, 
  uploadString, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// DEFAULT FIREBASE CONFIG
// Ganti nilai di bawah ini dengan kredensial dari Firebase Console Anda,
// atau gunakan menu 'Konfigurasi Firebase' di Admin Panel.
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDummyKeyReplaceWithActualFirebaseApiKey123",
  authDomain: "yusuf-selamat-motor.firebaseapp.com",
  projectId: "yusuf-selamat-motor",
  storageBucket: "yusuf-selamat-motor.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Ambil konfigurasi dari localStorage jika pernah disimpan oleh admin
export function getActiveFirebaseConfig() {
  try {
    const saved = localStorage.getItem("ysm_firebase_config");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Gagal membaca config dari localStorage:", e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

// Simpan custom config ke localStorage
export function saveCustomFirebaseConfig(config) {
  try {
    localStorage.setItem("ysm_firebase_config", JSON.stringify(config));
    return true;
  } catch (e) {
    console.error("Gagal menyimpan config ke localStorage:", e);
    return false;
  }
}

// Cek apakah config bukan dummy
export function isConfigured() {
  const cfg = getActiveFirebaseConfig();
  return cfg.apiKey && !cfg.apiKey.includes("Dummy") && cfg.projectId && cfg.projectId.length > 3;
}

// Initialize Firebase App
let app = null;
let auth = null;
let db = null;
let storage = null;
let initError = null;

try {
  const config = getActiveFirebaseConfig();
  app = initializeApp(config);
  auth = getAuth(app);
  // Pastikan sesi auth tersimpan di local persistence
  setPersistence(auth, browserLocalPersistence).catch(() => {});
  db = getFirestore(app);
  storage = getStorage(app);
} catch (err) {
  console.warn("Inisialisasi Firebase menggunakan config default/tersimpan:", err.message);
  initError = err;
}

export {
  app,
  auth,
  db,
  storage,
  initError,
  // Auth methods
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  // Firestore methods
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  writeBatch,
  serverTimestamp,
  // Storage methods
  ref,
  uploadString,
  getDownloadURL
};
