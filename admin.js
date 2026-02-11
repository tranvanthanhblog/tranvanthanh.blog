const title = document.getElementById("title");
const thumb = document.getElementById("thumb");
const mediaUrl = document.getElementById("mediaUrl");
const content = document.getElementById("content");
const btnPublish = document.getElementById("btnPublish");


btnPublish.onclick = () => {

  const thumbLink = thumb.value.trim();
  const videoLink = mediaUrl.value.trim();

  

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

