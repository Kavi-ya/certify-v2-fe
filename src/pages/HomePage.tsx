import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [mode, setMode] = useState<"certificate" | "badge">("certificate");
  const [certId, setCertId] = useState("");
  const [badgeId, setBadgeId] = useState("");
  const navigate = useNavigate();

  const isCert = mode === "certificate";
  const inputValue = isCert ? certId : badgeId;
  const setInputValue = isCert ? setCertId : setBadgeId;

  const handleVerify = () => {
    if (isCert) {
      const t = certId.trim();
      if (!t) return;
      navigate(`/certificates/${encodeURIComponent(t)}`);
    } else {
      const t = badgeId.trim();
      if (!t) return;
      navigate(`/badges/verify`, { state: { badgeId: t } });
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleVerify();
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <div className="relative w-full pt-[clamp(24px,4vw,48px)] pb-0 overflow-visible shrink-0">
        {/* Gradient overlay */}
        <div className="absolute top-0 left-0 right-0 h-[calc(100%+5rem)] bg-[linear-gradient(90deg,#F47624_0%,#FFFFFF_100%)] opacity-30 z-0 pointer-events-none [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]" />

        <div className="relative z-[2] mb-[clamp(-24px,-5vw,-48px)]">
          {/* Blurry shadow layer: positioned absolutely behind the text */}
          <h1 className="m-0 px-1 font-['Prompt',system-ui,sans-serif] font-semibold text-[clamp(64px,12vw,160px)] leading-none tracking-[0.14em] text-black text-center select-none absolute inset-0 whitespace-nowrap blur-[16px] opacity-55 translate-y-6 -z-10" aria-hidden="true">CERTIFY</h1>
          {/* Foreground text layer */}
          <h1 className="m-0 px-1 font-['Prompt',system-ui,sans-serif] font-semibold text-[clamp(64px,12vw,160px)] leading-none tracking-[0.14em] text-black text-center select-none relative whitespace-nowrap" aria-label="Certify">CERTIFY</h1>
        </div>
      </div>

      {/* ── Content section ──────────────────────────────────────────────── */}
      <div className="flex-1 bg-[linear-gradient(to_bottom,transparent_0%,rgba(233,145,4,0.19)_clamp(1.5rem,4vw,3rem))] p-[clamp(2.25rem,5vw,4rem)_1.5rem_clamp(1.75rem,3vw,2.5rem)] relative z-10">
        <div className="max-w-[900px] ml-[clamp(1.5rem,6vw,80px)] flex flex-col items-start gap-0">

          {/* Mode tabs — subtle pill switcher */}
          <div className="flex gap-0 mb-[1.1rem] bg-transparent p-0 border-none">
            <button
              id="tab-certificate"
              className={`font-['Prompt',system-ui,sans-serif] font-semibold text-[0.88rem] py-2 px-5 rounded-[50px] border-none cursor-pointer transition-all duration-[0.18s] ease-in-out ${isCert ? "bg-[#F47624] text-white shadow-[0_2px_10px_rgba(244,118,36,0.35)]" : "bg-transparent text-[#83756b]"}`}
              onClick={() => setMode("certificate")}
            >
              Certificate
            </button>
            <button
              id="tab-badge"
              className={`font-['Prompt',system-ui,sans-serif] font-semibold text-[0.88rem] py-2 px-5 rounded-[50px] border-none cursor-pointer transition-all duration-[0.18s] ease-in-out ${!isCert ? "bg-[#F47624] text-white shadow-[0_2px_10px_rgba(244,118,36,0.35)]" : "bg-transparent text-[#83756b]"}`}
              onClick={() => setMode("badge")}
            >
              Badge
            </button>
          </div>

          <p className="font-['Prompt',system-ui,sans-serif] font-semibold text-[clamp(1.1rem,2.1vw,1.7rem)] leading-relaxed tracking-[0.02em] text-black m-0 mb-[1.3rem] max-w-[900px]">
            Enter the unique {isCert ? "certificate" : "badge"} ID to instantly verify an
            <br />
            official credential issued by{" "}
            <a
              href="https://sliitmozilla.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F47624] font-['Prompt',system-ui,sans-serif] font-semibold underline decoration-[#F47624] decoration-2 underline-offset-4 whitespace-nowrap"
            >
              SLIIT Mozilla Club
            </a>
            .
          </p>

          {/* Input label */}
          <label htmlFor="credential-id-input" className="font-['Prompt',system-ui,sans-serif] font-semibold text-base text-black mb-2 block tracking-[0.02em]">
            {isCert ? "Certificate ID" : "Badge ID"}
          </label>

          {/* Input */}
          <input
            id="credential-id-input"
            type="text"
            placeholder={isCert ? "Eg : E189A0B95472" : "Eg : BDG-12345678"}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKey}
            className="w-full max-w-[478px] py-[0.85rem] px-[1.1rem] rounded-2xl border border-[#D9D9D9] bg-white text-black text-base font-['Inter',system-ui,sans-serif] outline-none box-border mb-[1.2rem] transition-all duration-[0.18s] ease-in-out focus:border-[#F47624] focus:shadow-[0_0_0_3px_rgba(244,118,36,0.12)] placeholder:text-[#B3B3B3] placeholder:font-['Prompt',system-ui,sans-serif]"
          />

          {/* CTA */}
          <button
            id="verify-credential-button"
            onClick={handleVerify}
            className="w-full max-w-[354px] py-[0.9rem] px-[1.5rem] rounded-full border-none bg-[#F47624] text-white text-[1.05rem] font-['Montserrat',system-ui,sans-serif] font-semibold cursor-pointer shadow-[0px_2px_4px_rgba(136,144,194,0.2),0px_5px_15px_rgba(37,44,97,0.15)] transition-[background,opacity] duration-[0.18s] ease-in-out hover:bg-[#d96810] active:opacity-90"
          >
            Verify {isCert ? "Certificate" : "Badge"}
          </button>
        </div>
      </div>
    </div>
  );
}