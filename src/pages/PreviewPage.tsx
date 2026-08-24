import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PDFViewer from "../components/PDFViewer";

function PreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const certificateId = id || "Not provided";
  const [certificateBlob, setCertificateBlob] = useState<Blob>();
  const [certificateImg, setCertificateImg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = "";

    const fetchCertificate = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${import.meta.env.VITE_PUBLIC_BACKEND_API}/certificate/${encodeURIComponent(certificateId)}/preview`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          setError("Certificate not found. Please check the ID and try again.");
          return;
        }

        const rawBlob = await response.blob();
        const blob = new Blob([rawBlob], { type: "application/pdf" });
        objectUrl = URL.createObjectURL(blob);
        setCertificateImg(objectUrl);
        setCertificateBlob(blob);
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return;
        }
        setError(
          `Error fetching certificate: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [certificateId]);

  const handleDownload = () => {
    if (!certificateBlob) return;
    const fileUrl = URL.createObjectURL(certificateBlob);
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = `certificate-${certificateId}.pdf`;
    link.click();
    URL.revokeObjectURL(fileUrl);
  };

  return (
    <>
      <section className="relative min-h-[calc(100vh-72px)] bg-[rgba(233,145,4,0.19)] flex items-start justify-center pt-[clamp(2.5rem,5vw,4rem)] px-[1.5rem] pb-[4rem] overflow-hidden">
        {/* Background blurry word */}
        <h1 className="m-0 font-['Prompt',system-ui,sans-serif] font-semibold text-[clamp(120px,20vw,300px)] leading-none tracking-[0.14em] text-black text-center select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap blur-[18px] opacity-25 z-0 pointer-events-none" aria-hidden="true">CERTIFY</h1>

        <div className="w-full max-w-[950px] flex flex-col items-center gap-0 z-10">

          {/* Action Bar (Back & Download) */}
          <div className="w-full flex justify-between items-center mb-6 sm:mb-8 gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex justify-center items-center w-10 h-10 shrink-0 bg-[#F47624] rounded-full drop-shadow-[0_4px_6px_rgba(244,118,36,0.3)] border-none cursor-pointer transition-transform duration-200 hover:scale-[0.92]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>

            {certificateImg && !loading && !error && (
              <button
                id="download-certificate-button"
                onClick={handleDownload}
                className="flex items-center py-[0.7rem] px-[1.2rem] rounded-full border-none bg-[#F47624] text-white text-[0.95rem] font-['Montserrat',system-ui,sans-serif] font-semibold cursor-pointer shadow-[0px_2px_4px_rgba(136,144,194,0.2),0px_5px_15px_rgba(37,44,97,0.15)] transition-[transform,opacity] duration-[0.15s] ease-in-out hover:opacity-90 active:scale-[0.96]"
              >
                <span className="hidden sm:inline">Download PDF</span>
                <span className="inline sm:hidden">Download</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 w-4 h-4">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
            )}
          </div>

          {/* Header block */}
          <div className="w-full flex flex-col items-start mb-8">
            <h1 className="font-['Prompt',system-ui,sans-serif] font-bold text-[clamp(1.2rem,3vw,1.8rem)] text-black tracking-[0.02em] m-0 mb-2 uppercase">CERTIFICATE PREVIEW</h1>
            <p className="font-['Prompt',system-ui,sans-serif] font-semibold text-[0.95rem] text-black m-0">Certificate ID : {certificateId.toUpperCase()}</p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="p-4 text-black font-['Prompt',system-ui,sans-serif] text-[1.1rem] font-medium">
              <span className="inline-block animate-[spin-slow_1s_linear_infinite]">⟳</span>&nbsp; Loading certificate…
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="py-4 px-6 bg-[#fff0ed] text-[#cc2b04] rounded-lg font-['Prompt',system-ui,sans-serif] border border-[#ffd2c7] font-medium">⚠ {error}</div>
          )}

          {/* Certificate card */}
          {certificateImg && !loading && !error && (
            <>
              <div className="w-full bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.07),0_8px_40px_rgba(89,42,203,0.06)] mb-8">
                {/* PDF */}
                <div className="p-6 h-[58vh] min-h-[400px] flex items-center justify-center">
                  <PDFViewer url={certificateImg} />
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        #preview-spinner {
          display: inline-block;
          animation: spin-slow 1s linear infinite;
        }
        
        /* Remove the browser scrollbar for a seamless, app-like aesthetic */
        ::-webkit-scrollbar {
          display: none;
          width: 0px;
          background: transparent;
        }
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}

export default PreviewPage;
