DB.auth.onAuthStateChanged((user) => {
  if (!user || !DB.isAdmin(user.email)) {
    alert("Không có quyền admin");
    location.href = "index.html";
    return;
  }
});

btnPublish.onclick = () => {
  DB.publish({
    title: title.value,
    thumb: thumb.value,
    media: media.value,
    content: content.value,
  }).then(() => {
    alert("Đã đăng bài thành công");
    location.href = "index.html";
  });
};
