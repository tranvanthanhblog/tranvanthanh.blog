const feed = document.getElementById("feed");
const loginOverlay = document.getElementById("loginOverlay");
const btnGoogle = document.getElementById("btnGoogle");
const btnLogout = document.getElementById("btnLogout");
const btnAdmin = document.getElementById("btnAdmin");
const userInfo = document.getElementById("userInfo");

const profileOverlay = document.getElementById("profileOverlay");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const btnSaveProfile = document.getElementById("btnSaveProfile");
const btnCloseProfile = document.getElementById("btnCloseProfile");

let currentUser = null;

btnGoogle.onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  DB.auth.signInWithPopup(provider);
};

btnLogout.onclick = () => {
  DB.auth.signOut();
};

if (userInfo && profileOverlay && profileName && profileEmail) {
  userInfo.onclick = () => {
    if (!currentUser) return;
    profileName.value = currentUser.displayName || "";
    profileEmail.textContent = currentUser.email || "";
    profileOverlay.classList.remove("hidden");
  };

  profileOverlay.onclick = (e) => {
    if (e.target === profileOverlay) profileOverlay.classList.add("hidden");
  };

  if (btnCloseProfile) {
    btnCloseProfile.onclick = () => {
      profileOverlay.classList.add("hidden");
    };
  }

  if (btnSaveProfile) {
    btnSaveProfile.onclick = () => {
      const newName = profileName.value.trim();
      if (!newName) {
        alert("Vui lòng nhập tên hiển thị");
        return;
      }

      currentUser
        .updateProfile({ displayName: newName })
        .then(() => {
          userInfo.textContent = "Xin chào " + newName;
          profileOverlay.classList.add("hidden");
        })
        .catch((err) => alert("Lỗi: " + err.message));
    };
  }
}

DB.auth.onAuthStateChanged((user) => {
  currentUser = user;

  if (user) {
    loginOverlay.classList.add("hidden");
    btnLogout.classList.remove("hidden");

    userInfo.textContent = "Xin chào " + user.displayName;

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

function loadPosts() {
  DB.onPosts((posts) => {
    feed.innerHTML = "";

    posts.forEach((post) => {
      const likeCount = post.likes ? Object.keys(post.likes).length : 0;
      const thumbUrl = post.thumb || "";
      const isAdminViewer = currentUser && DB.isAdmin(currentUser);

      const div = document.createElement("div");
      div.className = "post";

      div.innerHTML = `
        <div class="yt-thumb">
          ${thumbUrl ? `<img src="${esc(thumbUrl)}">` : ""}
        </div>
        <div class="yt-meta">
          <div class="yt-info">
            <h3 class="yt-title">${esc(post.title)}</h3>
            <div class="yt-stats">${
              post.createdAt ? timeAgo(post.createdAt) + " • " : ""
            }❤️ ${likeCount} lượt thích</div>
          </div>
          ${
            isAdminViewer
              ? `<div class="yt-menu-wrap">
                  <button class="yt-menu-btn">⋮</button>
                  <div class="yt-menu hidden">
                    <button class="yt-menu-edit">Chỉnh sửa</button>
                    <button class="yt-menu-delete danger-text">Xóa</button>
                  </div>
                </div>`
              : ""
          }
        </div>
      `;

      const goToPost = () => {
        location.href = "post.html?id=" + post.id;
      };

      div.querySelector(".yt-thumb").onclick = goToPost;
      div.querySelector(".yt-title").onclick = goToPost;

      const menuBtn = div.querySelector(".yt-menu-btn");
      const menu = div.querySelector(".yt-menu");
      if (menuBtn) {
        menuBtn.onclick = (e) => {
          e.stopPropagation();
          document.querySelectorAll(".yt-menu").forEach((m) => {
            if (m !== menu) m.classList.add("hidden");
          });
          menu.classList.toggle("hidden");
        };
      }

      const editBtn = div.querySelector(".yt-menu-edit");
      if (editBtn) {
        editBtn.onclick = (e) => {
          e.stopPropagation();
          location.href = "admin.html?edit=" + post.id;
        };
      }

      const deleteBtn = div.querySelector(".yt-menu-delete");
      if (deleteBtn) {
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
          DB.showConfirm("Xóa bài này?").then((ok) => {
            if (ok) DB.deletePost(post.id);
          });
        };
      }

      feed.appendChild(div);
    });
  });
}

document.addEventListener("click", () => {
  document.querySelectorAll(".yt-menu").forEach((m) => m.classList.add("hidden"));
});

function esc(str) {
  const d = document.createElement("div");
  d.textContent = str ?? "";
  return d.innerHTML;
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "Vừa xong";
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  const years = Math.floor(months / 12);
  return `${years} năm trước`;
}
