const params = new URLSearchParams(location.search);
const editId = params.get("edit");

DB.auth.onAuthStateChanged((user) => {
  if (!user) {
    alert("Vui lòng đăng nhập trước");
    location.href = "index.html";
    return;
  }

  if (!DB.isAdmin(user)) {
    alert("Không có quyền admin");
    location.href = "index.html";
    return;
  }

  console.log("Đã đăng nhập admin:", user.email);

  if (editId) {
    DB.getPost(editId, (post) => {
      if (!post) {
        alert("Không tìm thấy bài viết");
        location.href = "index.html";
        return;
      }
      title.value = post.title || "";
      thumb.value = post.thumb || "";
      media.value = post.media || "";
      content.value = post.content || "";

      pageTitle.textContent = "Chỉnh sửa bài viết";
      btnPublish.textContent = "Cập nhật bài viết";
    });
  }
});

btnPublish.onclick = () => {
  if (!title.value.trim() || !content.value.trim()) {
    alert("Vui lòng nhập tiêu đề và nội dung bài viết");
    return;
  }

  const data = {
    title: title.value,
    thumb: thumb.value,
    media: media.value,
    content: content.value,
  };

  const action = editId ? DB.updatePost(editId, data) : DB.publish(data);

  action
    .then(() => {
      alert(editId ? "Đã cập nhật bài viết" : "Đã đăng bài thành công");
      location.href = "index.html";
    })
    .catch((err) => alert("Lỗi: " + err.message));
};
