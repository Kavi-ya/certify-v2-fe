import { useState } from "react";
import { useNavigate } from "react-router-dom";

function VerificationPage() {
    const [mode, setMode] = useState<"certificate" | "badge">("certificate");
    const [certificateId, setCertificateId] = useState("");
    const [badgeId, setBadgeId] = useState("");
    const navigate = useNavigate();

    const isCert = mode === "certificate";

    const handleVerify = () => {
        if (isCert) {
            const trimmed = certificateId.trim();
            if (!trimmed) return;
            navigate(`/certificates/${encodeURIComponent(trimmed)}`);
        } else {
            const trimmed = badgeId.trim();
            if (!trimmed) return;
            navigate(`/badges/verify`, { state: { badgeId: trimmed } });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleVerify();
    };

    return (
        <section className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-[#f5f5f5] px-6 py-12">
            <div className="w-full max-w-[680px] flex flex-col items-center text-center gap-0">
                {/* Hero heading */}
                <h1 className="text-[clamp(2.6rem,7vw,4.25rem)] font-bold leading-[1.1] tracking-[-0.03em] m-0 mb-4 font-['Inter','Inter_Fallback',system-ui,sans-serif]">
                    {isCert ? (
                        <>
                            <span className="text-[#ff7139]">Your Achievements.</span>
                            <br />
                            <span className="text-[#1a1a1a]">Officially Certified.</span>
                        </>
                    ) : (
                        <>
                            <span className="text-[#ff7139]">Your Badges.</span>
                            <br />
                            <span className="text-[#1a1a1a]">Officially Verified.</span>
                        </>
                    )}
                </h1>

                {/* Subtitle */}
                <p className="text-base text-[#8a8a8a] m-0 mb-8 font-normal leading-relaxed">
                    {isCert
                        ? "Get your certificates in one place."
                        : "Confirm the authenticity of your digital badge."}
                </p>

                {/* Input */}
                <input
                    id={isCert ? "certificate-id-input" : "badge-id-input"}
                    type="text"
                    placeholder={isCert ? "Certificate ID" : "Badge ID"}
                    value={isCert ? certificateId : badgeId}
                    onChange={(e) =>
                        isCert
                            ? setCertificateId(e.target.value)
                            : setBadgeId(e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    className="w-full max-w-[460px] py-[0.875rem] px-[1.1rem] rounded-[4px] border-[1.5px] border-[#dcdcdc] bg-white text-[#1a1a1a] text-[0.95rem] font-['Inter','Inter_Fallback',system-ui,sans-serif] outline-none box-border mb-3 transition-[border-color,box-shadow] duration-[0.18s] ease-in-out placeholder:text-[#c0bfbf] focus:border-[#ff7139] focus:shadow-[0_0_0_3px_rgba(255,113,57,0.12)]"
                />

                {/* Primary CTA Button */}
                <button
                    id={isCert ? "verify-button" : "verify-badge-button"}
                    onClick={handleVerify}
                    className="w-full max-w-[460px] py-[0.9rem] px-4 rounded-[4px] border-none bg-[#ff7139] text-white text-base font-bold font-['Inter','Inter_Fallback',system-ui,sans-serif] cursor-pointer shadow-[0_4px_18px_rgba(255,113,57,0.35)] transition-all duration-[0.18s] ease-in-out tracking-[0.01em] mb-5 hover:bg-[#e3572a] hover:shadow-[0_6px_24px_rgba(255,113,57,0.48)] hover:-translate-y-[1px] active:translate-y-0 active:opacity-90"
                >
                    {isCert ? "Verify Your Certificate" : "Verify Your Badge"}
                </button>

                {/* Mode toggle link */}
                <p className="text-[0.82rem] text-[#a0a0a0] m-0">
                    {isCert ? (
                        <>
                            Have a badge?{" "}
                            <button
                                id="switch-to-badge"
                                onClick={() => setMode("badge")}
                                className="bg-transparent border-none text-[#ff7139] font-semibold cursor-pointer text-[0.82rem] font-['Inter','Inter_Fallback',system-ui,sans-serif] p-0 underline decoration-transparent transition-[text-decoration-color] duration-150 hover:decoration-[#ff7139]"
                            >
                                Verify a Badge instead →
                            </button>
                        </>
                    ) : (
                        <>
                            Have a certificate?{" "}
                            <button
                                id="switch-to-certificate"
                                onClick={() => setMode("certificate")}
                                className="bg-transparent border-none text-[#ff7139] font-semibold cursor-pointer text-[0.82rem] font-['Inter','Inter_Fallback',system-ui,sans-serif] p-0 underline decoration-transparent transition-[text-decoration-color] duration-150 hover:decoration-[#ff7139]"
                            >
                                Verify a Certificate instead →
                            </button>
                        </>
                    )}
                </p>
            </div>
        </section>
    );
}

export default VerificationPage;
