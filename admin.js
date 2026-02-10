const title = document.getElementById("title");
const thumb = document.getElementById("thumb");
const mediaUrl = document.getElementById("mediaUrl");
const content = document.getElementById("content");
const btnPublish = document.getElementById("btnPublish");


btnPublish.onclick = () => {

  const thumbLink = thumb.value.trim();
  const videoLink = mediaUrl.value.trim();

  // ⭐ kiểm tra ảnh
  if (!thumbLink.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
    alert("Thumbnail phải là LINK ẢNH (.jpg .png ...)");
    return;
  }

  // ⭐ kiểm tra video
  if (!videoLink.match(/\.mp4/i)) {
    alert("Media phải là LINK VIDEO .mp4");
    return;
  }

  DB.publish({
    title: title.value,
    thumb: thumbLink,
    media: videoLink,
    content: content.value
  })
  .then(()=>{
    alert("Đăng thành công!");
    location.href = "index.html";
  });

};
