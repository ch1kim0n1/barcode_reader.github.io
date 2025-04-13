import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";

const BarcodeScanner: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const screenWidth = window.innerWidth;
    const scannerSize = Math.min(screenWidth * 0.8, 250);

    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      {
        qrbox: {
          width: scannerSize,
          height: scannerSize,
        },
        fps: 10,
        aspectRatio: 1,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
        ],
      },
      false
    );

    // Start scanning
    const startScanner = async () => {
      try {
        await scannerRef.current?.render(
          (decodedText) => {
            // Success callback
            setResult(decodedText);
            setIsDetecting(true);
            setScanning(true);
            const now = new Date();
            setLastScanTime(now.toLocaleTimeString());
            setTimeout(() => setIsDetecting(false), 1500);
          },
          (errorMessage) => {
            // Error callback
            if (errorMessage?.includes("NotFoundError")) {
              setError("Camera access denied or no camera found");
            }
          }
        );
        // Scanner is ready and running
        setScanning(true);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to start scanner";
        setError(errorMessage);
        setScanning(false);
      }
    };

    startScanner();

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center py-4 px-2 sm:px-4">
      <div className="w-full max-w-md mx-auto">
        <div className={`relative rounded-xl overflow-hidden shadow-lg bg-white ${
          isDetecting ? "ring-4 ring-green-500 animate-pulse" : ""
        }`}>
          {/* Scanner container */}
          <div 
            id="reader" 
            className="w-full" 
            style={{ 
              minHeight: "300px",
              maxHeight: "80vh"
            }} 
          />

          {/* Success overlay */}
          {isDetecting && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
              <div className="bg-white px-4 py-2 rounded-lg shadow-lg transform scale-110 transition-transform">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-green-500"
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
                  <span className="text-green-700 font-semibold text-sm">
                    Code Detected!
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Panel */}
        <div className="mt-4 p-4 bg-white rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                scanning ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm font-medium text-gray-700">
              {scanning ? "Camera active" : "Camera inactive"}
            </span>
            {scanning && (
              <span
                className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
                  isDetecting
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {isDetecting ? "Code Found!" : "Ready to scan"}
              </span>
            )}
          </div>

          {error && (
            <div className="mt-2 p-2 bg-red-50 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-3 space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Last detected code:</h3>
              <div className="relative">
                <p className="text-blue-600 font-mono text-sm bg-gray-50 p-3 rounded-lg break-all">
                  {result}
                </p>
                {lastScanTime && (
                  <p className="text-xs text-gray-500 mt-1">
                    Scanned at: {lastScanTime}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
