'use client';

import { XIcon, LayersIcon, UploadIcon, HomeIcon, FileIcon } from '@/components/icons';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAICreate: () => void;
  onStartPPTUpload: () => void;
  onCreateBlank: () => void;
}

export default function CreateModal({
  isOpen,
  onClose,
  onStartAICreate,
  onStartPPTUpload,
  onCreateBlank,
}: CreateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] animate-fadeIn">
      <div className="bg-white rounded-[20px] p-10 max-w-[900px] w-[90%] max-h-[85vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.2)] animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl border-none bg-gray-100 cursor-pointer flex items-center justify-center transition-all hover:bg-gray-200"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-[28px] font-bold text-gray-900 mb-2">创建新课程</h2>
          <p className="text-[15px] text-gray-500">选择一种方式开始创建您的互动课件</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* 从AI创建 - 推荐 */}
          <button
            onClick={onStartAICreate}
            className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-500 rounded-2xl p-6 cursor-pointer transition-all flex flex-col items-center text-center relative hover:border-orange-500 hover:bg-orange-50 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,149,0,0.15)]"
          >
            <span className="absolute top-3 right-3 bg-orange-500 text-white text-[11px] font-semibold px-2.5 py-1 rounded-xl">
              推荐
            </span>
            <div className="w-14 h-14 rounded-[14px] bg-white flex items-center justify-center mb-4">
              <LayersIcon className="w-7 h-7 text-orange-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1.5">从AI创建</h3>
            <p className="text-sm text-gray-500 leading-snug">AI自动生成完整教学内容</p>
          </button>

          {/* 上传我的文件 */}
          <button
            onClick={onStartPPTUpload}
            className="bg-gray-50 border border-gray-200 rounded-2xl p-6 cursor-pointer transition-all flex flex-col items-center text-center hover:border-orange-500 hover:bg-orange-50 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,149,0,0.15)]"
          >
            <div className="w-14 h-14 rounded-[14px] bg-white flex items-center justify-center mb-4">
              <UploadIcon className="w-7 h-7 text-gray-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1.5">上传我的文件</h3>
            <p className="text-sm text-gray-500 leading-snug">上传本地PPT文件并解析</p>
          </button>

          {/* 从资源库导入 */}
          <button className="bg-gray-50 border border-gray-200 rounded-2xl p-6 cursor-pointer transition-all flex flex-col items-center text-center hover:border-orange-500 hover:bg-orange-50 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,149,0,0.15)]">
            <div className="w-14 h-14 rounded-[14px] bg-white flex items-center justify-center mb-4">
              <HomeIcon className="w-7 h-7 text-gray-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1.5">从资源库导入</h3>
            <p className="text-sm text-gray-500 leading-snug">选择已有的课程模板</p>
          </button>

          {/* 创建空白 */}
          <button
            onClick={onCreateBlank}
            className="bg-gray-50 border border-gray-200 rounded-2xl p-6 cursor-pointer transition-all flex flex-col items-center text-center hover:border-orange-500 hover:bg-orange-50 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,149,0,0.15)]"
          >
            <div className="w-14 h-14 rounded-[14px] bg-white flex items-center justify-center mb-4">
              <FileIcon className="w-7 h-7 text-gray-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1.5">创建空白</h3>
            <p className="text-sm text-gray-500 leading-snug">从零开始自定义</p>
          </button>
        </div>
      </div>
    </div>
  );
}
