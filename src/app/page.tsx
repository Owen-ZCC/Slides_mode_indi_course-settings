'use client';

import { useState } from 'react';
import { EditorProvider, useEditor } from '@/store/EditorContext';
import { TopBar, LeftSidebar, CenterEditor, RightPanel } from '@/components/layout';
import { CreateModal, PublishModal } from '@/components/modals';
import { PageTemplateType, ToolType, CoursePage } from '@/types';

function CoursewareEditor() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showPPTParseModal, setShowPPTParseModal] = useState(false);
  const [pptParseStatus, setPptParseStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [pptFileName, setPptFileName] = useState('');

  const { dispatchEditor, dispatchCourse, courseData } = useEditor();

  // 页面模板处理 - 实现 addPageFromTemplate
  const handleAddPage = (template: PageTemplateType) => {
    // 1. 切换到编辑模式
    dispatchEditor({ type: 'SWITCH_TO_EDIT_MODE' });

    // 2. 创建新页面
    const newPage: CoursePage = {
      id: `page-${Date.now()}`,
      title: getTemplateTitle(template),
      type: template,
      elements: [],
      order: courseData.pages.length,
    };

    // 3. 添加页面到课程
    dispatchCourse({ type: 'ADD_PAGE', payload: newPage });

    // 4. 选中新页面
    dispatchEditor({ type: 'SELECT_PAGE', payload: newPage.id });
  };

  // 获取模板标题
  const getTemplateTitle = (template: PageTemplateType): string => {
    const titles: Record<PageTemplateType, string> = {
      'title': '标题页',
      'image': '图片页',
      'content': '内容页',
      'text-image': '文图页',
      'image-text': '图文页',
      'diagnosis': '试题诊断',
      'conversation-diagnosis': '对话诊断',
      'tiered-teaching': '分层教学',
      'placeholder': '配置中...',
    };
    return titles[template] || '新页面';
  };

  // 工具选择处理 - 实现 selectTool
  const handleSelectTool = (tool: ToolType) => {
    // 1. 切换到工具模式
    dispatchEditor({ type: 'SWITCH_TO_TOOL_MODE', payload: tool });

    // 2. 如果还没有页面，先进入编辑模式
    if (courseData.pages.length === 0) {
      dispatchEditor({ type: 'SWITCH_TO_EDIT_MODE' });
    }
  };

  // PPT 上传处理
  const handleUploadPPT = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ppt,.pptx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setPptFileName(file.name);
        setPptParseStatus('loading');
        setShowPPTParseModal(true);

        // 模拟解析过程
        setTimeout(() => {
          setPptParseStatus('success');
          // 解析成功后添加页面
          handleAddPage('content');
        }, 2000);
      }
    };
    input.click();
  };

  // 模态框处理
  const handleOpenAppCenter = () => {
    console.log('Open app center');
    // TODO: 实现打开应用中心浮窗
  };

  const handleOpenCreateApp = () => {
    console.log('Open create app');
    // TODO: 实现创建应用浮窗
  };

  const handleOpenWebCenter = () => {
    console.log('Open web center');
    // TODO: 实现打开网页中心浮窗
  };

  const handleOpenVideoModal = () => {
    console.log('Open video modal');
    // TODO: 实现视频来源选择浮窗
  };

  const handleOpenAudioModal = () => {
    console.log('Open audio modal');
    // TODO: 实现音频上传浮窗
  };

  const handleOpenDocumentModal = () => {
    console.log('Open document modal');
    // TODO: 实现文档上传浮窗
  };

  const handleOpenCollectionModal = () => {
    console.log('Open collection modal');
    // TODO: 实现资源集合浮窗
  };

  // 创建课程处理
  const handleStartAICreate = () => {
    setShowCreateModal(false);
    // 切换到AI面板
    dispatchEditor({ type: 'SET_ACTIVE_PANEL', payload: 'ai' });
  };

  const handleStartPPTUpload = () => {
    setShowCreateModal(false);
    handleUploadPPT();
  };

  const handleCreateBlank = () => {
    setShowCreateModal(false);
    // 创建空白课程 - 添加一个内容页
    handleAddPage('content');
  };

  // 发布处理
  const handlePublish = (config: {
    subject: string;
    grade: string;
    classId: string;
    visibility: 'students' | 'organization' | 'public';
  }) => {
    console.log('Publish with config:', config);
    setShowPublishModal(false);
    // TODO: 实现发布逻辑
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans">
      <TopBar
        onShowCreateModal={() => setShowCreateModal(true)}
        onShowPublishModal={() => setShowPublishModal(true)}
      />

      <div className="flex-1 flex relative p-4 gap-4 overflow-hidden">
        <LeftSidebar
          onAddPage={handleAddPage}
          onSelectTool={handleSelectTool}
          onOpenAppCenter={handleOpenAppCenter}
          onOpenCreateApp={handleOpenCreateApp}
          onOpenWebCenter={handleOpenWebCenter}
          onOpenVideoModal={handleOpenVideoModal}
          onOpenAudioModal={handleOpenAudioModal}
          onOpenDocumentModal={handleOpenDocumentModal}
          onOpenCollectionModal={handleOpenCollectionModal}
          onUploadPPT={handleUploadPPT}
        />

        <CenterEditor />

        <RightPanel />
      </div>

      {/* 模态框 */}
      <CreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onStartAICreate={handleStartAICreate}
        onStartPPTUpload={handleStartPPTUpload}
        onCreateBlank={handleCreateBlank}
      />

      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        courseTitle="新建课程"
        onPublish={handlePublish}
      />

      {/* PPT解析浮窗 */}
      {showPPTParseModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1200]">
          <div className="bg-white rounded-2xl p-6 w-[360px] shadow-[0_16px_40px_rgba(0,0,0,0.16)] flex flex-col gap-3.5 text-center">
            <div className={`w-14 h-14 rounded-[14px] mx-auto flex items-center justify-center ${
              pptParseStatus === 'loading' ? 'bg-orange-50 text-orange-500' :
              pptParseStatus === 'success' ? 'bg-green-50 text-green-600' :
              'bg-red-50 text-red-600'
            }`}>
              {pptParseStatus === 'loading' && (
                <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
              )}
              {pptParseStatus === 'success' && (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {pptParseStatus === 'error' && (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </div>
            <div className="text-base font-bold text-gray-900">
              {pptParseStatus === 'loading' ? '解析中...' :
               pptParseStatus === 'success' ? '解析成功' : '解析失败'}
            </div>
            <div className="text-sm text-gray-500">
              {pptParseStatus === 'loading' ? `正在处理 ${pptFileName}` :
               pptParseStatus === 'success' ? `已从 "${pptFileName}" 生成课程页面` : '请重试或选择其他文件'}
            </div>
            <div className="flex gap-2.5 mt-1">
              <button
                onClick={() => setShowPPTParseModal(false)}
                className="flex-1 h-10 rounded-xl border-none bg-orange-500 text-white text-sm font-semibold cursor-pointer hover:bg-orange-600"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <EditorProvider>
      <CoursewareEditor />
    </EditorProvider>
  );
}
