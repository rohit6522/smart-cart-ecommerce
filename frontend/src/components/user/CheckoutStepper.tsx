import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface CheckoutStepperProps {
  currentStep: 1 | 2 | 3;
}

const steps = ["Cart", "Checkout", "Order Success"];

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <div className="flex items-center justify-center mb-8 max-w-md mx-auto px-4">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isDone || isActive ? "#2563eb" : "#f1f5f9",
                  scale: isActive ? 1.08 : 1,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-2xs transition-shadow ${
                  isActive ? "ring-4 ring-blue-500/20 text-white" : isDone ? "text-white" : "text-slate-400"
                }`}
              >
                {isDone ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <Check size={16} strokeWidth={2.5} />
                  </motion.div>
                ) : (
                  stepNum
                )}
              </motion.div>
              <span
                className={`text-xs mt-2 font-semibold tracking-tight whitespace-nowrap ${
                  isDone || isActive ? "text-blue-600 font-bold" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-3 mb-5 bg-slate-200 relative overflow-hidden rounded-full">
                <motion.div
                  initial={false}
                  animate={{ width: isDone ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 bg-blue-600 rounded-full"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}