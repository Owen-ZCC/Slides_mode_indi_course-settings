'use client';

import { useState, useRef, useEffect } from 'react';
import { useEditor } from '@/store/EditorContext';
import { ChevronLeftIcon, SendIcon, PaperclipIcon } from '@/components/icons';

export default function AIPanel() {
  const { chatMessages, editorState, dispatchChat, dispatchEditor } = useEditor();
  const [inputValue, setInputValue] = useState(
    '创建一节45分钟的四年级教学内容为水的三态变化的课程'
  );
  const [hasMessages, setHasMessages] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!inputValue.trim() || editorState.isGenerating) return;

    // 添加用户消息
    dispatchChat({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        role: 'user',
        content: inputValue,
        timestamp: new Date(),
      },
    });

    setInputValue('');
    setHasMessages(true); // 标记已有消息，触发布局切换
    dispatchEditor({ type: 'SET_GENERATING', payload: true });

    // 模拟AI响应
    setTimeout(() => {
      dispatchChat({
        type: 'ADD_MESSAGE',
        payload: {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content:
            '好的，我将为您创建一节关于"水的三态变化"的四年级科学课程。\n\n课程将包含以下内容：\n1. 导入环节：生活中的水\n2. 新知讲解：固态、液态、气态\n3. 实验演示：冰的融化与水的蒸发\n4. 互动练习：状态变化判断\n5. 课堂小结与作业布置\n\n正在为您生成课件页面...',
          timestamp: new Date(),
        },
      });
      dispatchEditor({ type: 'SET_GENERATING', payload: false });
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  return (
    <div className="w-[420px] bg-white flex flex-col transition-all duration-300 h-full">
      {/* 头部 */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <span className="text-[15px] font-semibold text-gray-900 flex items-center gap-2.5">
          Coco AI
        </span>
        <button
          onClick={() => dispatchEditor({ type: 'TOGGLE_PANEL_COLLAPSE' })}
          className="w-7 h-7 rounded-lg border-none bg-transparent cursor-pointer flex items-center justify-center transition-all text-gray-400 hover:bg-gray-100 hover:text-gray-500"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
      </div>

      {/* 输入区域 - 在顶部（无消息时） */}
      {!hasMessages && (
        <div className="p-4 bg-white border-b border-gray-100 flex-shrink-0">
          <div className="flex flex-col gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-3 transition-all focus-within:border-orange-500 focus-within:bg-white">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                autoResize();
              }}
              onKeyDown={handleKeyDown}
              placeholder="例如:创建一节45分钟的四年级教学内容为水的三态变化的课程"
              disabled={editorState.isGenerating}
              className="w-full border-none bg-transparent outline-none resize-none text-sm text-gray-900 leading-relaxed min-h-[72px] max-h-[180px] font-inherit placeholder:text-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
            />

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-lg border-none bg-transparent cursor-pointer flex items-center justify-center transition-all hover:bg-orange-50 group">
                  <PaperclipIcon className="w-5 h-5 text-gray-500 group-hover:text-orange-500" />
                </button>

                {editorState.isGenerating && (
                  <span className="text-sm text-gray-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    生成中……
                  </span>
                )}
              </div>

              <button
                onClick={handleSend}
                disabled={editorState.isGenerating || !inputValue.trim()}
                className={`w-9 h-9 rounded-full border-none cursor-pointer flex items-center justify-center transition-all ${
                  editorState.isGenerating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 hover:scale-105'
                }`}
              >
                <SendIcon className="w-[18px] h-[18px] text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-5 min-h-0">
        {chatMessages.length > 0 && (
          <div className="min-h-[600px] pb-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 px-4 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-orange-50 border border-orange-500 text-gray-900 rounded-2xl rounded-br-sm'
                      : 'bg-gray-50 border border-gray-200 text-gray-700 rounded-2xl rounded-bl-sm whitespace-pre-line'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 输入区域 - 在底部（有消息时） */}
      {hasMessages && (
        <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
          <div className="flex flex-col gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-3 transition-all focus-within:border-orange-500 focus-within:bg-white">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                autoResize();
              }}
              onKeyDown={handleKeyDown}
              placeholder="继续对话..."
              disabled={editorState.isGenerating}
              className="w-full border-none bg-transparent outline-none resize-none text-sm text-gray-900 leading-relaxed min-h-[72px] max-h-[180px] font-inherit placeholder:text-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
            />

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-lg border-none bg-transparent cursor-pointer flex items-center justify-center transition-all hover:bg-orange-50 group">
                  <PaperclipIcon className="w-5 h-5 text-gray-500 group-hover:text-orange-500" />
                </button>

                {editorState.isGenerating && (
                  <span className="text-sm text-gray-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    生成中……
                  </span>
                )}
              </div>

              <button
                onClick={handleSend}
                disabled={editorState.isGenerating || !inputValue.trim()}
                className={`w-9 h-9 rounded-full border-none cursor-pointer flex items-center justify-center transition-all ${
                  editorState.isGenerating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 hover:scale-105'
                }`}
              >
                <SendIcon className="w-[18px] h-[18px] text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
