const $ = (id) => document.getElementById(id);

const loginOverlay = $("loginOverlay");
const btnGoogle = $("btnGoogle");
const btnLogout = $("btnLogout");
const userInfo = $("userInfo");
const adminPanel = $("adminPanel");
const postTitle = $("postTitle");
const postDesc = $("postDesc");
const postMediaURL = $("postMediaURL");
const btnPublish = $("btnPublish");
const btnAddAdmin = $("btnAddAdmin");
const feed = $("feed");
const sortSel = $("sortSel");
const hero = $("hero");

const provider = new firebase.auth.GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/userinfo.profile");
provider.addScope("https://www.googleapis.com/auth/userinfo.email");

const loginBtn = document.getElementById("loginBtn");
const adminBtn = document.getElementById("adminBtn");

loginBtn.onclick = () => {
  auth.signInWithPopup(provider).catch((e) => alert(e.message));
};

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    adminBtn.style.display = "none";
    return;
  }

  const emailKey = user.email.replace(/\./g, "_");
  const snap = await db.ref("admins/" + emailKey).get();

  if (snap.exists()) {
    adminBtn.style.display = "inline-block";
  } else {
    adminBtn.style.display = "none";
  }
});

function requireLogin(show) {
  if (show) loginOverlay.classList.remove("hidden");
  else loginOverlay.classList.add("hidden");
}

btnGoogle.onclick = async () => {
  try {
    await DB.auth.signInWithPopup(provider);
  } catch (e) {
    alert("Login error: " + e.message);
  }
};

btnLogout.onclick = async () => {
  await DB.auth.signOut();
};

DB.auth.onAuthStateChanged((user) => {
  if (!user) {
    userInfo.textContent = "";
    btnLogout.classList.add("hidden");
    requireLogin(true);
    adminPanel.classList.add("hidden");
    feed.innerHTML = "";
  } else {
    requireLogin(false);
    userInfo.textContent = user.displayName + " (" + user.email + ")";
    btnLogout.classList.remove("hidden");

    if (DB.isAdminEmail(user.email)) {
      adminPanel.classList.remove("hidden");
    } else {
      adminPanel.classList.add("hidden");
    }

    startFeed(sortSel.value);
  }
});

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
    await DB.publishPost({
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

btnAddAdmin.onclick = () => {
  const email = prompt("Nhập Gmail cần cấp quyền admin (runtime):");
  if (!email) return;
  DB.addAdminEmail(email);
  alert(
    "Đã thêm admin (runtime): " + email + "\nĐể lưu lâu dài hãy thêm vào DB.",
  );
};

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
    p.createdAt,
  ).toLocaleString()}`;

  const actions = document.createElement("div");
  actions.className = "actions";

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

  const commentBtn = document.createElement("div");
  commentBtn.className = "pill";
  commentBtn.textContent = "Bình luận";
  commentBtn.style.cursor = "pointer";
  commentBtn.onclick = () => toggleComments(p.id, wrap);

  actions.appendChild(likeBtn);
  actions.appendChild(shareBtn);
  actions.appendChild(commentBtn);

  const cur = DB.currentUser();
  if (cur && DB.isAdminEmail(cur.email)) {
    const delPostBtn = document.createElement("button");
    delPostBtn.className = "btn ghost";
    delPostBtn.textContent = "Xóa bài";
    delPostBtn.style.marginLeft = "8px";
    delPostBtn.onclick = async () => {
      if (!confirm("Bạn có chắc muốn xóa bài này?")) return;
      try {
        await DB.deletePost(p.id);
        alert("Đã xóa bài!");
      } catch (e) {
        alert("Lỗi: " + e.message);
      }
    };
    actions.appendChild(delPostBtn);
  }

  meta.appendChild(title);
  meta.appendChild(desc);
  meta.appendChild(info);
  meta.appendChild(actions);
  wrap.appendChild(thumb);
  wrap.appendChild(meta);

  const cmc = document.createElement("div");
  cmc.id = "cmc-" + p.id;
  cmc.style.marginTop = "10px";
  wrap.appendChild(cmc);

  return wrap;
}

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
        c.name,
      )}</strong> <div class="small muted">${new Date(
        c.createdAt,
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
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

sortSel.onchange = () => startFeed(sortSel.value);

requireLogin(true);
