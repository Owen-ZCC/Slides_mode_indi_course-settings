'use client';

import { useEditor } from '@/store/EditorContext';
import PrimaryMenu from './PrimaryMenu';
import {
  AIPanel,
  PagesPanel,
  ToolsPanel,
  AppsPanel,
  WebPanel,
  ResourcesPanel,
  DifferentiatedPanel,
} from '@/components/panels';
import { PageTemplateType, ToolType } from '@/types';

interface LeftSidebarProps {
  onAddPage: (template: PageTemplateType) => void;
  onSelectTool: (tool: ToolType) => void;
  onOpenAppCenter: () => void;
  onOpenCreateApp: () => void;
  onOpenWebCenter: () => void;
  onOpenVideoModal: () => void;
  onOpenAudioModal: () => void;
  onOpenDocumentModal: () => void;
  onOpenCollectionModal: () => void;
  onUploadPPT?: () => void;
}

export default function LeftSidebar({
  onAddPage,
  onSelectTool,
  onOpenAppCenter,
  onOpenCreateApp,
  onOpenWebCenter,
  onOpenVideoModal,
  onOpenAudioModal,
  onOpenDocumentModal,
  onOpenCollectionModal,
  onUploadPPT,
}: LeftSidebarProps) {
  const { editorState } = useEditor();

  // 渲染面板内容
  const renderPanelContent = (panelType: string) => {
    switch (panelType) {
      case 'ai':
        return <AIPanel />;
      case 'pages':
        return <PagesPanel onAddPage={onAddPage} onUploadPPT={onUploadPPT} />;
      case 'tools':
        return <ToolsPanel onSelectTool={onSelectTool} />;
      case 'apps':
        return (
          <AppsPanel
            onOpenAppCenter={onOpenAppCenter}
            onOpenCreateApp={onOpenCreateApp}
          />
        );
      case 'web':
        return <WebPanel onOpenWebCenter={onOpenWebCenter} />;
      case 'resources':
        return (
          <ResourcesPanel
            onOpenVideoModal={onOpenVideoModal}
            onOpenAudioModal={onOpenAudioModal}
            onOpenDocumentModal={onOpenDocumentModal}
            onOpenCollectionModal={onOpenCollectionModal}
          />
        );
      case 'differentiated':
        return <DifferentiatedPanel />;
      default:
        return null;
    }
  };

  // 需要保持状态的面板列表
  const persistentPanels = ['differentiated'];

  return (
    <div className="flex bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] relative z-50 overflow-hidden h-full">
      <PrimaryMenu />
      {/* 需要保持状态的面板：使用 CSS 隐藏而不是卸载 */}
      {persistentPanels.map((panelType) => (
        <div
          key={panelType}
          className={
            editorState.activePanel === panelType && !editorState.isPanelCollapsed
              ? ''
              : 'hidden'
          }
        >
          {renderPanelContent(panelType)}
        </div>
      ))}
      {/* 其他面板：正常条件渲染 */}
      {!editorState.isPanelCollapsed &&
        editorState.activePanel &&
        !persistentPanels.includes(editorState.activePanel) &&
        renderPanelContent(editorState.activePanel)}
    </div>
  );
}
