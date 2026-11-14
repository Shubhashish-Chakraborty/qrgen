"use client";

import { useState, type FormEvent } from "react";
import QRCode from "qrcode";
import { Bricolage_Grotesque } from "next/font/google";

const font = Bricolage_Grotesque({ subsets: ["latin"] });

// Adds https://
function normalizeUrl(input: string): string {
  const value = input.trim();
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

const focusRing =
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#2f5bff]";

const buttonStyle =
  "cursor-pointer rounded-md border-2 border-[#14213d] bg-[#14213d] px-5 py-3.5 text-center font-semibold text-white hover:border-[#2f5bff] hover:bg-[#2f5bff] " +
  focusRing;

export default function Home() {
  const [input, setInput] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [encodedUrl, setEncodedUrl] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const value = normalizeUrl(input);
    if (!value) {
      setError("Enter a URL to generate a QR code.");
      return;
    }

    try {
      new URL(value); // throws if the URL is invalid
    } catch {
      setError("That doesn't look like a valid URL. Try https://example.com");
      return;
    }

    try {
      const dataUrl = await QRCode.toDataURL(value, {
        width: 1024, // high-res so downloads stay sharp when printed
        margin: 2,
        errorCorrectionLevel: "M",
        color: { dark: "#14213D", light: "#FFFFFF" },
      });
      setQrDataUrl(dataUrl);
      setEncodedUrl(value);
    } catch {
      setError("Couldn't generate the QR code. The URL may be too long.");
    }
  }

  function getFileName(): string {
    try {
      return `qr-${new URL(encodedUrl).hostname}.png`;
    } catch {
      return "qr-code.png";
    }
  }

  return (
    <main
      className={`${font.className} min-h-screen bg-[#eef1f6] px-5 py-10 text-[#14213d] md:px-6 md:py-[72px]`}
    >
      <div className="mx-auto grid max-w-[960px] items-start gap-10 md:grid-cols-[1fr_340px] md:gap-16">
        <section>
          <h1 className="mb-4 text-4xl font-bold leading-[1.02] tracking-[-0.03em] sm:text-5xl md:text-6xl">
            Turn any link into a QR code
          </h1>
          <p className="mb-8 max-w-[44ch] text-lg leading-normal text-[#44506b]">
            Free, no sign-up.
          </p>

          <form
            className="flex flex-wrap gap-2"
            onSubmit={handleSubmit}
            noValidate
          >
            <input
              className={
                "min-w-[240px] flex-1 rounded-md border-2 border-[#14213d] bg-white px-4 py-3.5 text-[#14213d] placeholder:text-[#7a859c] " +
                focusRing
              }
              type="text"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder="https://example.com"
              aria-label="URL to encode"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className={buttonStyle} type="submit">
              Generate QR code
            </button>
          </form>

          {error && (
            <p className="mt-3 font-medium text-[#b3261e]" role="alert">
              {error}
            </p>
          )}
        </section>

        <section aria-live="polite">
          {qrDataUrl ? (
            <>
              <div className="grid aspect-square place-items-center rounded-md border-2 border-[#14213d] bg-white p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="h-full w-full [image-rendering:pixelated]"
                  src={qrDataUrl}
                  alt={`QR code for ${encodedUrl}`}
                />
              </div>
              <p className="mb-4 mt-3 break-words text-sm text-[#44506b]">
                {encodedUrl}
              </p>
              <a
                className={`block ${buttonStyle}`}
                href={qrDataUrl}
                download={getFileName()}
              >
                Download PNG
              </a>
            </>
          ) : (
            <div className="grid aspect-square place-items-center rounded-md border-2 border-dashed border-[#14213d] bg-white p-4 text-center text-[#44506b]">
              Your QR code will appear here
            </div>
          )}
        </section>
      </div>
    </main>
  );
}