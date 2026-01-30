'use client';

import { useState } from 'react';
import { useEditor } from '@/store/EditorContext';
import { ChevronLeftIcon, ArrowLeftIcon, CircleIcon, MessageIcon, CheckIcon, CameraIcon, ListIcon, MenuIcon, PenToolIcon, CardIcon, CodeIcon, LayersIcon } from '@/components/icons';
import { ToolType } from '@/types';

// 工具配置定义
interface ToolConfig {
  name: string;
  icon: React.ReactNode;
  hasViewWork: boolean;
  hasShowAnswer?: boolean;
  hasVoting?: boolean;
  hasLearningMode?: boolean;
}

const toolConfigs: Record<ToolType, ToolConfig> = {
  choice: {
    name: '选择',
    icon: <CircleIcon className="w-5 h-5" />,
    hasViewWork: true,
    hasShowAnswer: true,
    hasVoting: false,
  },
  qa: {
    name: '问答',
    icon: <MessageIcon className="w-5 h-5" />,
    hasViewWork: true,
    hasVoting: true,
  },
  vote: {
    name: '投票',
    icon: <CheckIcon className="w-5 h-5" />,
    hasViewWork: true,
    hasVoting: false,
  },
  photo: {
    name: '拍照',
    icon: <CameraIcon className="w-5 h-5" />,
    hasViewWork: true,
    hasVoting: true,
  },
  fillblank: {
    name: '填空',
    icon: <ListIcon className="w-5 h-5" />,
    hasViewWork: true,
    hasVoting: false,
  },
  sort: {
    name: '排序',
    icon: <MenuIcon className="w-5 h-5" />,
    hasViewWork: true,
    hasVoting: false,
  },
  whiteboard: {
    name: '白板',
    icon: <PenToolIcon className="w-5 h-5" />,
    hasViewWork: true,
    hasVoting: true,
  },
  flashcard: {
    name: '抽认卡',
    icon: <CardIcon className="w-5 h-5" />,
    hasViewWork: false,
    hasVoting: false,
    hasLearningMode: true,
  },
  cocopi: {
    name: 'CocoPi',
    icon: <CodeIcon className="w-5 h-5" />,
    hasViewWork: true,
    hasVoting: true,
  },
  workspace: {
    name: '创作空间',
    icon: <LayersIcon className="w-5 h-5" />,
    hasViewWork: true,
    hasVoting: true,
  },
};

const tools: { id: ToolType; name: string; icon: React.ReactNode }[] = [
  { id: 'choice', name: '选择', icon: <CircleIcon className="w-5 h-5" /> },
  { id: 'qa', name: '问答', icon: <MessageIcon className="w-5 h-5" /> },
  { id: 'vote', name: '投票', icon: <CheckIcon className="w-5 h-5" /> },
  { id: 'photo', name: '拍照', icon: <CameraIcon className="w-5 h-5" /> },
  { id: 'fillblank', name: '填空', icon: <ListIcon className="w-5 h-5" /> },
  { id: 'sort', name: '排序', icon: <MenuIcon className="w-5 h-5" /> },
  { id: 'whiteboard', name: '白板', icon: <PenToolIcon className="w-5 h-5" /> },
  { id: 'flashcard', name: '抽认卡', icon: <CardIcon className="w-5 h-5" /> },
  { id: 'cocopi', name: 'CocoPi', icon: <CodeIcon className="w-5 h-5" /> },
  { id: 'workspace', name: '创作空间', icon: <LayersIcon className="w-5 h-5" /> },
];

// 开关组件
function ToggleSwitch({
  checked,
  onChange
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        checked ? 'bg-orange-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

interface ToolsPanelProps {
  onSelectTool: (tool: ToolType) => void;
}

export default function ToolsPanel({ onSelectTool }: ToolsPanelProps) {
  const { dispatchEditor } = useEditor();
  const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  // 配置状态
  const [viewWorkEnabled, setViewWorkEnabled] = useState(false);
  const [showAnswerEnabled, setShowAnswerEnabled] = useState(false);
  const [votingEnabled, setVotingEnabled] = useState(false);

  const handleToolSelect = (toolId: ToolType) => {
    setSelectedTool(toolId);
    setShowConfig(true);
    // 重置配置状态
    setViewWorkEnabled(false);
    setShowAnswerEnabled(false);
    setVotingEnabled(false);
    // 通知父组件选择了工具
    onSelectTool(toolId);
  };

  const handleBack = () => {
    setShowConfig(false);
    setSelectedTool(null);
  };

  const getToolConfig = (id: ToolType): ToolConfig => {
    return toolConfigs[id];
  };

  // 处理开关联动逻辑
  const handleViewWorkChange = (checked: boolean) => {
    setViewWorkEnabled(checked);
    // 如果关闭"学生查看结果"，同时关闭"学生点赞"
    if (!checked && votingEnabled) {
      setVotingEnabled(false);
    }
  };

  const handleVotingChange = (checked: boolean) => {
    setVotingEnabled(checked);
    // 如果打开"学生点赞"，同时打开"学生查看结果"
    if (checked && !viewWorkEnabled) {
      setViewWorkEnabled(true);
    }
  };

  return (
    <div className="w-[340px] bg-white flex flex-col transition-all duration-300">
      {!showConfig ? (
        /* 工具列表视图 */
        <>
          {/* 头部 */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <span className="text-[15px] font-semibold text-gray-900">添加互动工具</span>
            <button
              onClick={() => dispatchEditor({ type: 'TOGGLE_PANEL_COLLAPSE' })}
              className="w-7 h-7 rounded-lg border-none bg-transparent cursor-pointer flex items-center justify-center transition-all text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* 说明插画 */}
            <div className="mx-5 my-4 p-5 text-center bg-[#fafbfc] rounded-xl">
              <div className="mb-3 flex justify-center">
                <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
                  <rect x="10" y="15" width="100" height="50" rx="8" fill="#fff7ed" stroke="#ff9500" strokeWidth="2" />
                  <circle cx="30" cy="30" r="4" fill="#ff9500" />
                  <rect x="40" y="27" width="60" height="6" rx="3" fill="#ffd9a8" />
                  <circle cx="30" cy="45" r="4" fill="#d1d5db" />
                  <rect x="40" y="42" width="45" height="6" rx="3" fill="#e5e7eb" />
                </svg>
              </div>
              <p className="text-[13px] font-medium text-gray-500">选择工具创建互动页面</p>
            </div>

            {/* 工具网格 - 2列横向布局 */}
            <div className="grid grid-cols-2 gap-3 px-5 pb-5">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolSelect(tool.id)}
                  className="flex flex-row items-center gap-3 py-3.5 px-4 rounded-xl bg-white border-[1.5px] border-gray-200 cursor-pointer transition-all duration-200 hover:border-[#ff9500] hover:bg-[#fffbf5] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,149,0,0.15)] group"
                >
                  <div className="w-10 h-10 rounded-[10px] bg-[#f9fafb] flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-[#fff7ed]">
                    <span className="text-gray-500 group-hover:text-[#ff9500]">
                      {tool.icon}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-[#ff9500]">
                    {tool.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* 工具配置视图 */
        <>
          {/* 配置头部 - 带返回按钮 */}
          <div className="py-4 px-5 border-b border-gray-100 flex items-center gap-3">
            <button
              onClick={handleBack}
              className="w-8 h-8 rounded-lg border-none bg-[#f9fafb] cursor-pointer flex items-center justify-center transition-all hover:bg-[#fff7ed] text-gray-500 hover:text-[#ff9500]"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <span className="text-[15px] font-semibold text-gray-900">
              {selectedTool && getToolConfig(selectedTool).name}
            </span>
          </div>

          {/* 配置内容 */}
          <div className="flex-1 overflow-y-auto p-5">
            {selectedTool && (
              <div className="space-y-4">
                {/* 学生查看结果开关 */}
                {getToolConfig(selectedTool).hasViewWork && (
                  <div className="flex items-center justify-between py-3 px-4 bg-[#fafbfc] rounded-xl">
                    <span className="text-sm font-medium text-gray-700">学生查看结果</span>
                    <ToggleSwitch
                      checked={viewWorkEnabled}
                      onChange={handleViewWorkChange}
                    />
                  </div>
                )}

                {/* 提交后显示答案开关（选择题专用） */}
                {getToolConfig(selectedTool).hasShowAnswer && (
                  <div className="flex items-center justify-between py-3 px-4 bg-[#fafbfc] rounded-xl">
                    <span className="text-sm font-medium text-gray-700">提交后显示答案</span>
                    <ToggleSwitch
                      checked={showAnswerEnabled}
                      onChange={setShowAnswerEnabled}
                    />
                  </div>
                )}

                {/* 学生点赞开关 */}
                {getToolConfig(selectedTool).hasVoting && (
                  <div className="flex items-center justify-between py-3 px-4 bg-[#fafbfc] rounded-xl">
                    <span className="text-sm font-medium text-gray-700">学生点赞</span>
                    <ToggleSwitch
                      checked={votingEnabled}
                      onChange={handleVotingChange}
                    />
                  </div>
                )}

                {/* 学习模式配置（抽认卡专用） */}
                {getToolConfig(selectedTool).hasLearningMode && (
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">学习模式</label>
                    <div className="space-y-2">
                      {['随机乱序', '自动朗读', '正反对调'].map((mode, index) => (
                        <label
                          key={mode}
                          className="flex items-center gap-3 py-3 px-4 bg-[#fafbfc] rounded-xl cursor-pointer hover:bg-[#fff7ed] transition-colors"
                        >
                          <input
                            type="radio"
                            name="learningMode"
                            defaultChecked={index === 0}
                            className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                          />
                          <span className="text-sm text-gray-700">{mode}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
