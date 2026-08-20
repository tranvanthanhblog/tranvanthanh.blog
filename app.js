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

      const div = document.createElement("div");
      div.className = "post";

      div.innerHTML = `
        <div class="thumb">
          ${
            thumbUrl
              ? `<img src="${thumbUrl}">`
              : ""
          }

        </div>
        <div class="post-info">
          <h3>${post.title}</h3>
          <div class="actions">
            <button class="pill like-btn">❤️ ${likeCount}</button>
            <button class="pill view-btn">Xem</button>
            ${
              currentUser && DB.isAdmin(currentUser)
                ? `<button class="pill edit-btn">Sửa</button><button class="pill danger delete-btn">Xóa</button>`
                : ""
            }
          </div>
        </div>
      `;

      div.querySelector(".like-btn").onclick = () => {
        if (!currentUser) {
          alert("Đăng nhập để tim bài viết");
          return;
        }
        DB.like(post.id, currentUser.uid);
      };

      div.querySelector(".view-btn").onclick = () => {
        localStorage.setItem("viewPost", post.id);
        location.href = "post.html";
      };

      const edit = div.querySelector(".edit-btn");
      if (edit) {
        edit.onclick = () => {
          location.href = "admin.html?edit=" + post.id;
        };
      }

      const del = div.querySelector(".delete-btn");
      if (del) {
        del.onclick = () => {
          DB.showConfirm("Xóa bài này?").then((ok) => {
            if (ok) DB.deletePost(post.id);
          });
        };
      }

      feed.appendChild(div);
    });
  });
}
