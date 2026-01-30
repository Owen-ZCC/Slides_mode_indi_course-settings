'use client';

import { useEditor } from '@/store/EditorContext';
import { ChevronLeftIcon, VideoIcon, MusicIcon, FileIcon, GridIcon } from '@/components/icons';

interface ResourcesPanelProps {
  onOpenVideoModal: () => void;
  onOpenAudioModal: () => void;
  onOpenDocumentModal: () => void;
  onOpenCollectionModal: () => void;
}

export default function ResourcesPanel({
  onOpenVideoModal,
  onOpenAudioModal,
  onOpenDocumentModal,
  onOpenCollectionModal,
}: ResourcesPanelProps) {
  const { dispatchEditor } = useEditor();

  const resources = [
    { id: 'video', name: '视频', icon: <VideoIcon className="w-12 h-12" />, onClick: onOpenVideoModal },
    { id: 'audio', name: '音频', icon: <MusicIcon className="w-12 h-12" />, onClick: onOpenAudioModal },
    { id: 'document', name: '文档', icon: <FileIcon className="w-12 h-12" />, onClick: onOpenDocumentModal },
    { id: 'collection', name: '资源集合', icon: <GridIcon className="w-12 h-12" />, onClick: onOpenCollectionModal },
  ];

  return (
    <div className="w-[420px] bg-white flex flex-col transition-all duration-300">
      {/* 头部 */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <span className="text-[15px] font-semibold text-gray-900">添加资源</span>
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
          {resources.map((resource) => (
            <button
              key={resource.id}
              onClick={resource.onClick}
              className="bg-gray-50 border border-gray-200 rounded-[14px] p-3.5 cursor-pointer transition-all hover:border-orange-500 hover:bg-orange-50 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,149,0,0.15)] group"
            >
              <div className="w-full h-[100px] bg-white rounded-lg mb-3 flex items-center justify-center border border-gray-200">
                <span className="text-gray-300 group-hover:text-orange-500 transition-colors">
                  {resource.icon}
                </span>
              </div>
              <div className="text-sm font-semibold text-gray-900 text-center">
                {resource.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
