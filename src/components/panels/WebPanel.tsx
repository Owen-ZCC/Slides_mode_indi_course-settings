'use client';

import { useState } from 'react';
import { useEditor } from '@/store/EditorContext';
import { ChevronLeftIcon, CrawlIcon, UploadIcon, ArrowLeftIcon } from '@/components/icons';

interface WebPanelProps {
  onOpenWebCenter: () => void;
}

export default function WebPanel({ onOpenWebCenter }: WebPanelProps) {
  const { dispatchEditor } = useEditor();
  const [view, setView] = useState<'list' | 'upload' | 'crawl'>('list');
  const [uploadTab, setUploadTab] = useState<'file' | 'code'>('file');
  const [webName, setWebName] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [codeContent, setCodeContent] = useState('');

  const handleBack = () => {
    setView('list');
    setWebName('');
    setWebUrl('');
    setCodeContent('');
  };

  return (
    <div className="w-[420px] bg-white flex flex-col transition-all duration-300">
      {view === 'list' ? (
        <>
          {/* 头部 */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <span className="text-[15px] font-semibold text-gray-900">添加交互网页</span>
            <button
              onClick={() => dispatchEditor({ type: 'TOGGLE_PANEL_COLLAPSE' })}
              className="w-7 h-7 rounded-lg border-none bg-transparent cursor-pointer flex items-center justify-center transition-all text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
          </div>

          {/* 内容 */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-2 gap-3.5">
              {/* 网页中心 */}
              <button
                onClick={onOpenWebCenter}
                className="bg-[#fafbfc] border-[1.5px] border-gray-200 rounded-[14px] p-3.5 cursor-pointer transition-all duration-200 hover:border-[#ff9500] hover:bg-[#fffbf5] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,149,0,0.15)] group"
              >
                <div className="w-full h-[100px] bg-white rounded-lg mb-3 flex items-center justify-center border border-gray-200 opacity-90 -translate-y-0.5 transition-all group-hover:opacity-100 group-hover:translate-y-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 text-gray-300 group-hover:text-[#ff9500] transition-colors">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="2" y1="7" x2="22" y2="7" />
                    <circle cx="5" cy="5" r="0.5" fill="currentColor" />
                    <circle cx="7" cy="5" r="0.5" fill="currentColor" />
                    <circle cx="9" cy="5" r="0.5" fill="currentColor" />
                    <path d="M8 11h8M8 14h5" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-gray-900 text-center">网页中心</div>
              </button>

              {/* 上传网页 */}
              <button
                onClick={() => setView('upload')}
                className="bg-[#fafbfc] border-[1.5px] border-gray-200 rounded-[14px] p-3.5 cursor-pointer transition-all duration-200 hover:border-[#ff9500] hover:bg-[#fffbf5] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,149,0,0.15)] group"
              >
                <div className="w-full h-[100px] bg-white rounded-lg mb-3 flex items-center justify-center border border-gray-200 opacity-90 -translate-y-0.5 transition-all group-hover:opacity-100 group-hover:translate-y-0">
                  <UploadIcon className="w-12 h-12 text-gray-300 group-hover:text-[#ff9500] transition-colors" />
                </div>
                <div className="text-sm font-semibold text-gray-900 text-center">上传网页</div>
              </button>

              {/* 爬取网页 */}
              <button
                onClick={() => setView('crawl')}
                className="bg-[#fafbfc] border-[1.5px] border-gray-200 rounded-[14px] p-3.5 cursor-pointer transition-all duration-200 hover:border-[#ff9500] hover:bg-[#fffbf5] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,149,0,0.15)] group"
              >
                <div className="w-full h-[100px] bg-white rounded-lg mb-3 flex items-center justify-center border border-gray-200 opacity-90 -translate-y-0.5 transition-all group-hover:opacity-100 group-hover:translate-y-0">
                  <CrawlIcon className="w-12 h-12 text-gray-300 group-hover:text-[#ff9500] transition-colors" />
                </div>
                <div className="text-sm font-semibold text-gray-900 text-center">爬取网页</div>
              </button>
            </div>
          </div>
        </>
      ) : view === 'upload' ? (
        <>
          {/* 上传网页配置 */}
          <div className="py-4 px-5 border-b border-gray-100 flex items-center gap-3">
            <button
              onClick={handleBack}
              className="w-8 h-8 rounded-lg border-none bg-[#f9fafb] cursor-pointer flex items-center justify-center transition-all hover:bg-[#fff7ed] text-gray-500 hover:text-[#ff9500]"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <span className="text-[15px] font-semibold text-gray-900">上传网页</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">网页名称</label>
                <input
                  type="text"
                  value={webName}
                  onChange={(e) => setWebName(e.target.value)}
                  placeholder="请输入网页名称"
                  className="w-full h-11 px-3.5 border-[1.5px] border-gray-200 rounded-[10px] text-sm text-gray-900 bg-[#fafbfc] transition-all focus:outline-none focus:border-[#ff9500] focus:bg-white"
                />
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-5">
                <button
                  onClick={() => setUploadTab('file')}
                  className={`px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
                    uploadTab === 'file'
                      ? 'text-[#ff9500] border-[#ff9500] font-semibold'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  上传文件
                </button>
                <button
                  onClick={() => setUploadTab('code')}
                  className={`px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
                    uploadTab === 'code'
                      ? 'text-[#ff9500] border-[#ff9500] font-semibold'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  粘贴代码
                </button>
              </div>

              {uploadTab === 'file' ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl bg-[#fafbfc] py-10 px-5 min-h-[190px] text-center cursor-pointer transition-all hover:border-[#ff9500] hover:bg-[#fffbf5] flex flex-col items-center justify-center gap-2.5">
                  <UploadIcon className="w-12 h-12 text-gray-400 mb-3" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-gray-700">点击或拖拽文件到此处上传</p>
                  <p className="text-xs text-gray-500">支持 HTML、HTM、ZIP 格式</p>
                </div>
              ) : (
                <textarea
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  placeholder="请在此处粘贴完整的HTML代码"
                  className="w-full min-h-[190px] p-3 border border-gray-300 rounded-lg text-[13px] font-mono bg-white resize-y transition-all focus:outline-none focus:border-[#ff9500]"
                />
              )}

              <button
                disabled={!webName}
                className="w-full h-11 rounded-[10px] border-none bg-[#ff9500] text-white text-sm font-semibold cursor-pointer transition-all hover:bg-[#e68600] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                等待上传...
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* 爬取网页配置 */}
          <div className="py-4 px-5 border-b border-gray-100 flex items-center gap-3">
            <button
              onClick={handleBack}
              className="w-8 h-8 rounded-lg border-none bg-[#f9fafb] cursor-pointer flex items-center justify-center transition-all hover:bg-[#fff7ed] text-gray-500 hover:text-[#ff9500]"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <span className="text-[15px] font-semibold text-gray-900">爬取网页</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">网页名称</label>
                <input
                  type="text"
                  value={webName}
                  onChange={(e) => setWebName(e.target.value)}
                  placeholder="请输入网页名称"
                  className="w-full h-11 px-3.5 border-[1.5px] border-gray-200 rounded-[10px] text-sm text-gray-900 bg-[#fafbfc] transition-all focus:outline-none focus:border-[#ff9500] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">网页链接</label>
                <input
                  type="url"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  placeholder="请输入完整的网页URL地址"
                  className="w-full h-11 px-3.5 border-[1.5px] border-gray-200 rounded-[10px] text-sm text-gray-900 bg-[#fafbfc] transition-all focus:outline-none focus:border-[#ff9500] focus:bg-white"
                />
              </div>

              <button
                disabled={!webName || !webUrl}
                className="w-full h-11 rounded-[10px] border-none bg-[#ff9500] text-white text-sm font-semibold cursor-pointer transition-all hover:bg-[#e68600] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                等待输入...
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
