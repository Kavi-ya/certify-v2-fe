import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { AlertCircle, CheckCircle } from "lucide-react";

interface BadgeData {
    id: number;
    created_at: string;
    template_id: number;
    recipient_name: string;
    recipient_email: string;
    event_name?: string;
    event_date?: string;
    event_location?: string;
    issuer_name?: string;
    course_name?: string;
    issue_reason?: string;
    notes?: string;
    badge_id: string;
}

export default function BadgeVerifyPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const stateBadgeId = location.state?.badgeId as string | undefined;

    const [badgeIdInput, setBadgeIdInput] = useState(stateBadgeId || "");
    const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [countdown, setCountdown] = useState<number | null>(null);

    const verifyBadge = async (idToVerify: string) => {
        if (!idToVerify.trim()) {
            setError("Please enter a valid Badge ID");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setBadgeData(null);

            const response = await fetch(
                `${import.meta.env.VITE_PUBLIC_BACKEND_API}/badge/preview/${encodeURIComponent(idToVerify)}`
            );

            if (!response.ok) {
                if (response.status === 404) {
                    setError("Badge not found. Please check the ID and try again.");
                } else {
                    setError("Failed to verify badge. Please try again later.");
                }
                return;
            }

            const data = await response.json();
            if (data.ok && data.badge) {
                setBadgeData(data.badge);
                setCountdown(5);
            } else {
                setError("Invalid response from server.");
            }
        } catch (err) {
            setError("An error occurred while connecting to the server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (stateBadgeId) {
            verifyBadge(stateBadgeId);
        }
    }, [stateBadgeId]);

    // Countdown + redirect after successful verification
    useEffect(() => {
        if (countdown === null) return;
        if (countdown === 0) {
            navigate("/");
            return;
        }
        const timer = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
        return () => clearTimeout(timer);
    }, [countdown, navigate]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        verifyBadge(badgeIdInput);
    };

    return (
        <div className="admin-page min-h-[calc(100vh-80px)]">
            {/* Header */}
            <div className="max-w-3xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1
                        className="m-0 font-bold text-moz-black tracking-[-0.02em] text-[clamp(1.1rem,3vw,1.5rem)]"
                    >
                        Verify Badge
                    </h1>
                    <p className="mt-1 text-sm text-moz-gray-mid">
                        Enter a badge ID to confirm its authenticity.
                    </p>
                </div>
                <Link id="back-to-home-link" to="/" className="btn-ghost">
                    ← Back
                </Link>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto w-full mt-6">
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="e.g. BDG-12345678"
                        value={badgeIdInput}
                        onChange={(e) => setBadgeIdInput(e.target.value)}
                        className="form-input flex-1"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="submit-btn px-6 py-2 rounded-lg text-white font-bold cursor-pointer transition-all disabled:opacity-70 bg-gradient-to-br from-[var(--color-moz-orange)] to-[var(--color-moz-orange-mid)] border-none"
                    >
                        {loading ? "Verifying..." : "Verify"}
                    </button>
                </div>
            </form>

            {/* Error State */}
            {error && (
                <div className="max-w-3xl mx-auto w-full mt-6">
                    <div className="bg-[#fdf0ef] border border-[#f5c6c2] text-[#c0392b] p-4 rounded-xl flex items-center gap-3">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Success State */}
            {badgeData && !loading && !error && (
                <div className="max-w-3xl mx-auto w-full mt-8 bg-white border border-moz-gray-light rounded-2xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center justify-between gap-3 mb-6 pb-6 border-b border-moz-gray-light">
                        <div className="flex items-center gap-3 text-emerald-600">
                            <CheckCircle size={28} />
                            <h2 className="text-xl font-bold m-0">Valid Badge</h2>
                        </div>
                        {countdown !== null && (
                            <span className="text-xs text-moz-gray-mid">
                                Returning to home in {countdown}s…
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                        <div>
                            <p className="text-xs font-bold text-moz-gray-mid uppercase tracking-wider mb-1">Badge ID</p>
                            <p className="font-mono text-moz-black font-semibold break-all m-0">{badgeData.badge_id}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-moz-gray-mid uppercase tracking-wider mb-1">Date Issued</p>
                            <p className="m-0 text-moz-black">{new Date(badgeData.created_at).toLocaleDateString()}</p>
                        </div>

                        <div className="sm:col-span-2 mt-2">
                            <p className="text-xs font-bold text-moz-gray-mid uppercase tracking-wider mb-1">Recipient</p>
                            <p className="m-0 text-lg font-semibold text-moz-black">{badgeData.recipient_name}</p>
                            <p className="m-0 text-moz-gray-mid">{badgeData.recipient_email}</p>
                        </div>

                        {badgeData.event_name && (
                            <div>
                                <p className="text-xs font-bold text-moz-gray-mid uppercase tracking-wider mb-1">Event</p>
                                <p className="m-0 text-moz-black">{badgeData.event_name}</p>
                            </div>
                        )}

                        {badgeData.issue_reason && (
                            <div>
                                <p className="text-xs font-bold text-moz-gray-mid uppercase tracking-wider mb-1">Reason</p>
                                <p className="m-0 text-moz-black">{badgeData.issue_reason}</p>
                            </div>
                        )}

                        {badgeData.issuer_name && (
                            <div>
                                <p className="text-xs font-bold text-moz-gray-mid uppercase tracking-wider mb-1">Issued By</p>
                                <p className="m-0 text-moz-black">{badgeData.issuer_name}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
