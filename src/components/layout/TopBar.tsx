'use client';

import { useState } from 'react';
import { useEditor } from '@/store/EditorContext';
import { ArrowLeftIcon, EyeIcon, SaveIcon, ClockIcon } from '@/components/icons';

interface TopBarProps {
  onShowCreateModal: () => void;
  onShowPublishModal: () => void;
}

export default function TopBar({ onShowCreateModal, onShowPublishModal }: TopBarProps) {
  const { courseData, editorState, dispatchCourse } = useEditor();
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const handleTitleChange = (e: React.FocusEvent<HTMLDivElement>) => {
    const newTitle = e.currentTarget.textContent || '新建课程';
    dispatchCourse({ type: 'SET_TITLE', payload: newTitle });
    setIsEditingTitle(false);
  };

  const getSaveStatusText = () => {
    switch (editorState.saveStatus) {
      case 'saved':
        return '已保存';
      case 'saving':
        return '保存中...';
      default:
        return '未保存';
    }
  };

  const getSaveStatusColor = () => {
    switch (editorState.saveStatus) {
      case 'saved':
        return 'bg-green-500';
      case 'saving':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="h-16 bg-white flex items-center justify-between px-6 relative z-[100] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
      {/* 左侧 */}
      <div className="flex items-center gap-4">
        <button
          onClick={onShowCreateModal}
          className="w-8 h-8 rounded-lg border-none bg-gray-50 cursor-pointer flex items-center justify-center transition-all hover:bg-gray-100 hover:-translate-x-0.5"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </button>

        <div
          contentEditable
          suppressContentEditableWarning
          onFocus={() => setIsEditingTitle(true)}
          onBlur={handleTitleChange}
          className={`text-base font-semibold text-gray-900 py-2 px-3 border rounded-lg cursor-text transition-all ${
            isEditingTitle
              ? 'border-orange-500 bg-orange-50'
              : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
          }`}
        >
          {courseData.title}
        </div>

        <div className="text-sm text-gray-500 flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${getSaveStatusColor()} animate-pulse`} />
          <span>{getSaveStatusText()}</span>
        </div>
      </div>

      {/* 右侧 */}
      <div className="flex items-center gap-3">
        <button className="h-10 px-5 rounded-[10px] border-[1.5px] border-gray-200 text-sm font-medium cursor-pointer transition-all flex items-center gap-2 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-px hover:shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <EyeIcon className="w-4 h-4" />
          预览
        </button>

        <button className="h-10 px-5 rounded-[10px] border-[1.5px] border-gray-200 text-sm font-medium cursor-pointer transition-all flex items-center gap-2 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-px hover:shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <SaveIcon className="w-4 h-4" />
          保存
        </button>

        <button
          onClick={onShowPublishModal}
          className="h-10 px-5 rounded-[10px] border-[1.5px] border-orange-500 text-sm font-medium cursor-pointer transition-all flex items-center gap-2 bg-orange-500 text-white shadow-[0_2px_8px_rgba(255,149,0,0.2)] hover:bg-orange-600 hover:border-orange-600 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(255,149,0,0.3)]"
        >
          <ClockIcon className="w-4 h-4" />
          发布
        </button>
      </div>
    </div>
  );
}
