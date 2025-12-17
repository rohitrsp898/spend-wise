import React, { useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { auth } from '../utils/firebase';
import { Wallet, ArrowRight, CheckCircle2, Lock, Mail, User } from 'lucide-react';

const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                // Sign In
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                // Sign Up
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Update display name for new user
                if (name) {
                    await updateProfile(userCredential.user, {
                        displayName: name
                    });
                }
            }
        } catch (err: any) {
            console.error("Auth Error:", err);
            let msg = `Authentication failed: ${err.code || err.message}`;
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') msg = "Invalid email or password.";
            else if (err.code === 'auth/email-already-in-use') msg = "Email is already registered.";
            else if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">

                {/* Header Section */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center text-white">
                    <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                        <Wallet size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">SpendWise</h1>
                    <p className="text-blue-100">
                        {isLogin ? 'Welcome back!' : 'Create your account'}
                    </p>
                </div>

                {/* Content Section */}
                <div className="p-8 pt-6">
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="relative">
                                <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    required
                                />
                            </div>
                        )}

                        <div className="relative">
                            <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight size={18} />
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-sm">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-blue-600 font-semibold hover:underline bg-transparent border-none cursor-pointer"
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureRow = ({ text }: { text: string }) => (
    <div className="flex items-center gap-3 text-gray-600">
        <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
        <span className="text-sm font-medium">{text}</span>
    </div>
);

export default Login;
