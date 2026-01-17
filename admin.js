const adminFeed = document.getElementById("adminFeed");

function publish() {
  const title = document.getElementById("title").value;
  const imageURL = document.getElementById("url").value;
  const desc = document.getElementById("desc").value;

  const id = "post_" + Date.now();

  db.ref("posts/" + id).set({
    id,
    title,
    imageURL,
    desc,
    createdAt: Date.now(),
  });
}

db.ref("posts").on("value", (snap) => {
  adminFeed.innerHTML = "";
  const data = snap.val() || {};
  Object.values(data).forEach((p) => {
    adminFeed.innerHTML += `
      <div>
        ${p.title}
        <button onclick="del('${p.id}')">❌ Xóa</button>
      </div>
    `;
  });
});

function del(id) {
  db.ref("posts/" + id).remove();
}
