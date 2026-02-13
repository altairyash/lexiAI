import { Namespace } from "@/types";

export async function fetchNamespaces(
    setNamespaces: (namespaces: Namespace[]) => void,
    setIsNamespacesLoading: (loading: boolean) => void,
    toast: { error: (message: string) => void }
  ) {
    try {
      const res = await fetch("/api/namespaces");
      if (!res.ok) throw new Error("Failed network request");
      const data = await res.json();
      setNamespaces(
        data.namespaces
          .filter((ns: string) => ns !== "")
          .map((ns: string) => ({ value: ns, label: ns }))
      );
    } catch (error) {
      toast.error("Error fetching namespaces");
      console.error("fetchNamespaces error:", error);
    } finally {
      setIsNamespacesLoading(false);
    }
  }
  
  export async function handleQuery({
    selectedNamespace,
    question,
    cache,
    setCache,
    setAnswer,
    setIsLoading,
    toast,
  }: {
    selectedNamespace: string | null;
    question: string;
    cache: { [key: string]: string };
    setCache: (cache: { [key: string]: string } | ((cache: { [key: string]: string }) => { [key: string]: string })) => void;
    setAnswer: (answer: string) => void;
    setIsLoading: (loading: boolean) => void;
    toast: { error: (message: string) => void };
  }) {
    if (!selectedNamespace) {
      toast.error("Please select a namespace first.");
      return;
    }
    if (!question.trim()) {
      toast.error("Please enter a question.");
      return;
    }
  
    const cacheKey = `${selectedNamespace}-${question.trim().toLowerCase()}`;
    if (cache[cacheKey]) {
      setAnswer(cache[cacheKey]);
      return;
    }
  
    setIsLoading(true);
    try {
      // Normalize question for better cache hits
      const normalizedQuestion = question.trim();

      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: normalizedQuestion, namespace: selectedNamespace }),
      });
      
      if (!res.ok) throw new Error("Query failed");

      const data = await res.json();
      setAnswer(data.answer);
      setCache((prevCache: { [key: string]: string }) => ({ ...prevCache, [cacheKey]: data.answer as string }));
    } catch (error) {
      toast.error("Failed to fetch answer. Please try again.");
      console.error("handleQuery error:", error);
    } finally {
      setIsLoading(false);
    }
  }
  