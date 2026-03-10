import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAfMsolY3MoqVe2k50x7-imgHtEysB1uB4",
  authDomain: "meow-ccc20.firebaseapp.com",
  databaseURL: "https://meow-ccc20-default-rtdb.firebaseio.com",
  projectId: "meow-ccc20",
  storageBucket: "meow-ccc20.firebasestorage.app",
  messagingSenderId: "455166913919",
  appId: "1:455166913919:web:836ee6dd65d3e969e33e4a",
  measurementId: "G-0RLLECDCV8",
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
