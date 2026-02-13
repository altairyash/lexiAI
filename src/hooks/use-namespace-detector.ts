import { useState, useEffect, useRef } from "react";
import { Namespace } from "@/types";
import { toast } from "react-toastify";

interface UseNamespaceDetectorProps {
  namespaces: Namespace[];
  question: string;
  selectedNamespace: string | null;
  answer: string;
  showAnswer: boolean;
  onNamespaceDetected: (namespace: string) => void;
}

export function useNamespaceDetector({
  namespaces,
  question,
  selectedNamespace,
  answer,
  showAnswer,
  onNamespaceDetected,
}: UseNamespaceDetectorProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const hasAutoDetected = useRef(false);

  useEffect(() => {
    const detect = async () => {
      // Logic guards:
      // 1. Must have namespaces loaded.
      // 2. Must have a question.
      // 3. Namespace explicitly NOT selected.
      // 4. No answer showing (prevent loop).
      // 5. Haven't run already.
      if (
        namespaces.length === 0 ||
        !question ||
        selectedNamespace ||
        answer ||
        showAnswer ||
        hasAutoDetected.current
      ) {
        return;
      }

      hasAutoDetected.current = true;
      setIsDetecting(true);
      let toastId: string | number | null = null;

      try {
        toastId = toast.loading("🤖 AI analyzing your question...");

        const res = await fetch("/api/classify-namespace", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: question,
            availableNamespaces: namespaces.map((n) => n.value),
          }),
        });

        if (!res.ok) throw new Error("Classification failed");

        const data = await res.json();

        if (data.namespace) {
          toast.update(toastId, {
            render: `Target Acquired: ${data.namespace}`,
            type: "success",
            isLoading: false,
            autoClose: 2000,
          });
          onNamespaceDetected(data.namespace);
        } else {
          toast.update(toastId, {
            render: "Could not auto-detect docs. Please select manualy.",
            type: "info",
            isLoading: false,
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error("Auto-detect error", error);
        if (toastId) toast.dismiss(toastId);
      } finally {
        setIsDetecting(false);
      }
    };

    detect();
  }, [namespaces, question, selectedNamespace, answer, showAnswer, onNamespaceDetected]);

  return { isDetecting };
}
