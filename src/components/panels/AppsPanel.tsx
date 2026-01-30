'use client';

import { useEditor } from '@/store/EditorContext';
import { ChevronLeftIcon, GridIcon, PlusIcon } from '@/components/icons';

interface AppsPanelProps {
  onOpenAppCenter: () => void;
  onOpenCreateApp: () => void;
}

export default function AppsPanel({ onOpenAppCenter, onOpenCreateApp }: AppsPanelProps) {
  const { dispatchEditor } = useEditor();

  return (
    <div className="w-[420px] bg-white flex flex-col transition-all duration-300">
      {/* 头部 */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <span className="text-[15px] font-semibold text-gray-900">添加AI应用</span>
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
          {/* 应用中心 */}
          <button
            onClick={onOpenAppCenter}
            className="bg-gray-50 border border-gray-200 rounded-[14px] p-3.5 cursor-pointer transition-all relative overflow-hidden hover:border-orange-500 hover:bg-orange-50 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,149,0,0.15)] group"
          >
            <div className="w-full h-[100px] bg-white rounded-lg mb-3 flex items-center justify-center border border-gray-200">
              <GridIcon className="w-12 h-12 text-gray-300 group-hover:text-orange-500 transition-colors" />
            </div>
            <div className="text-sm font-semibold text-gray-900 text-center">
              应用中心
            </div>
          </button>

          {/* 创建应用 */}
          <button
            onClick={onOpenCreateApp}
            className="bg-gray-50 border border-gray-200 rounded-[14px] p-3.5 cursor-pointer transition-all relative overflow-hidden hover:border-orange-500 hover:bg-orange-50 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,149,0,0.15)] group"
          >
            <div className="w-full h-[100px] bg-white rounded-lg mb-3 flex items-center justify-center border border-gray-200">
              <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center group-hover:border-orange-500 transition-colors">
                <PlusIcon className="w-6 h-6 text-gray-300 group-hover:text-orange-500 transition-colors" />
              </div>
            </div>
            <div className="text-sm font-semibold text-gray-900 text-center">
              创建应用
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
