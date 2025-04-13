import React, { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

const BarcodeScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | undefined>(undefined);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Wait for video to be loaded before starting scan
          videoRef.current.addEventListener("loadeddata", () => {
            setScanning(true);
            scanQRCode();
          });
          videoRef.current.play();
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to access camera"
        );
        setScanning(false);
      }
    };

    const scanQRCode = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) return;

      // Check if video has valid dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        // If video dimensions aren't ready yet, try again in the next frame
        animationFrameId.current = requestAnimationFrame(scanQRCode);
        return;
      }

      // Match canvas size to video feed
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        // QR code detected
        setResult(code.data);
        setIsDetecting(true);
        // Increase the detection indicator duration to 1.5 seconds for better visibility
        setTimeout(() => setIsDetecting(false), 1500);
      } else {
        setIsDetecting(false);
      }

      // Continue scanning
      animationFrameId.current = requestAnimationFrame(scanQRCode);
    };

    startCamera();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setScanning(false);
    };
  }, []);

  return (
    <div className="relative max-w-2xl mx-auto p-4">
      <div
        className={`relative rounded-lg overflow-hidden ${
          isDetecting ? "ring-4 ring-green-500 animate-pulse" : ""
        }`}
      >
        {/* Video feed */}
        <video
          ref={videoRef}
          className="w-full h-auto"
          style={{ minHeight: "300px", background: "#000000" }}
          playsInline
        />

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Scanning overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={`absolute inset-20 border-2 rounded-lg transition-colors duration-300 ${
              isDetecting ? "border-green-500 border-4" : "border-white"
            }`}
          >
            {/* Scanning corners */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-500" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-500" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-500" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-500" />
            </div>
            {/* Scanning animation line */}
            <div
              className={`absolute inset-x-0 h-0.5 bg-blue-500 animate-[scan_2s_linear_infinite] ${
                isDetecting ? "bg-green-500" : ""
              }`}
            />
          </div>

          {/* Success overlay */}
          {isDetecting && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
              <div className="bg-white px-6 py-3 rounded-lg shadow-lg transform scale-110 transition-transform">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-green-700 font-semibold">
                    Code Detected!
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Panel */}
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-3 h-3 rounded-full ${
              scanning ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm font-medium text-black">
            {scanning ? "Camera active" : "Camera inactive"}
          </span>
          {scanning && (
            <span
              className={`ml-2 px-2 py-0.5 rounded ${
                isDetecting
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {isDetecting ? "Code Found!" : "Scanning..."}
            </span>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">Error: {error}</div>
        )}

        {isDetecting && (
          <div className="mt-2 text-green-600 font-medium animate-pulse">
            Code detected!
          </div>
        )}

        {result && (
          <div className="mt-2">
            <h3 className="font-semibold">Last detected code:</h3>
            <p className="text-blue-600 font-mono bg-gray-200 p-2 rounded mt-1 break-all">
              {result}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
