const postList = document.getElementById("post-list");

let currentUser = null;

DB.auth.onAuthStateChanged((user) => {
  currentUser = user;
  loadPosts();
});

function loadPosts() {
  DB.onPosts((posts) => {
    postList.innerHTML = "";

    posts.forEach((post) => {
      const likeCount = post.likes ? Object.keys(post.likes).length : 0;

      // LẤY ẢNH ĐÚNG (ảnh trong bài, không phải thumbnail lỗi)
      const img = post.image || post.thumbnail || "";

      const div = document.createElement("div");
      div.className = "post-item";

      div.innerHTML = `
        <img src="${img}" class="thumb">
        <div class="post-info">
          <h3>${post.title}</h3>
          <div class="actions">
            <button class="like-btn">❤️ ${likeCount}</button>
            <button class="view-btn">Xem</button>
            ${
              currentUser && DB.isAdmin(currentUser)
                ? `<button class="delete-btn">Xóa</button>`
                : ""
            }
          </div>
        </div>
      `;

      // Like
      div.querySelector(".like-btn").onclick = () => {
        if (!currentUser) {
          alert("Đăng nhập để tim bài viết");
          return;
        }
        DB.like(post.id, currentUser.uid);
      };

      // Xem chi tiết
      div.querySelector(".view-btn").onclick = () => {
        openPost(post);
      };

      // Xóa
      const del = div.querySelector(".delete-btn");
      if (del) {
        del.onclick = () => {
          if (confirm("Xóa bài này?")) {
            DB.deletePost(post.id);
          }
        };
      }

      postList.appendChild(div);
    });
  });
}

// MỞ BÀI VIẾT CHI TIẾT
function openPost(post) {
  const container = document.getElementById("main");

  // GIỮ XUỐNG DÒNG ĐÚNG NHƯ LÚC VIẾT
  const contentHTML = post.content
    ? post.content.replace(/\n/g, "<br>")
    : "";

  container.innerHTML = `
    <button onclick="location.reload()">← Quay lại</button>
    <h2>${post.title}</h2>
    <img src="${post.image}" class="full-img">
    <div class="post-content">${contentHTML}</div>
  `;
}
