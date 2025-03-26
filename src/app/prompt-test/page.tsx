"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface SystemPrompt {
  id: string;
  name: string;
  content: string;
}

export default function PromptTestPage() {
  const [systemPrompts, setSystemPrompts] = useState<SystemPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemPrompts();
  }, []);

  const fetchSystemPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from("system_prompts")
        .select("*")
        .order("name");

      if (error) throw error;
      setSystemPrompts(data || []);
    } catch (err) {
      console.error("시스템 프롬프트 조회 실패:", err);
      setError("시스템 프롬프트를 불러오는데 실패했습니다.");
    }
  };

  const handleTest = async () => {
    if (!selectedPrompt) {
      setError("시스템 프롬프트를 선택해주세요.");
      return;
    }

    if (!input.trim()) {
      setError("입력 내용을 작성해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const selectedSystemPrompt = systemPrompts.find(
        (p) => p.id === selectedPrompt
      );
      if (!selectedSystemPrompt)
        throw new Error("선택된 시스템 프롬프트를 찾을 수 없습니다.");

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemPrompt: selectedSystemPrompt.content,
          userInput: input,
        }),
      });

      if (!response.ok) {
        throw new Error("API 요청에 실패했습니다.");
      }

      const data = await response.json();
      setOutput(data.response);
    } catch (err) {
      console.error("GPT API 요청 실패:", err);
      setError("GPT API 요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">프롬프트 테스트</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-500 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label
            htmlFor="systemPrompt"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            시스템 프롬프트
          </label>
          <select
            id="systemPrompt"
            value={selectedPrompt}
            onChange={(e) => setSelectedPrompt(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">시스템 프롬프트 선택</option>
            {systemPrompts.map((prompt) => (
              <option key={prompt.id} value={prompt.id}>
                {prompt.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              입력
            </label>
            <textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={12}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="테스트할 내용을 입력하세요..."
            />
          </div>

          <div>
            <label
              htmlFor="output"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              출력
            </label>
            <textarea
              id="output"
              value={output}
              readOnly
              rows={12}
              className="w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
              placeholder="GPT API 응답이 여기에 표시됩니다..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleTest}
            disabled={loading}
            className="px-6 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "처리 중..." : "테스트 실행"}
          </button>
        </div>
      </div>
    </div>
  );
}
