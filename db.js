const DB = (function () {
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
  const storage = firebase.storage();
  const ADMIN_EMAILS = [
    "tranduonglx2020@gmail.com",
    "tranvanthanhblog@gmail.com",
  ];

  // Helpers
  function currentUser() {
    return auth.currentUser;
  }
  async function deletePost(postId) {
    if (!postId) throw new Error("postId không hợp lệ");
    await db.ref("/posts/" + postId).remove();

    await db.ref("/comments/" + postId).remove();
  }

  async function publishPost({ title, desc, mediaURL, author }) {
    if (!mediaURL || !title) throw new Error("Vui lòng nhập URL và tiêu đề");
    const id =
      "post_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    const payload = {
      id,
      title: title,
      desc: desc || "",
      imageURL: mediaURL,
      author: { name: author.displayName || author.email, email: author.email },
      likes: 0,
      createdAt: Date.now(),
      comments: {},
    };
    await db.ref("/posts/" + id).set(payload);
    return payload;
  }

  function onPosts(callback, order = "desc") {
    const ref = db.ref("/posts");

    const q = ref.orderByChild("createdAt");
    q.on("value", (snap) => {
      const data = snap.val() || {};
      const arr = Object.values(data);
      arr.sort((a, b) =>
        order === "desc"
          ? b.createdAt - a.createdAt
          : a.createdAt - b.createdAt,
      );
      callback(arr);
    });
    return () => q.off();
  }

  async function likePost(postId) {
    const ref = db.ref("/posts/" + postId + "/likes");
    await ref.transaction((current) => (current || 0) + 1);
  }

  async function addComment(postId, { name, text, avatar = "" }) {
    const ref = db.ref(`/posts/${postId}/comments`);
    const newRef = ref.push();
    await newRef.set({
      id: newRef.key,
      name,
      text,
      avatar,
      createdAt: Date.now(),
    });
  }

  function onComments(postId, callback) {
    const ref = db.ref(`/posts/${postId}/comments`).orderByChild("createdAt");
    ref.on("value", (snap) => {
      const val = snap.val() || {};
      const arr = Object.values(val).sort((a, b) => b.createdAt - a.createdAt);
      callback(arr);
    });
    return () => ref.off();
  }

  async function deleteComment(postId, commentId) {
    await db.ref(`/posts/${postId}/comments/${commentId}`).remove();
  }

  // Admin check
  function isAdminEmail(email) {
    if (!email) return false;
    return ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(
      String(email).toLowerCase(),
    );
  }

  function addAdminEmail(email) {
    ADMIN_EMAILS.push(email.toLowerCase());
  }

  return {
    auth,
    db,
    storage,
    publishPost,
    onPosts,
    likePost,
    addComment,
    onComments,
    deleteComment,
    currentUser,
    isAdminEmail,
    addAdminEmail,
  };
})();
