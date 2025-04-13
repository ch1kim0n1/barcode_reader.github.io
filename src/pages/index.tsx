import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import BarcodeScanner from '../components/BarcodeScanner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Barcode Scanner</h1>
        <BarcodeScanner />
        <p className="text-sm text-gray-600 mt-4 text-center">
          Position the barcode within the frame. The scanner will automatically detect it.
        </p>
      </div>
    </main>
  );
}
