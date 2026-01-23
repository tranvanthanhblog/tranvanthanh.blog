
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  databaseURL: "YOUR_DB_URL",
  projectId: "YOUR_PROJECT_ID",
};
firebase.initializeApp(firebaseConfig);

const DB = {};
DB.auth = firebase.auth();
DB.db = firebase.database();

// ===== DANH SÁCH ADMIN =====
DB.admins = [
  "admin@gmail.com",
  "tranduonglx2020@gmail.com",
  "tranvanthanhblog@gmail.com",
];

// CHECK ADMIN
DB.isAdmin = (email) => {
  return DB.admins.includes(email);
};

// LẤY BÀI VIẾT
DB.onPosts = (cb) => {
  DB.db.ref("posts").on("value", (snap) => {
    const data = snap.val() || {};
    const arr = Object.keys(data).map((id) => ({ id, ...data[id] }));
    arr.sort((a, b) => b.time - a.time);
    cb(arr);
  });
};

// ĐĂNG BÀI
DB.publish = (post) => {
  const id = DB.db.ref().child("posts").push().key;
  return DB.db.ref("posts/" + id).set({
    ...post,
    time: Date.now(),
    likes: {},
    comments: {},
  });
};

// XÓA BÀI
DB.deletePost = (id) => {
  return DB.db.ref("posts/" + id).remove();
};

// LIKE – MỖI TÀI KHOẢN CHỈ 1 LẦN
DB.toggleLike = (postId, uid) => {
  const ref = DB.db.ref(`posts/${postId}/likes/${uid}`);
  return ref.once("value").then((snap) => {
    if (snap.exists()) {
      ref.remove(); // bỏ like
    } else {
      ref.set(true); // thêm like
    }
  });
};
