'use client';

import { useEditor } from '@/store/EditorContext';
import { PanelType } from '@/types';
import {
  LayersIcon,
  FileIcon,
  SettingsIcon,
  GridIcon,
  GlobeIcon,
  FolderIcon,
  GraduationCapIcon,
} from '@/components/icons';

const menuItems: { id: PanelType; label: string; icon: React.ReactNode }[] = [
  { id: 'ai', label: 'Coco AI', icon: <LayersIcon className="w-5 h-5" /> },
  { id: 'pages', label: '页面', icon: <FileIcon className="w-5 h-5" /> },
  { id: 'tools', label: '互动工具', icon: <SettingsIcon className="w-5 h-5" /> },
  { id: 'apps', label: 'AI应用', icon: <GridIcon className="w-5 h-5" /> },
  { id: 'web', label: '交互网页', icon: <GlobeIcon className="w-5 h-5" /> },
  { id: 'resources', label: '资源', icon: <FolderIcon className="w-5 h-5" /> },
  { id: 'differentiated', label: '因材施教', icon: <GraduationCapIcon className="w-5 h-5" /> },
];

export default function PrimaryMenu() {
  const { editorState, dispatchEditor } = useEditor();

  const handleMenuClick = (panelId: PanelType) => {
    dispatchEditor({ type: 'SET_ACTIVE_PANEL', payload: panelId });
  };

  return (
    <div className="w-[100px] bg-gray-50 border-r border-gray-200 py-4 px-2 flex flex-col gap-1.5">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => handleMenuClick(item.id)}
          className={`w-[84px] py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all relative border-none ${
            editorState.activePanel === item.id
              ? 'bg-primary-50 shadow-[0_2px_8px_rgba(238,129,44,0.15)]'
              : 'bg-transparent hover:bg-gray-100'
          }`}
        >
          {/* 左侧指示条 */}
          {editorState.activePanel === item.id && (
            <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r" />
          )}

          <span
            className={`${
              editorState.activePanel === item.id
                ? 'text-primary-600'
                : 'text-gray-500'
            }`}
          >
            {item.icon}
          </span>

          <span
            className={`text-[11px] font-medium text-center leading-tight ${
              editorState.activePanel === item.id
                ? 'text-primary-600 font-semibold'
                : 'text-gray-500'
            }`}
          >
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}
