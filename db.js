const firebaseConfig = {
  apiKey: "AIzaSyAzjaxooCExUs3dpBb7phafkgZ1HHXXDrE",
  authDomain: "tran-van-thanh-blog-8f26b.firebaseapp.com",
  databaseURL:
    "https://tran-van-thanh-blog-8f26b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tran-van-thanh-blog-8f26b",
  storageBucket: "tran-van-thanh-blog-8f26b.firebasestorage.app",
  appId: "1:1096525048984:web:3eac53627959c8bf39f4ed",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

const ADMIN_EMAILS = [
  "tranduonglx2020@gmail.com",
  "tranvanthanhblog@gmail.com",
  "pvinh1895@gmail.com",
];

function isAdmin(email) {
  return ADMIN_EMAILS.includes(email);
}

function publish(data) {
  const id = Date.now();
  return db.ref("posts/" + id).set({
    ...data,
    createdAt: Date.now(),
    likes: 0,
  });
}

function onPosts(cb) {
  db.ref("posts").on("value", (s) => {
    const data = s.val() || {};
    const posts = Object.entries(data)
      .map(([id, p]) => ({ id, ...p }))
      .sort((a, b) => b.createdAt - a.createdAt);
    cb(posts);
  });
}

function like(id) {
  db.ref("posts/" + id + "/likes").transaction((v) => (v || 0) + 1);
}

function deletePost(id) {
  return db.ref("posts/" + id).remove();
}

function deleteComment(pid, cid) {
  return db.ref(`posts/${pid}/comments/${cid}`).remove();
}

window.DB = {
  auth,
  isAdmin,
  publish,
  onPosts,
  like,
  deletePost,
  deleteComment,
};

