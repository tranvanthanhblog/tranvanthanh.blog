const $ = (id) => document.getElementById(id);
const provider = new firebase.auth.GoogleAuthProvider();

$("btnGoogle").onclick = () => {
  DB.auth.signInWithPopup(provider);
};

$("btnLogout").onclick = () => {
  DB.auth.signOut();
};

DB.auth.onAuthStateChanged((user) => {
  if (!user) {
    $("loginOverlay").classList.remove("hidden");
    $("btnLogout").classList.add("hidden");
    $("btnAdmin").classList.add("hidden");
    $("userInfo").textContent = "";
    return;
  }

  // Đã đăng nhập
  $("loginOverlay").classList.add("hidden");
  $("btnLogout").classList.remove("hidden");
  $("userInfo").textContent = user.displayName;

  // CHECK ADMIN
  if (DB.isAdmin(user.email)) {
    $("btnAdmin").classList.remove("hidden");
    $("btnAdmin").onclick = () => location.href = "admin.html";
  } else {
    $("btnAdmin").classList.add("hidden");
  }

  loadFeed(user);
});

// LOAD BÀI VIẾT
function loadFeed(user) {
  DB.onPosts((posts) => {
    const feed = $("feed");
    feed.innerHTML = "";

    posts.forEach((p) => {
      const liked = p.likes && p.likes[user.uid];
      const likeCount = p.likes ? Object.keys(p.likes).length : 0;

      const div = document.createElement("div");
      div.className = "post";

      div.innerHTML = `
        <div class="thumb">
          <img src="${p.thumb || ""}">
        </div>
        <div class="info">
          <h3>${p.title}</h3>
          <div class="actions">
            <span class="pill" id="like-${p.id}">❤️ ${likeCount}</span>
            <span class="pill" id="view-${p.id}">Xem</span>
            ${
              DB.isAdmin(user.email)
                ? `<span class="pill danger" id="del-${p.id}">Xóa</span>`
                : ""
            }
          </div>
        </div>
      `;

      feed.appendChild(div);

      // LIKE
      div.querySelector(`#like-${p.id}`).onclick = () => {
        DB.toggleLike(p.id, user.uid);
      };

      // XEM BÀI
      div.querySelector(`#view-${p.id}`).onclick = () => {
        localStorage.setItem("viewPost", p.id);
        location.href = "post.html";
      };

      // XÓA (ADMIN)
      if (DB.isAdmin(user.email)) {
        div.querySelector(`#del-${p.id}`).onclick = () => {
          if (confirm("Xóa bài viết này?")) {
            DB.deletePost(p.id);
          }
        };
      }
    });
  });
}
