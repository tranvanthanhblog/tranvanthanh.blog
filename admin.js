const title = document.getElementById("title");
const thumb = document.getElementById("thumb");
const video = document.getElementById("video");
const content = document.getElementById("content");
const btn = document.getElementById("btnPost");

function isImage(url){
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
}

btn.onclick = async ()=>{

  if(!title.value.trim()){
    alert("Nhập tiêu đề");
    return;
  }

  if(!isImage(thumb.value)){
    alert("Thumbnail phải là LINK ẢNH (.jpg .png ...)");
    return;
  }

  if(!video.value.includes("http")){
    alert("Video phải là link mp4/firebase");
    return;
  }

  await DB.addPost({
    title: title.value,
    thumb: thumb.value,
    media: video.value,
    content: content.value
  });

  alert("Đăng thành công");
  location.href="index.html";
};
