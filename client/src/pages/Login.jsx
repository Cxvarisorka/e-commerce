/// Hooks
import { useAuth } from "../hooks/useAuth";
import { useForm } from "../hooks/useForm";
import { getGoogleAuthLink } from "../services/OauthService"; 
import { toast } from "react-toastify";

const Login = () => {
    const [formData, handleChange, handleSubmit, resetForm] = useForm({
        email: "",
        password: ""
    });

    const { login } = useAuth();

    const handleGoogleLogin = async () => {
        try {
            const data = await getGoogleAuthLink();
            const googleUrl = data?.url || data?.data?.url;
            
            if (googleUrl) {
                window.location.href = googleUrl;
            } else {
                toast.error("გუგლის ავტორიზაციის ლინკი ვერ მოიძებნა");
            }
        } catch (err) {
            console.error("Google auth error:", err);
            toast.error("ვერ მოხერხდა გუგლის სერვერთან კავშირი");
        }
    };

    return (
        <section className="mx-auto max-w-md rounded-4xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-300/30 sm:p-10">
            <h2 className="mb-6 text-3xl font-semibold text-slate-900">Sign In</h2>
            
           
            <form onSubmit={(e) => { handleSubmit(e, login); resetForm() }} className="space-y-5">
                <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                />
                <button
                    type="submit"
                    className="w-full rounded-full bg-cyan-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-cyan-500 cursor-pointer"
                >
                    Login
                </button>
            </form>

            
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-slate-400 font-medium">or</span>
                </div>
            </div>

            
            <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50/80 active:scale-[0.99] text-slate-600 font-semibold px-6 py-3 rounded-full text-base transition-all cursor-pointer shadow-sm"
            >
            
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                        fill="#EA4335"
                        d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.354 0 3.373 2.736 1.49 6.72l3.776 3.045z"
                    />
                    <path
                        fill="#4285F4"
                        d="M23.49 12.273c0-.818-.073-1.609-.21-2.364H12v4.473h6.445a5.523 5.523 0 0 1-2.396 3.627l3.723 2.886c2.177-2.009 3.431-4.964 3.431-8.622z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.266 14.235L1.49 17.28C3.373 21.264 7.354 24 12 24c3.055 0 5.791-1.018 7.718-2.773l-3.723-2.886a4.414 4.414 0 0 1-6.705-2.118l-4.024-1.988z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 4.909c1.918 0 3.455.773 4.418 1.582l3.491-3.491C17.782 1.145 15.055 0 12 0 7.354 0 3.373 2.736 1.49 6.72l3.776 3.045c.44-1.345 1.69-2.364 3.218-2.364z"
                    />
                </svg>
                Continue with Google
            </button>
        </section>
    );
};

export default Login;