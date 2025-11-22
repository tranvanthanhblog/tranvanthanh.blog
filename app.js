const $ = (id) => document.getElementById(id);

const loginOverlay = $("loginOverlay");
const btnGoogle = $("btnGoogle");
const btnLogout = $("btnLogout");
const userInfo = $("userInfo");
const adminPanel = $("adminPanel");
const postTitle = $("postTitle");
const postDesc = $("postDesc");
const postMediaURL = $("postMediaURL"); // input URL thay cho file
const btnPublish = $("btnPublish");
const btnAddAdmin = $("btnAddAdmin");
const feed = $("feed");
const sortSel = $("sortSel");
const hero = $("hero");

// Tạo Google Auth provider chuẩn
const provider = new firebase.auth.GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/userinfo.profile");
provider.addScope("https://www.googleapis.com/auth/userinfo.email");

// Force login: show overlay when not authenticated
function requireLogin(show) {
  if (show) loginOverlay.classList.remove("hidden");
  else loginOverlay.classList.add("hidden");
}

// Login bằng popup Google
btnGoogle.onclick = async () => {
  try {
    await DB.auth.signInWithPopup(provider);
  } catch (e) {
    alert("Login error: " + e.message);
  }
};

// Logout
btnLogout.onclick = async () => {
  await DB.auth.signOut();
};

// Auth listener
DB.auth.onAuthStateChanged(async (user) => {
  if (!user) {
    userInfo.textContent = "";
    btnLogout.classList.add("hidden");
    requireLogin(true); // bắt buộc login để xem
    adminPanel.classList.add("hidden");
    feed.innerHTML = "";
  } else {
    requireLogin(false);
    userInfo.textContent = user.displayName + " (" + user.email + ")";
    btnLogout.classList.remove("hidden");

    // check admin bằng danh sách email hardcoded
    if (DB.isAdminEmail(user.email)) {
      adminPanel.classList.remove("hidden");
    } else {
      adminPanel.classList.add("hidden");
    }

    // start feed
    startFeed(sortSel.value);
  }
});

// Publish handler (dùng URL)
btnPublish.onclick = async () => {
  const user = DB.currentUser();
  if (!user) return alert("Bạn phải đăng nhập.");
  if (!DB.isAdminEmail(user.email)) return alert("Bạn không có quyền admin.");

  const title = postTitle.value.trim();
  if (!title) return alert("Thiếu tiêu đề");
  const mediaURL = postMediaURL.value.trim();
  if (!mediaURL) return alert("Chưa nhập URL media");

  btnPublish.disabled = true;
  btnPublish.textContent = "Đang đăng...";
  try {
    const payload = await DB.publishPost({
      title,
      desc: postDesc.value,
      mediaURL,
      author: user,
    });
    postTitle.value = "";
    postDesc.value = "";
    postMediaURL.value = "";
    alert("Đăng thành công!");
  } catch (e) {
    alert("Lỗi đăng: " + e.message);
  }
  btnPublish.disabled = false;
  btnPublish.textContent = "Đăng bài";
};

// Add admin email runtime
btnAddAdmin.onclick = () => {
  const email = prompt("Nhập Gmail cần cấp quyền admin (thêm vào runtime):");
  if (!email) return;
  DB.addAdminEmail(email);
  alert(
    "Đã thêm admin (runtime): " +
      email +
      "\nĐể lưu lâu dài hãy cài chức năng lưu vào DB."
  );
};

// Feed
let postUnsub = null;
function startFeed(order = "desc") {
  if (postUnsub) postUnsub();
  postUnsub = DB.onPosts(renderPosts, order);
}

function renderPosts(posts) {
  feed.innerHTML = "";
  posts.forEach((p) => feed.appendChild(makePostEl(p)));
}

function makePostEl(p) {
  const wrap = document.createElement("div");
  wrap.className = "post";

  // THUMB / MEDIA
  const thumb = document.createElement("div");
  thumb.className = "thumb";

  if (p.imageURL) {
    if (p.imageURL.match(/\.(jpeg|jpg|gif|png)$/i)) {
      const img = document.createElement("img");
      img.src = p.imageURL;
      img.alt = p.title || "thumb";
      thumb.appendChild(img);
    } else if (p.imageURL.match(/\.(mp4|webm)$/i)) {
      const video = document.createElement("video");
      video.src = p.imageURL;
      video.controls = true;
      video.width = 400;
      thumb.appendChild(video);
    } else {
      const a = document.createElement("a");
      a.href = p.imageURL;
      a.textContent = "Xem media";
      a.target = "_blank";
      thumb.appendChild(a);
    }
  }

  const meta = document.createElement("div");
  meta.className = "meta";
  const title = document.createElement("h3");
  title.className = "title";
  title.textContent = p.title;
  const desc = document.createElement("p");
  desc.className = "desc";
  desc.textContent = p.desc || "";
  const info = document.createElement("div");
  info.className = "small muted";
  info.textContent = `Đăng bởi ${p.author?.name || "Unknown"} • ${new Date(
    p.createdAt
  ).toLocaleString()}`;

  const actions = document.createElement("div");
  actions.className = "actions";

  // LIKE
  const likeBtn = document.createElement("div");
  likeBtn.className = "pill";
  likeBtn.textContent = `❤ ${p.likes || 0}`;
  likeBtn.style.cursor = "pointer";
  likeBtn.onclick = async () => {
    try {
      await DB.likePost(p.id);
    } catch (e) {
      alert("Lỗi like: " + e.message);
    }
  };

  // SHARE
  const shareBtn = document.createElement("div");
  shareBtn.className = "pill";
  shareBtn.textContent = "Share";
  shareBtn.style.cursor = "pointer";
  shareBtn.onclick = () => {
    const url = location.href + "#post=" + p.id;
    if (navigator.share) navigator.share({ title: p.title, text: p.desc, url });
    else {
      navigator.clipboard.writeText(url);
      alert("Link đã copy");
    }
  };

  // COMMENT
  const commentBtn = document.createElement("div");
  commentBtn.className = "pill";
  commentBtn.textContent = "Bình luận";
  commentBtn.style.cursor = "pointer";
  commentBtn.onclick = () => toggleComments(p.id, wrap);

  actions.appendChild(likeBtn);
  actions.appendChild(shareBtn);
  actions.appendChild(commentBtn);

  meta.appendChild(title);
  meta.appendChild(desc);
  meta.appendChild(info);
  meta.appendChild(actions);

  wrap.appendChild(thumb);
  wrap.appendChild(meta);

  // comments container
  const cmc = document.createElement("div");
  cmc.id = "cmc-" + p.id;
  cmc.style.marginTop = "10px";
  wrap.appendChild(cmc);

  return wrap;
}

// Toggle comments
function toggleComments(postId, parentEl) {
  const container = parentEl.querySelector("#cmc-" + postId);
  if (!container) return;
  if (container.innerHTML) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <input id="cname-${postId}" placeholder="Tên" style="flex:0 0 160px;padding:8px;border-radius:8px" />
      <input id="ctxt-${postId}" placeholder="Bình luận..." style="flex:1;padding:8px;border-radius:8px" />
      <button id="cbtn-${postId}" class="btn">Gửi</button>
    </div>
    <div id="clist-${postId}" class="small muted">Đang tải bình luận...</div>
  `;

  document.getElementById("cbtn-" + postId).onclick = async () => {
    const name =
      document.getElementById("cname-" + postId).value.trim() ||
      DB.currentUser()?.displayName ||
      "Khách";
    const text = document.getElementById("ctxt-" + postId).value.trim();
    if (!text) return alert("Nhập bình luận");
    try {
      await DB.addComment(postId, { name, text, avatar: "" });
      document.getElementById("ctxt-" + postId).value = "";
    } catch (e) {
      alert("Lỗi: " + e.message);
    }
  };

  DB.onComments(postId, (comments) => {
    const list = document.getElementById("clist-" + postId);
    list.innerHTML = "";
    if (!comments || comments.length === 0) {
      list.textContent = "Chưa có bình luận.";
      return;
    }
    comments.forEach((c) => {
      const div = document.createElement("div");
      div.className = "comment";
      const av = document.createElement("div");
      av.className = "avatar";
      const cb = document.createElement("div");
      cb.style.flex = "1";
      cb.innerHTML = `<strong>${escapeHtml(
        c.name
      )}</strong> <div class="small muted">${new Date(
        c.createdAt
      ).toLocaleString()}</div><div>${escapeHtml(c.text)}</div>`;

      const cur = DB.currentUser();
      if (cur && DB.isAdminEmail(cur.email)) {
        const del = document.createElement("button");
        del.className = "btn ghost";
        del.textContent = "Xóa";
        del.style.marginLeft = "8px";
        del.onclick = async () => {
          if (!confirm("Xóa bình luận này?")) return;
          try {
            await DB.deleteComment(postId, c.id);
          } catch (e) {
            alert("Lỗi: " + e.message);
          }
        };
        cb.appendChild(del);
      }

      div.appendChild(av);
      div.appendChild(cb);
      list.appendChild(div);
    });
  });
}

function escapeHtml(s) {
  return String(s).replace(
    /[&<>\"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
}

sortSel.onchange = () => startFeed(sortSel.value);

// initial: require login overlay until auth fires
requireLogin(true);
