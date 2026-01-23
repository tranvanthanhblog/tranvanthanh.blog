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
];

function isAdmin(user) {
  return user && ADMIN_EMAILS.includes(user.email);
}

// Đăng bài
function publish(post) {
  const id = Date.now();
  post.likes = {};
  post.createdAt = Date.now();
  return db.ref("posts/" + id).set(post);
}

// Lắng nghe bài viết
function onPosts(callback) {
  db.ref("posts").on("value", (snap) => {
    const data = snap.val() || {};
    const arr = Object.keys(data).map((id) => ({ id, ...data[id] }));
    arr.sort((a, b) => b.createdAt - a.createdAt);
    callback(arr);
  });
}

// ❤️ Like – mỗi tài khoản chỉ được 1 lần (bấm lại là bỏ tim)
function like(postId, userId) {
  const ref = db.ref(`posts/${postId}/likes/${userId}`);
  ref.once("value", (snap) => {
    if (snap.exists()) {
      // đã tim → bỏ tim
      ref.remove();
    } else {
      // chưa tim → thêm tim
      ref.set(true);
    }
  });
}

// Xóa bài
function deletePost(id) {
  return db.ref("posts/" + id).remove();
}

// Xóa comment
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
