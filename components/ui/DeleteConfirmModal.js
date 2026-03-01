import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Deletion",
    description = "Are you sure you want to delete this item? This action cannot be undone.",
    isDeleting = false,
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isDeleting ? onClose : undefined}
                        className="absolute inset-0"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl relative z-10"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mb-6">
                                <AlertTriangle size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-8">{description}</p>

                            <div className="flex w-full gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 px-4 rounded-xl text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 font-medium transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 px-4 rounded-xl text-white bg-red-500 hover:bg-red-600 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isDeleting ? <Loader2 size={18} className="animate-spin" /> : null}
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
