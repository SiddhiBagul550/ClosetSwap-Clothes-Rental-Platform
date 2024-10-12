import React, { useState } from "react";

export default function Try() {
  const [img, setImg] = useState("");
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const base64 = await convert(file);
    setImg(base64);
    console.log(base64);
  };
  return (
    <div>
      <img src={img} alt="Img here" />
      <form>
        <input
          type="file"
          accept=".jpeg , .png, .jpg"
          onChange={(e) => handleFileUpload(e)}
        />
      </form>
    </div>
  );
}

function convert(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
  });
}
