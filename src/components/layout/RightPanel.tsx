'use client';

import { useState } from 'react';
import { useEditor } from '@/store/EditorContext';
import { ChevronLeftIcon, PlusIcon, TrashIcon, GripVerticalIcon } from '@/components/icons';
import { CoursePage } from '@/types';

export default function RightPanel() {
  const { editorState, courseData, dispatchEditor, dispatchCourse } = useEditor();
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);
  const [dragOverPageId, setDragOverPageId] = useState<string | null>(null);

  // 获取页面的显示编号（根据类型和配置组）
  const getPageDisplayNumber = (page: CoursePage): string => {
    if (page.type === 'diagnosis') {
      const groupIndex = page.diagnosisData?.groupIndex;
      return groupIndex ? `${groupIndex}` : '';
    } else if (page.type === 'conversation-diagnosis') {
      const groupIndex = page.conversationDiagnosisData?.configGroupId ?
        courseData.pages.find(p => p.diagnosisData?.configGroupId === page.conversationDiagnosisData?.configGroupId)?.diagnosisData?.groupIndex :
        undefined;
      return groupIndex ? `${groupIndex}` : '';
    } else if (page.type === 'tiered-teaching') {
      const groupIndex = page.tieredTeachingData?.groupIndex;
      return groupIndex ? `${groupIndex}` : '';
    }
    return '';
  };

  // 处理拖拽开始
  const handleDragStart = (e: React.DragEvent, pageId: string) => {
    setDraggedPageId(pageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    setDraggedPageId(null);
    setDragOverPageId(null);
  };

  // 处理拖拽悬停
  const handleDragOver = (e: React.DragEvent, pageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverPageId(pageId);
  };

  // 处理拖拽离开
  const handleDragLeave = () => {
    setDragOverPageId(null);
  };

  // 验证拖拽是否有效
  const isValidDragDrop = (draggedPage: CoursePage, targetPage: CoursePage, targetIndex: number): { valid: boolean; message?: string } => {
    // 获取拖拽页面和目标页面的配置组ID
    const draggedGroupId = draggedPage.configGroupId ||
                          draggedPage.diagnosisData?.configGroupId ||
                          draggedPage.conversationDiagnosisData?.configGroupId ||
                          draggedPage.tieredTeachingData?.configGroupId;

    const targetGroupId = targetPage.configGroupId ||
                         targetPage.diagnosisData?.configGroupId ||
                         targetPage.conversationDiagnosisData?.configGroupId ||
                         targetPage.tieredTeachingData?.configGroupId;

    // 如果拖拽的是分层教学页面，不能放在诊断页面之前
    if (draggedPage.type === 'tiered-teaching' && draggedGroupId) {
      const diagnosisPage = courseData.pages.find(p =>
        p.type === 'diagnosis' &&
        (p.diagnosisData?.configGroupId === draggedGroupId)
      );

      if (diagnosisPage) {
        const diagnosisIndex = courseData.pages.indexOf(diagnosisPage);
        if (targetIndex <= diagnosisIndex) {
          return {
            valid: false,
            message: '学生须完成"认知起点诊断"才能进入"分层教学"'
          };
        }
      }
    }

    // 不同配置组的页面不能穿插
    if (draggedGroupId && targetGroupId && draggedGroupId !== targetGroupId) {
      // 检查是否会导致配置组穿插
      const draggedGroupPages = courseData.pages.filter(p => {
        const gId = p.configGroupId || p.diagnosisData?.configGroupId ||
                   p.conversationDiagnosisData?.configGroupId || p.tieredTeachingData?.configGroupId;
        return gId === draggedGroupId;
      });

      const targetGroupPages = courseData.pages.filter(p => {
        const gId = p.configGroupId || p.diagnosisData?.configGroupId ||
                   p.conversationDiagnosisData?.configGroupId || p.tieredTeachingData?.configGroupId;
        return gId === targetGroupId;
      });

      // 简单检查：如果两个组都有多个页面，不允许穿插
      if (draggedGroupPages.length > 1 && targetGroupPages.length > 1) {
        return {
          valid: false,
          message: '不同的"因材施教"设置不能穿插'
        };
      }
    }

    return { valid: true };
  };

  // 处理拖拽放下
  const handleDrop = (e: React.DragEvent, targetPageId: string) => {
    e.preventDefault();

    if (!draggedPageId || draggedPageId === targetPageId) {
      handleDragEnd();
      return;
    }

    const draggedPage = courseData.pages.find(p => p.id === draggedPageId);
    const targetPage = courseData.pages.find(p => p.id === targetPageId);

    if (!draggedPage || !targetPage) {
      handleDragEnd();
      return;
    }

    const targetIndex = courseData.pages.indexOf(targetPage);
    const validation = isValidDragDrop(draggedPage, targetPage, targetIndex);

    if (!validation.valid) {
      alert(validation.message);
      handleDragEnd();
      return;
    }

    // 重新排序页面
    const newPages = courseData.pages.filter(p => p.id !== draggedPageId);
    const draggedIndex = courseData.pages.indexOf(draggedPage);
    const insertIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;

    newPages.splice(insertIndex, 0, draggedPage);

    // 更新order属性
    const reorderedPages = newPages.map((page, index) => ({
      ...page,
      order: index
    }));

    dispatchCourse({ type: 'REORDER_PAGES', payload: reorderedPages });
    handleDragEnd();
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex flex-col transition-all duration-300 relative z-50 overflow-hidden h-full ${
        editorState.isRightPanelCollapsed ? 'w-[60px]' : 'w-[320px]'
      }`}
    >
      {/* 头部 */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        {!editorState.isRightPanelCollapsed && (
          <span className="text-[15px] font-semibold text-gray-900">页面大纲</span>
        )}
        <button
          onClick={() => dispatchEditor({ type: 'TOGGLE_RIGHT_PANEL' })}
          className="w-7 h-7 rounded-lg border-none bg-transparent cursor-pointer flex items-center justify-center transition-all text-gray-400 hover:bg-gray-100 hover:text-gray-500"
        >
          <ChevronLeftIcon
            className={`w-4 h-4 transition-transform ${
              editorState.isRightPanelCollapsed ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {!editorState.isRightPanelCollapsed && (
        <div className="flex-1 flex flex-col border-t border-gray-100 overflow-hidden min-h-0">
          {/* 工具栏 */}
          <div className="flex items-center justify-between px-3 py-2.5 gap-2 border-b border-gray-100">
            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>大纲</span>
            </div>
            <div className="flex gap-1.5">
              <button className="h-8 px-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all hover:bg-orange-50 hover:border-orange-500 hover:text-orange-600">
                <PlusIcon className="w-3.5 h-3.5" />
                分组
              </button>
            </div>
          </div>

          {/* 大纲列表 */}
          <div className="flex-1 overflow-y-auto px-2.5 py-2 flex flex-col gap-1.5 min-h-0">
            {courseData.pages.length === 0 ? (
              <div className="p-3 text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
                暂无页面，创建后将出现在此
              </div>
            ) : (
              courseData.groups.length > 0 ? (
                courseData.groups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-2 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white cursor-pointer">
                      <div className="flex items-center gap-2 font-semibold text-gray-800">
                        <span className="max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                          {group.title}
                        </span>
                      </div>
                      <GripVerticalIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="flex flex-col gap-1.5 pt-1">
                      {group.pages.map((page, index) => (
                        <div
                          key={page.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, page.id)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => handleDragOver(e, page.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, page.id)}
                          onClick={() => dispatchEditor({ type: 'SELECT_PAGE', payload: page.id })}
                          className={`bg-white border rounded-lg px-2.5 py-2 flex items-center justify-between gap-2 cursor-grab transition-all hover:border-orange-500 hover:shadow-sm ${
                            draggedPageId === page.id ? 'opacity-50 border-orange-500' : 'border-gray-200'
                          } ${
                            dragOverPageId === page.id ? 'border-orange-500 bg-orange-50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <GripVerticalIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="w-5 h-5 rounded-md bg-orange-50 text-orange-600 inline-flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {getPageDisplayNumber(page) || index + 1}
                            </span>
                            <span className="text-sm text-gray-900 font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                              {page.title}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold flex-shrink-0">
                            {page.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                courseData.pages.map((page, index) => (
                  <div
                    key={page.id}
                    className="bg-white border border-gray-200 rounded-lg px-2.5 py-2 flex items-center justify-between gap-2 cursor-grab transition-all hover:border-orange-500 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-orange-50 text-orange-600 inline-flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-900 font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">
                        {page.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold flex-shrink-0">
                        {page.type}
                      </span>
                      <button className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
