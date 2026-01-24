DB.auth.onAuthStateChanged((user) => {
  // CHƯA ĐĂNG NHẬP
  if (!user) {
    alert("Vui lòng đăng nhập trước");
    location.href = "index.html";
    return;
  }

  // KHÔNG PHẢI ADMIN
  if (!DB.isAdminEmail(user.email)) {
    alert("Không có quyền admin");
    location.href = "index.html";
    return;
  }

  // NẾU ĐÚNG ADMIN → CHO Ở LẠI TRANG
  console.log("Đã đăng nhập admin:", user.email);
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

