'use client';

import { useState } from 'react';
import { useEditor } from '@/store/EditorContext';
import { CoursePage, TieredLevelConfig, LearningTask, EvaluationCriteria, LearningPerformanceLevel, TieredAgentConfig, GuidanceStyle, ConversationStyle, AgentEncouragementStyle } from '@/types';

interface TieredTeachingEditorProps {
  page: CoursePage;
}

export default function TieredTeachingEditor({ page }: TieredTeachingEditorProps) {
  const { dispatchCourse } = useEditor();
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'tasks' | 'criteria' | 'performance' | 'agent'>('tasks');
  const [isDebugMode, setIsDebugMode] = useState(false);

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
    };
    updateCurrentConfig({ learningTasks: [...currentConfig.learningTasks, newTask] });
  };

  // 删除学习任务
  const deleteLearningTask = (taskId: string) => {
    const updatedTasks = currentConfig.learningTasks.filter(task => task.id !== taskId);
    updateCurrentConfig({ learningTasks: updatedTasks });
  };

  // 更新评价标准
  const updateEvaluationCriteria = (criteriaId: string, updates: Partial<EvaluationCriteria>) => {
    const updatedCriteria = currentConfig.evaluationCriteria.map(criteria =>
      criteria.id === criteriaId ? { ...criteria, ...updates } : criteria
    );
    updateCurrentConfig({ evaluationCriteria: updatedCriteria });
  };

  // 添加评价标准
  const addEvaluationCriteria = () => {
    const newCriteria: EvaluationCriteria = {
      id: `criteria-${Date.now()}`,
      name: '',
      description: '',
      weight: 0,
    };
    updateCurrentConfig({ evaluationCriteria: [...currentConfig.evaluationCriteria, newCriteria] });
  };

  // 删除评价标准
  const deleteEvaluationCriteria = (criteriaId: string) => {
    const updatedCriteria = currentConfig.evaluationCriteria.filter(criteria => criteria.id !== criteriaId);
    updateCurrentConfig({ evaluationCriteria: updatedCriteria });
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

  // 调试模式
  const handleDebug = () => {
    // 检查是否所有必填项都已配置
    if (currentConfig.learningTasks.length === 0 || currentConfig.learningTasks.some(t => !t.title || !t.description)) {
      alert('请完成学习任务配置');
      return;
    }
    if (currentConfig.evaluationCriteria.length === 0 || currentConfig.evaluationCriteria.some(c => !c.name || !c.description)) {
      alert('请完成评价标准配置');
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
            onClick={() => setActiveTab('criteria')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'criteria'
                ? 'bg-teal-50 text-teal-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            评价标准
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'performance'
                ? 'bg-teal-50 text-teal-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            学习表现等级
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
              {currentConfig.learningTasks.map((task, index) => (
                <div key={task.id} className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium text-gray-700">任务 {index + 1}</span>
                    <button
                      onClick={() => deleteLearningTask(task.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      删除
                    </button>
                  </div>
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) => updateLearningTask(task.id, { title: e.target.value })}
                    placeholder="任务标题"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <textarea
                    value={task.description}
                    onChange={(e) => updateLearningTask(task.id, { description: e.target.value })}
                    placeholder="任务描述"
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'criteria' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">评价标准</h3>
                <button
                  onClick={addEvaluationCriteria}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
                >
                  + 添加标准
                </button>
              </div>
              {currentConfig.evaluationCriteria.map((criteria, index) => (
                <div key={criteria.id} className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium text-gray-700">标准 {index + 1}</span>
                    <button
                      onClick={() => deleteEvaluationCriteria(criteria.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      删除
                    </button>
                  </div>
                  <input
                    type="text"
                    value={criteria.name}
                    onChange={(e) => updateEvaluationCriteria(criteria.id, { name: e.target.value })}
                    placeholder="评价维度"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <textarea
                    value={criteria.description}
                    onChange={(e) => updateEvaluationCriteria(criteria.id, { description: e.target.value })}
                    placeholder="评价细则"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">权重:</label>
                    <input
                      type="number"
                      value={criteria.weight}
                      onChange={(e) => updateEvaluationCriteria(criteria.id, { weight: parseInt(e.target.value) || 0 })}
                      min="0"
                      max="100"
                      className="w-20 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">学习表现等级</h3>
              {currentConfig.performanceLevels.map((level, index) => (
                <div key={level.id} className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{level.icon}</span>
                    <input
                      type="text"
                      value={level.name}
                      onChange={(e) => updatePerformanceLevel(level.id, { name: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <textarea
                    value={level.description}
                    onChange={(e) => updatePerformanceLevel(level.id, { description: e.target.value })}
                    placeholder="等级描述"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">最低分:</label>
                      <input
                        type="number"
                        value={level.minScore}
                        onChange={(e) => updatePerformanceLevel(level.id, { minScore: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="100"
                        className="w-20 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">最高分:</label>
                      <input
                        type="number"
                        value={level.maxScore}
                        onChange={(e) => updatePerformanceLevel(level.id, { maxScore: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="100"
                        className="w-20 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'agent' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">智能学伴配置</h3>

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
