"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await supabase.auth.signOut();
            router.refresh();
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirm(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Sign out"
            >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
            </Button>

            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200 space-y-4"
                        role="alertdialog"
                    >
                        <div className="space-y-2 text-center sm:text-left">
                            <h3 className="text-lg font-semibold leading-none tracking-tight text-[#03334c]">
                                Confirm Logout
                            </h3>
                            <p className="text-sm text-gray-500">
                                Are you sure you want to log out? Your current session will be ended.
                            </p>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
                            <Button
                                variant="outline"
                                onClick={() => setShowConfirm(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleLogout}
                                disabled={isLoading}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                {isLoading ? "Logging out..." : "Logout"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
