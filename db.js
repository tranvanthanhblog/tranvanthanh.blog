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


/* ================= ADMIN ================= */

const ADMIN_EMAILS = [
  "tranduonglx2020@gmail.com",
  "tranvanthanhblog@gmail.com",
  "pvinh1895@gmail.com",
];

function isAdmin(user) {
  return user && ADMIN_EMAILS.includes(user.email);
}


/* ================= POST ================= */

function publish(post) {
  const id = Date.now();

  post.likes = {};
  post.comments = {};
  post.createdAt = Date.now();

  return db.ref("posts/" + id).set(post);
}

function getPost(id) {
  return db.ref("posts/" + id).once("value").then(s => s.val());
}

function onPosts(callback) {
  db.ref("posts").on("value", (snap) => {
    const data = snap.val() || {};
    const arr = Object.keys(data).map((id) => ({ id, ...data[id] }));
    arr.sort((a, b) => b.createdAt - a.createdAt);
    callback(arr);
  });
}

function deletePost(id) {
  return db.ref("posts/" + id).remove();
}


/* ================= LIKE ================= */

function like(postId, userId) {
  const ref = db.ref(`posts/${postId}/likes/${userId}`);
  ref.once("value", (snap) => {
    snap.exists() ? ref.remove() : ref.set(true);
  });
}


/* ================= COMMENT (NEW) ================= */

function addComment(postId, text, user) {
  const cid = Date.now();

  return db.ref(`posts/${postId}/comments/${cid}`).set({
    text,
    uid: user.uid,
    email: user.email,
    createdAt: Date.now()
  });
}

function onComments(postId, callback) {
  db.ref(`posts/${postId}/comments`).on("value", snap => {
    const data = snap.val() || {};
    const arr = Object.keys(data).map(id => ({
      id,
      ...data[id]
    }));
    arr.sort((a,b)=>a.createdAt-b.createdAt);
    callback(arr);
  });
}

function deleteComment(postId, cid) {
  return db.ref(`posts/${postId}/comments/${cid}`).remove();
}


/* ================= EXPORT ================= */

window.DB = {
  auth,
  isAdmin,
  publish,
  getPost,
  onPosts,
  like,
  deletePost,

  addComment,
  onComments,
  deleteComment
};
