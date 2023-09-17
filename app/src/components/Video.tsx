import { useCallback, useEffect, useRef, useState } from "react";
import { socket, wait } from "../utils";
import { useAppState } from "../context/useAppState";
import { LoadingOverlay } from "./LoadingOverlay";

export function Video() {
  const { truck, trucker } = useAppState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getPhoto = useCallback(async () => {
    const video = videoRef.current;
    const photo = photoRef.current;
    if (!video || !photo) return;

    const data = photo.toDataURL("image/jpeg");
    return data;
  }, []);

  const getLocation = async () => {
    const { coords } = await new Promise<GeolocationPosition>((resolve) => {
      navigator.geolocation.getCurrentPosition(resolve);
    });
    return { lat: coords.latitude, lng: coords.longitude };
  };

  const sendData = useCallback(async () => {
    const photo = await getPhoto();
    const location = await getLocation();

    console.log({ photo, location, truck });
    socket.emit("update_truck_position", {
      photo,
      longitude: location.lng,
      latitude: location.lat,
      truck,
    });
  }, [getPhoto, truck]);

  const getVideo = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      if (!videoRef.current) return;
      videoRef.current.srcObject = mediaStream;
      await videoRef.current.play();
    } catch (error) {
      console.error(error);
    }
  }, []);

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
    wait(1500).then(() => {
      setIsLoading(false);
    });
    getVideo();
    setInterval(() => {
      sendData();
    }, 5000);

    return () => {
      socket.disconnect();
    };
  }, [getVideo, sendData]);

  return (
    <>
      <div className="flex flex-col justify-center h-screen bg-neutral-950 text-white max-w-md mx-auto p-8">
        <h1 className="text-lg font-bold">Welcome, {trucker?.firstName}</h1>
        <p className="mb-4">Keep your eyes on the road!</p>
        <video onCanPlay={() => paintToCanvas()} ref={videoRef} />
        <canvas className="hidden" ref={photoRef} />
      </div>
      <LoadingOverlay isLoading={isLoading} />
    </>
  );
}
