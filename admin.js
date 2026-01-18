DB.auth.onAuthStateChanged((user) => {
  if (!user || !DB.isAdmin(user.email)) {
    alert("Không có quyền admin");
    location.href = "index.html";
  }
});

btnPublish.onclick = () => {
  const id = "post_" + Date.now();
  DB.publish({
    id,
    title: title.value,
    thumb: thumb.value,
    media: media.value,
    content: content.value,
    likes: 0,
    createdAt: Date.now(),
  }).then(() => alert("Đã đăng bài"));
};
