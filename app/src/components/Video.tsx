import { useCallback, useEffect, useRef } from "react";
import { wait, socket } from "../utils";
import { useAppState } from "../context/useAppState";

export function Video() {
  const { truck } = useAppState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLCanvasElement>(null);

  const sendPhoto = useCallback(async () => {
    const video = videoRef.current;
    const photo = photoRef.current;
    if (!video || !photo) return;

    const data = photo.toDataURL("image/jpeg");

    socket.emit("photo", { truck, data });
  }, [truck]);

  const sendLocation = useCallback(async () => {
    try {
      await navigator.geolocation.getCurrentPosition(({ coords }) => {
        socket.emit("location", {
          truck,
          longitude: coords.longitude,
          latitude: coords.latitude,
        });
      });
    } catch (error) {
      console.error(error);
    }
  }, [truck]);

  const getVideo = useCallback(async () => {
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
  }, [sendPhoto]);

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
  }, [getVideo, sendLocation, sendPhoto]);

  return (
    <div className="flex items-center justify-center h-screen">
      <video onCanPlay={() => paintToCanvas()} ref={videoRef} />
      <canvas className="hidden" ref={photoRef} />
    </div>
  );
}
