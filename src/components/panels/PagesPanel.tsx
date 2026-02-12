'use client';

import { useEditor } from '@/store/EditorContext';
import { ChevronLeftIcon, TextIcon, ImageIcon, FileIcon, UploadIcon, TwoColumnIcon } from '@/components/icons';
import { PageTemplateType } from '@/types';

const templates: { id: PageTemplateType; name: string; icon: React.ReactNode }[] = [
  { id: 'title', name: '标题页', icon: <TextIcon className="w-12 h-12" /> },
  { id: 'image', name: '图片页', icon: <ImageIcon className="w-12 h-12" /> },
  { id: 'content', name: '内容页', icon: <FileIcon className="w-12 h-12" /> },
  { id: 'text-image', name: '文图页', icon: <TwoColumnIcon className="w-12 h-12" /> },
  { id: 'image-text', name: '图文页', icon: <TwoColumnIcon className="w-12 h-12" /> },
];

interface PagesPanelProps {
  onAddPage: (template: PageTemplateType) => void;
  onUploadPPT?: () => void;
}

export default function PagesPanel({ onAddPage, onUploadPPT }: PagesPanelProps) {
  const { dispatchEditor } = useEditor();

  const handleUploadPPT = () => {
    if (onUploadPPT) {
      onUploadPPT();
    } else {
      // 默认行为：打开文件选择器
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.ppt,.pptx';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          alert('正在解析PPT文件: ' + file.name + '\n\n此功能将自动识别PPT中的页面并导入到课件中。');
        }
      };
      input.click();
    }
  };

  return (
    <div className="w-[420px] bg-white flex flex-col transition-all duration-300">
      {/* 头部 */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <span className="text-[15px] font-semibold text-gray-900">添加模板页面</span>
        <button
          onClick={() => dispatchEditor({ type: 'TOGGLE_PANEL_COLLAPSE' })}
          className="w-7 h-7 rounded-lg border-none bg-transparent cursor-pointer flex items-center justify-center transition-all text-gray-400 hover:bg-gray-100 hover:text-gray-500"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
      </div>

      {/* 模板网格 */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-3.5">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => onAddPage(template.id)}
              className="bg-[#fafbfc] border-[1.5px] border-gray-200 rounded-[14px] p-3.5 cursor-pointer transition-all duration-200 relative overflow-hidden hover:border-[#EE812C] hover:bg-[#FFF8F0] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(238,129,44,0.15)] group"
            >
              <div className="w-full h-[100px] bg-white rounded-lg mb-3 flex items-center justify-center border border-gray-200 relative opacity-90 -translate-y-0.5 transition-all group-hover:opacity-100 group-hover:translate-y-0">
                <span className="text-gray-300 group-hover:text-[#EE812C] transition-colors">
                  {template.icon}
                </span>
              </div>
              <div className="text-sm font-semibold text-gray-900 text-center">
                {template.name}
              </div>
            </button>
          ))}

          {/* 上传PPT */}
          <button
            onClick={handleUploadPPT}
            className="col-span-2 bg-[#fafbfc] border-[1.5px] border-gray-200 flex items-center justify-center gap-3 p-3.5 rounded-[14px] cursor-pointer transition-all duration-200 hover:bg-[#FFF8F0] hover:border-[#EE812C] hover:shadow-[0_4px_12px_rgba(238,129,44,0.15)] hover:-translate-y-0.5 group"
          >
            <UploadIcon className="w-7 h-7 text-gray-300 group-hover:text-[#EE812C]" />
            <span className="text-sm font-semibold text-gray-900">上传PPT</span>
          </button>
        </div>
      </div>
    </div>
  );
}
