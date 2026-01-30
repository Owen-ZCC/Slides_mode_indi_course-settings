'use client';

import { useEditor } from '@/store/EditorContext';
import { ChevronLeftIcon, PlusIcon, TrashIcon, GripVerticalIcon } from '@/components/icons';

export default function RightPanel() {
  const { editorState, courseData, dispatchEditor } = useEditor();

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
