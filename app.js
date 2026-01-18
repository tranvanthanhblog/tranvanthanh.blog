const $ = (id) => document.getElementById(id);
const provider = new firebase.auth.GoogleAuthProvider();

$("btnGoogle").onclick = () => DB.auth.signInWithPopup(provider);
$("btnLogout").onclick = () => DB.auth.signOut();

DB.auth.onAuthStateChanged((user) => {
  $("feed").innerHTML = "";
  $("btnAdmin").classList.add("hidden");
  $("btnLogout").classList.add("hidden");

  if (!user) {
    $("loginOverlay").classList.remove("hidden");
    return;
  }

  $("loginOverlay").classList.add("hidden");
  $("btnLogout").classList.remove("hidden");
  $("userInfo").textContent = user.displayName;

  if (DB.isAdmin(user.email)) {
    $("btnAdmin").classList.remove("hidden");
    $("btnAdmin").onclick = () => (location.href = "admin.html");
  }

  DB.onPosts(renderPosts);
});

function renderPosts(posts) {
  const feed = $("feed");
  feed.innerHTML = "";

  const isAdmin = DB.isAdmin(DB.auth.currentUser.email);

  posts.forEach((p) => {
    const div = document.createElement("div");
    div.className = "post";

    div.innerHTML = `
      <div class="thumb"><img src="${p.thumb}"></div>
      <div class="meta">
        <h3>${p.title}</h3>
        <div class="actions">
          <div class="pill" onclick="DB.like('${p.id}')">❤ ${p.likes || 0}</div>
          ${isAdmin ? `<div class="pill danger" onclick="DB.deletePost('${p.id}')">❌ Xóa</div>` : ""}
        </div>
      </div>
    `;
    feed.appendChild(div);
  });
}
