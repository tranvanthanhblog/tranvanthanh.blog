const feed = document.getElementById("feed");

db.ref("posts").on("value", (snap) => {
  feed.innerHTML = "";
  const data = snap.val() || {};
  Object.values(data)
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((post) => {
      feed.innerHTML += `
        <div style="border:1px solid #ccc;margin:10px;padding:10px">
          <img src="${post.imageURL}" style="width:100%;max-height:200px;object-fit:cover">
          <h3>${post.title}</h3>
          <p>${post.desc}</p>
        </div>
      `;
    });
});
