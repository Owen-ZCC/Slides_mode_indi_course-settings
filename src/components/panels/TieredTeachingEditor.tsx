'use client';

import { useState, useEffect } from 'react';
import { useEditor } from '@/store/EditorContext';
import { CoursePage, TieredLevelConfig, LearningTask, TaskEvaluationCriteria, LearningPerformanceLevel, TieredAgentConfig, GuidanceStyle, ConversationStyle, AgentEncouragementStyle } from '@/types';

interface TieredTeachingEditorProps {
  page: CoursePage;
}

export default function TieredTeachingEditor({ page }: TieredTeachingEditorProps) {
  const { dispatchCourse } = useEditor();
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'tasks' | 'agent'>('tasks');
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [isPromptExpanded, setIsPromptExpanded] = useState(true);

  const tieredData = page.tieredTeachingData;

  if (!tieredData) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-3">📚</div>
          <div className="text-sm">暂无分层教学数据</div>
        </div>
      </div>
    );
  }

  const currentConfig = tieredData.tieredConfigs[currentLevelIndex];

  // 同步 isAdvancedMode 状态
  useEffect(() => {
    if (currentConfig?.agentConfig?.isAdvancedMode !== undefined) {
      setIsAdvancedMode(currentConfig.agentConfig.isAdvancedMode);
    }
  }, [currentLevelIndex, currentConfig?.agentConfig?.isAdvancedMode]);

  // 更新当前配置
  const updateCurrentConfig = (updates: Partial<TieredLevelConfig>) => {
    const updatedConfigs = [...tieredData.tieredConfigs];
    updatedConfigs[currentLevelIndex] = { ...currentConfig, ...updates };

    const updatedPage: CoursePage = {
      ...page,
      tieredTeachingData: {
        ...tieredData,
        tieredConfigs: updatedConfigs,
      }
    };

    dispatchCourse({ type: 'UPDATE_PAGE', payload: updatedPage });
  };

  // 更新学习任务
  const updateLearningTask = (taskId: string, updates: Partial<LearningTask>) => {
    const updatedTasks = currentConfig.learningTasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    updateCurrentConfig({ learningTasks: updatedTasks });
  };

  // 添加学习任务
  const addLearningTask = () => {
    const newTask: LearningTask = {
      id: `task-${Date.now()}`,
      title: '',
      description: '',
      evaluationCriteria: [],
    };
    updateCurrentConfig({ learningTasks: [...currentConfig.learningTasks, newTask] });
  };

  // 删除学习任务
  const deleteLearningTask = (taskId: string) => {
    const updatedTasks = currentConfig.learningTasks.filter(task => task.id !== taskId);
    updateCurrentConfig({ learningTasks: updatedTasks });
  };

  // 更新任务内的评价标准
  const updateTaskEvaluationCriteria = (taskId: string, criteriaId: string, updates: Partial<TaskEvaluationCriteria>) => {
    const updatedTasks = currentConfig.learningTasks.map(task => {
      if (task.id === taskId) {
        const updatedCriteria = (task.evaluationCriteria || []).map(criteria =>
          criteria.id === criteriaId ? { ...criteria, ...updates } : criteria
        );
        return { ...task, evaluationCriteria: updatedCriteria };
      }
      return task;
    });
    updateCurrentConfig({ learningTasks: updatedTasks });
  };

  // 添加任务内的评价标准
  const addTaskEvaluationCriteria = (taskId: string) => {
    const newCriteria: TaskEvaluationCriteria = {
      id: `criteria-${Date.now()}`,
      name: '',
      description: '',
      weight: 0,
    };
    const updatedTasks = currentConfig.learningTasks.map(task => {
      if (task.id === taskId) {
        return { ...task, evaluationCriteria: [...(task.evaluationCriteria || []), newCriteria] };
      }
      return task;
    });
    updateCurrentConfig({ learningTasks: updatedTasks });
  };

  // 删除任务内的评价标准
  const deleteTaskEvaluationCriteria = (taskId: string, criteriaId: string) => {
    const updatedTasks = currentConfig.learningTasks.map(task => {
      if (task.id === taskId) {
        return { ...task, evaluationCriteria: (task.evaluationCriteria || []).filter(c => c.id !== criteriaId) };
      }
      return task;
    });
    updateCurrentConfig({ learningTasks: updatedTasks });
  };

  // 更新学习表现等级
  const updatePerformanceLevel = (levelId: string, updates: Partial<LearningPerformanceLevel>) => {
    const updatedLevels = currentConfig.performanceLevels.map(level =>
      level.id === levelId ? { ...level, ...updates } : level
    );
    updateCurrentConfig({ performanceLevels: updatedLevels });
  };

  // 更新智能体配置
  const updateAgentConfig = (updates: Partial<TieredAgentConfig>) => {
    updateCurrentConfig({ agentConfig: { ...currentConfig.agentConfig, ...updates } });
  };

  // 获取指导方式标签
  const getGuidanceStyleLabel = (style: GuidanceStyle) => {
    const labels: Record<GuidanceStyle, { label: string; desc: string }> = {
      'direct': { label: '直接指导', desc: '明确告知，直接讲解' },
      'scaffolding': { label: '脚手架式', desc: '逐步引导，搭建支架' },
      'inquiry': { label: '探究式', desc: '问题驱动，启发思考' },
    };
    return labels[style];
  };

  // 获取对话风格标签
  const getConversationStyleLabel = (style: ConversationStyle) => {
    const labels: Record<ConversationStyle, string> = {
      'formal': '正式严谨',
      'friendly': '亲切友好',
      'inspiring': '启发引导',
    };
    return labels[style];
  };

  // 获取鼓励方式标签
  const getEncouragementStyleLabel = (style: AgentEncouragementStyle) => {
    const labels: Record<AgentEncouragementStyle, string> = {
      'minimal': '简洁反馈',
      'balanced': '适度鼓励',
      'enthusiastic': '热情鼓励',
    };
    return labels[style];
  };

  // 获取默认高级提示词
  const getDefaultAdvancedPrompt = () => {
    const levelName = currentConfig.levelName;
    const agentName = currentConfig.agentConfig.name;
    const agentRole = currentConfig.agentConfig.role;

    return `# 角色设定
你是「${agentName}」，${agentRole}。你正在为「${levelName}」层次的学生提供个性化学习辅导。

# 学生特点
根据认知起点诊断，该层次学生的特点是：
- 需要针对性的学习指导
- 适合循序渐进的学习方式
- 需要适当的鼓励和反馈

# 交流风格
- 使用亲切友好的语气
- 适当使用鼓励性语言
- 根据学生回答调整指导策略

# 指导策略
1. 先了解学生当前的理解程度
2. 根据学生水平调整讲解深度
3. 使用生活实例帮助理解
4. 及时给予正面反馈
5. 错误时引导而非直接纠正

# 学习任务引导
1. 介绍学习任务的目标和要求
2. 分步骤引导学生完成任务
3. 在关键节点检查学生理解
4. 总结学习成果和进步

# 评价标准
- 根据任务完成度评价学习表现
- 考虑学生的思维过程和努力程度
- 给予建设性的改进建议

# 反馈生成规则
- 针对每个学习任务给出具体评价
- 提供个性化学习建议
- 指出需要加强的方向
- 鼓励学生继续努力`;
  };

  // 调试模式
  const handleDebug = () => {
    // 检查是否所有必填项都已配置
    if (currentConfig.learningTasks.length === 0 || currentConfig.learningTasks.some(t => !t.title || !t.description)) {
      alert('请完成学习任务配置');
      return;
    }
    // 检查每个任务是否有评价标准
    const hasIncompleteCriteria = currentConfig.learningTasks.some(t =>
      !t.evaluationCriteria || t.evaluationCriteria.length === 0 || t.evaluationCriteria.some(c => !c.name || !c.description)
    );
    if (hasIncompleteCriteria) {
      alert('请为每个学习任务配置评价标准');
      return;
    }
    if (currentConfig.performanceLevels.length === 0) {
      alert('请完成学习表现等级配置');
      return;
    }
    setIsDebugMode(true);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      {/* 左侧：等级列表 */}
      <div className="w-64 border-r border-gray-200 overflow-y-auto bg-gray-50">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">认知起点分层</h3>
          <div className="space-y-2">
            {tieredData.tieredConfigs.map((config, index) => {
              const colorMap: Record<string, string> = {
                emerald: 'bg-emerald-100 border-emerald-400 text-emerald-700',
                teal: 'bg-teal-100 border-teal-400 text-teal-700',
                amber: 'bg-amber-100 border-amber-400 text-amber-700',
                rose: 'bg-rose-100 border-rose-400 text-rose-700',
                gray: 'bg-gray-100 border-gray-400 text-gray-700',
              };
              const colorClass = colorMap[config.levelColor] || colorMap.gray;
              return (
                <div
                  key={config.levelId}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    index === currentLevelIndex
                      ? `${colorClass} shadow-sm`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => setCurrentLevelIndex(index)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{config.levelIcon}</span>
                    <span className="font-medium text-sm">{config.levelName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 右侧：配置内容 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab 导航 */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-1">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'tasks'
                ? 'bg-teal-50 text-teal-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            学习任务
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'agent'
                ? 'bg-teal-50 text-teal-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            智能学伴配置
          </button>
          <button
            onClick={handleDebug}
            className="ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-teal-500 text-white hover:bg-teal-600 transition-colors"
          >
            调试
          </button>
        </div>

        {/* Tab 内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'tasks' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">学习任务</h3>
                <button
                  onClick={addLearningTask}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
                >
                  + 添加任务
                </button>
              </div>
              {currentConfig.learningTasks.map((task, index) => {
                const isSelected = selectedTaskId === task.id;
                return (
                  <div
                    key={task.id}
                    className={`rounded-xl p-4 space-y-3 cursor-pointer transition-all border-2 ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-400 shadow-sm'
                        : 'bg-gray-50 border-transparent hover:bg-emerald-50/50 hover:border-emerald-200'
                    }`}
                    onClick={() => setSelectedTaskId(isSelected ? null : task.id)}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`text-sm font-medium ${isSelected ? 'text-emerald-700' : 'text-gray-700'}`}>
                        任务 {index + 1}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLearningTask(task.id);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        删除
                      </button>
                    </div>
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => updateLearningTask(task.id, { title: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="任务标题"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                    <textarea
                      value={task.description}
                      onChange={(e) => updateLearningTask(task.id, { description: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="任务描述"
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none bg-white"
                    />

                    {/* 评价标准部分 */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-sm font-medium ${isSelected ? 'text-emerald-700' : 'text-gray-700'}`}>
                          评价标准
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addTaskEvaluationCriteria(task.id);
                          }}
                          className="px-2 py-1 rounded text-xs font-medium bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
                        >
                          + 添加标准
                        </button>
                      </div>
                      {(task.evaluationCriteria || []).length === 0 ? (
                        <div className="text-sm text-gray-400 text-center py-2">
                          暂无评价标准，点击上方按钮添加
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {(task.evaluationCriteria || []).map((criteria, cIndex) => (
                            <div key={criteria.id} className="bg-white rounded-lg p-3 space-y-2 border border-gray-200">
                              <div className="flex items-start justify-between">
                                <span className="text-xs font-medium text-gray-500">标准 {cIndex + 1}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTaskEvaluationCriteria(task.id, criteria.id);
                                  }}
                                  className="text-red-500 hover:text-red-700 text-xs"
                                >
                                  删除
                                </button>
                              </div>
                              <input
                                type="text"
                                value={criteria.name}
                                onChange={(e) => updateTaskEvaluationCriteria(task.id, criteria.id, { name: e.target.value })}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="评价维度"
                                className="w-full px-2 py-1.5 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                              <textarea
                                value={criteria.description}
                                onChange={(e) => updateTaskEvaluationCriteria(task.id, criteria.id, { description: e.target.value })}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="评价细则"
                                rows={2}
                                className="w-full px-2 py-1.5 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                              />
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-600">权重:</label>
                                <input
                                  type="number"
                                  value={criteria.weight}
                                  onChange={(e) => updateTaskEvaluationCriteria(task.id, criteria.id, { weight: parseInt(e.target.value) || 0 })}
                                  onClick={(e) => e.stopPropagation()}
                                  min="0"
                                  max="100"
                                  className="w-16 px-2 py-1 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <span className="text-xs text-gray-600">%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'agent' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">智能学伴配置</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsAdvancedMode(false);
                      updateAgentConfig({ isAdvancedMode: false });
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      !isAdvancedMode
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    基础配置
                  </button>
                  <button
                    onClick={() => {
                      setIsAdvancedMode(true);
                      updateAgentConfig({ isAdvancedMode: true });
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isAdvancedMode
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    高级模式
                  </button>
                </div>
              </div>

              {!isAdvancedMode ? (
                // 基础配置模式
                <>
                  {/* 基本信息 */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700">基本信息</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">名称</label>
                        <input
                          type="text"
                          value={currentConfig.agentConfig.name}
                          onChange={(e) => updateAgentConfig({ name: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">角色</label>
                        <input
                          type="text"
                          value={currentConfig.agentConfig.role}
                          onChange={(e) => updateAgentConfig({ role: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 指导策略 */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700">指导策略</h4>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">指导方式</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['direct', 'scaffolding', 'inquiry'] as GuidanceStyle[]).map(style => {
                          const styleInfo = getGuidanceStyleLabel(style);
                          return (
                            <button
                              key={style}
                              onClick={() => updateAgentConfig({ guidanceStyle: style })}
                              className={`p-3 rounded-lg border-2 text-left transition-all ${
                                currentConfig.agentConfig.guidanceStyle === style
                                  ? 'border-teal-500 bg-teal-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="text-sm font-medium text-gray-900">{styleInfo.label}</div>
                              <div className="text-xs text-gray-500 mt-1">{styleInfo.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">对话风格</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['formal', 'friendly', 'inspiring'] as ConversationStyle[]).map(style => (
                          <button
                            key={style}
                            onClick={() => updateAgentConfig({ conversationStyle: style })}
                            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                              currentConfig.agentConfig.conversationStyle === style
                                ? 'border-teal-500 bg-teal-50 text-teal-700'
                                : 'border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {getConversationStyleLabel(style)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">鼓励方式</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['minimal', 'balanced', 'enthusiastic'] as AgentEncouragementStyle[]).map(style => (
                          <button
                            key={style}
                            onClick={() => updateAgentConfig({ encouragementStyle: style })}
                            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                              currentConfig.agentConfig.encouragementStyle === style
                                ? 'border-teal-500 bg-teal-50 text-teal-700'
                                : 'border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {getEncouragementStyleLabel(style)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">最大对话轮次</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={3}
                          max={15}
                          value={currentConfig.agentConfig.maxRounds}
                          onChange={(e) => updateAgentConfig({ maxRounds: parseInt(e.target.value) })}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                        />
                        <span className="w-12 text-center text-sm font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">
                          {currentConfig.agentConfig.maxRounds} 轮
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">特别关注（可选）</label>
                      <textarea
                        value={currentConfig.agentConfig.specialFocus || ''}
                        onChange={(e) => updateAgentConfig({ specialFocus: e.target.value })}
                        placeholder="例如：重点关注学生对「力的作用效果」的理解，注意区分力的两种效果"
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      />
                    </div>
                  </div>
                </>
              ) : (
                // 高级模式
                <div className="space-y-6">
                  {/* 自定义提示词 */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="text-sm font-semibold text-gray-900">自定义提示词</span>
                      <button
                        onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                      >
                        {isPromptExpanded ? '收起' : '展开'}
                        <svg
                          className={`w-4 h-4 transition-transform ${isPromptExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    {isPromptExpanded && (
                      <div className="p-4">
                        <textarea
                          value={currentConfig.agentConfig.advancedPrompt || getDefaultAdvancedPrompt()}
                          onChange={(e) => updateAgentConfig({ advancedPrompt: e.target.value })}
                          placeholder="输入自定义提示词..."
                          rows={20}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            提示：在高级模式下，您可以完全自定义智能学伴的行为和对话策略
                          </p>
                          <button
                            onClick={() => updateAgentConfig({ advancedPrompt: getDefaultAdvancedPrompt() })}
                            className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                          >
                            重置为默认
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 高级设置提示 */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-semibold text-amber-800">高级模式说明</h4>
                        <p className="text-xs text-amber-700 mt-1">
                          高级模式允许您完全自定义智能学伴的提示词。基础配置中的设置将被忽略，系统将直接使用您编写的提示词。
                          请确保提示词包含必要的角色设定、对话策略和评价标准。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 调试模式弹窗 */}
      {isDebugMode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">智能学伴调试</h3>
              <button
                onClick={() => setIsDebugMode(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-3">🤖</div>
              <p>调试功能开发中...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
