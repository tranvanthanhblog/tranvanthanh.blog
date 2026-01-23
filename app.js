const feed = document.getElementById("feed");
const loginOverlay = document.getElementById("loginOverlay");
const btnGoogle = document.getElementById("btnGoogle");
const btnLogout = document.getElementById("btnLogout");
const btnAdmin = document.getElementById("btnAdmin");
const userInfo = document.getElementById("userInfo");

let currentUser = null;

// ĐĂNG NHẬP GOOGLE
btnGoogle.onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  DB.auth.signInWithPopup(provider);
};

// ĐĂNG XUẤT
btnLogout.onclick = () => {
  DB.auth.signOut();
};

// THEO DÕI TRẠNG THÁI ĐĂNG NHẬP
DB.auth.onAuthStateChanged((user) => {
  currentUser = user;

  if (user) {
    loginOverlay.classList.add("hidden");
    btnLogout.classList.remove("hidden");

    userInfo.textContent = "👋 " + user.displayName;

    // NẾU LÀ ADMIN → HIỆN NÚT ĐĂNG BÀI
    if (DB.isAdmin(user)) {
      btnAdmin.classList.remove("hidden");
      btnAdmin.onclick = () => {
        location.href = "admin.html";
      };
    } else {
      btnAdmin.classList.add("hidden");
    }
  } else {
    loginOverlay.classList.remove("hidden");
    btnLogout.classList.add("hidden");
    btnAdmin.classList.add("hidden");
    userInfo.textContent = "";
  }

  loadPosts();
});

// LOAD BÀI VIẾT
function loadPosts() {
  DB.onPosts((posts) => {
    feed.innerHTML = "";

    posts.forEach((post) => {
      const likeCount = post.likes ? Object.keys(post.likes).length : 0;
      const img = post.media || post.thumb || "";

      const div = document.createElement("div");
      div.className = "post";

      div.innerHTML = `
        <div class="thumb">
          ${img ? `<img src="${img}">` : ""}
        </div>
        <div class="post-info">
          <h3>${post.title}</h3>
          <div class="actions">
            <button class="pill like-btn">❤️ ${likeCount}</button>
            <button class="pill view-btn">Xem</button>
            ${
              currentUser && DB.isAdmin(currentUser)
                ? `<button class="pill danger delete-btn">Xóa</button>`
                : ""
            }
          </div>
        </div>
      `;

      // LIKE
      div.querySelector(".like-btn").onclick = () => {
        if (!currentUser) {
          alert("Đăng nhập để tim bài viết");
          return;
        }
        DB.like(post.id, currentUser.uid);
      };

      // XEM CHI TIẾT
      div.querySelector(".view-btn").onclick = () => {
        localStorage.setItem("viewPost", post.id);
        location.href = "post.html";
      };

      // XÓA (ADMIN)
      const del = div.querySelector(".delete-btn");
      if (del) {
        del.onclick = () => {
          if (confirm("Xóa bài này?")) {
            DB.deletePost(post.id);
          }
        };
      }

      feed.appendChild(div);
    });
  });
}
