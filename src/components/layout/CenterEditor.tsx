'use client';

import { useState } from 'react';
import { useEditor } from '@/store/EditorContext';
import { TextIcon, ImageIcon, TableIcon, CircleIcon, ChevronDownIcon, EditIcon, TrashIcon, CopyIcon, CheckIcon, MessageIcon, CameraIcon, ListIcon, MenuIcon, PenToolIcon, CardIcon, CodeIcon, LayersIcon, PlusIcon } from '@/components/icons';
import { ToolType, DiagnosisQuestion, CoursePage, ConversationDiagnosisConfig, DialogueStyle, ScoringPreference, EncouragementStyle, VoiceConfig, AvatarConfig, BackgroundConfig } from '@/types';

// 工具配置
const toolConfigs: Record<ToolType, { name: string; icon: React.ReactNode }> = {
  choice: { name: '选择', icon: <CircleIcon className="w-4 h-4" /> },
  qa: { name: '问答', icon: <MessageIcon className="w-4 h-4" /> },
  vote: { name: '投票', icon: <CheckIcon className="w-4 h-4" /> },
  photo: { name: '拍照', icon: <CameraIcon className="w-4 h-4" /> },
  fillblank: { name: '填空', icon: <ListIcon className="w-4 h-4" /> },
  sort: { name: '排序', icon: <MenuIcon className="w-4 h-4" /> },
  whiteboard: { name: '白板', icon: <PenToolIcon className="w-4 h-4" /> },
  flashcard: { name: '抽认卡', icon: <CardIcon className="w-4 h-4" /> },
  cocopi: { name: 'CocoPi', icon: <CodeIcon className="w-4 h-4" /> },
  workspace: { name: '创作空间', icon: <LayersIcon className="w-4 h-4" /> },
};

// 页面类型配置
type PageType = 'title' | 'choice' | 'content' | 'qa';
const pageTypeNames: Record<PageType, string> = {
  title: '标题页',
  choice: '选择题',
  content: '内容页',
  qa: '问答',
};

// 投票编辑组件
function VoteEditor() {
  const [topic, setTopic] = useState('你最喜欢哪种状态的水?');
  const [options, setOptions] = useState(['固态(冰)', '液态(水)', '气态(水蒸气)']);

  const addOption = () => {
    setOptions([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      {/* 投票主题 */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-orange-500">投票主题</label>
        <div className="relative">
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="输入投票主题..."
            className="w-full min-h-[80px] p-4 pr-12 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white resize-none transition-all focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
          <button
            className="absolute right-3 bottom-3 w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition-colors"
            title="上传图片"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 选项列表 */}
      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={index} className="relative group">
            <input
              type="text"
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`选项${index + 1}`}
              className="w-full h-12 px-4 pr-10 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white transition-all focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
            {options.length > 2 && (
              <button
                onClick={() => removeOption(index)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                title="删除选项"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        ))}

        {/* 添加选项按钮 */}
        <button
          onClick={addOption}
          className="w-full h-12 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-400 flex items-center justify-center gap-2 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all"
        >
          <PlusIcon className="w-4 h-4" />
          <span>选项</span>
        </button>
      </div>
    </div>
  );
}

// 选择题编辑组件 - 完整还原原始HTML设计
function ChoiceEditor() {
  const [question, setQuestion] = useState('水在多少摄氏度会结冰?');
  const [options, setOptions] = useState([
    { text: '0°C', isCorrect: true },
    { text: '100°C', isCorrect: false },
    { text: '50°C', isCorrect: false },
  ]);

  const addOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const updateOption = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const toggleCorrect = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="question-item pb-8 border-b border-gray-100 last:border-b-0">
      {/* 题目头部 */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-base font-bold text-[#ff9500]">题目 1</span>
        <div className="flex items-center gap-1">
          <button
            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="复制题目"
          >
            <CopyIcon className="w-4 h-4" />
          </button>
          <button
            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            title="删除题目"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 题目输入框 */}
      <div className="relative mb-4">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="输入题目内容..."
          className="w-full min-h-[80px] p-4 pr-12 border-[1.5px] border-gray-200 rounded-[10px] text-sm text-gray-900 bg-[#fafbfc] resize-y transition-all focus:outline-none focus:border-[#ff9500] focus:bg-white"
        />
        <button
          className="absolute right-2 bottom-2 w-8 h-8 rounded-lg border-[1.5px] border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-[#ff9500] hover:text-[#ff9500] hover:bg-[#fffbf5] transition-all z-10"
          title="上传图片"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
      </div>

      {/* 选项列表 */}
      <div className="space-y-2.5 mt-4">
        {options.map((option, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-1 rounded-lg group hover:bg-[#f9fafb] transition-colors"
          >
            {/* 拖动手柄 */}
            <div className="w-4 h-4 flex items-center justify-center text-gray-300 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </div>

            {/* 正确答案复选框 */}
            <button
              onClick={() => toggleCorrect(index)}
              className={`w-[22px] h-[22px] rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                option.isCorrect
                  ? 'border-[#ff9500] bg-[#ff9500] text-white'
                  : 'border-gray-300 hover:border-[#ff9500]'
              }`}
            >
              {option.isCorrect && <CheckIcon className="w-3.5 h-3.5" />}
            </button>

            {/* 选项输入框 */}
            <input
              type="text"
              value={option.text}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`选项${String.fromCharCode(65 + index)}`}
              className="flex-1 h-10 px-3.5 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-900 bg-white transition-all focus:outline-none focus:border-[#ff9500]"
            />

            {/* 操作按钮 */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={addOption}
                className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                title="在下方添加选项"
              >
                <PlusIcon className="w-3.5 h-3.5" />
              </button>
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="删除选项"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}

        {/* 添加选项按钮 */}
        <button
          onClick={addOption}
          className="inline-flex items-center gap-2 h-8 px-3 ml-[34px] mt-2 border-[1.5px] border-dashed border-gray-300 rounded-lg text-xs font-medium text-gray-500 hover:border-[#ff9500] hover:text-[#ff9500] hover:bg-[#fffbf5] transition-all"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          <span>选项</span>
        </button>
      </div>
    </div>
  );
}

// 问答编辑组件
function QAEditor() {
  const [question, setQuestion] = useState('请描述水的三态变化过程');

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-700">题目 1</label>
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="输入题目内容..."
            className="w-full min-h-[80px] p-4 pr-12 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white resize-none transition-all focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
          <button
            className="absolute right-3 bottom-3 w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition-colors"
            title="上传图片"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-500">评价标准</label>
        <textarea
          placeholder="设置评价标准，如:必须包括/避免..."
          className="w-full min-h-[60px] p-4 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white resize-none transition-all focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
      </div>
    </div>
  );
}

// 拍照编辑组件
function PhotoEditor() {
  const [instruction, setInstruction] = useState('请拍摄家中水的不同状态');

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-semibold text-orange-500">拍照指引</label>
        <div className="relative">
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="输入拍照指引内容..."
            className="w-full min-h-[120px] p-4 pr-12 border-[1.5px] border-gray-200 rounded-[10px] text-sm text-gray-900 bg-[#fafbfc] resize-y transition-all focus:outline-none focus:border-[#ff9500] focus:bg-white"
          />
          <button
            className="absolute right-2 bottom-2 w-8 h-8 rounded-lg border-[1.5px] border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-[#ff9500] hover:text-[#ff9500] hover:bg-[#fffbf5] transition-all z-10"
            title="上传示例图片"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// 填空编辑组件
function FillBlankEditor() {
  const [question, setQuestion] = useState('水在___摄氏度会结冰，在___摄氏度会沸腾。');
  const [answer, setAnswer] = useState('0, 100');

  const insertBlank = () => {
    setQuestion(question + '___');
  };

  return (
    <div className="space-y-6">
      {/* 题目输入 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-orange-500">题目 1</label>
          <button
            onClick={insertBlank}
            className="h-7 px-3 rounded-lg border-[1.5px] border-dashed border-gray-300 text-xs font-medium text-gray-500 hover:border-[#ff9500] hover:text-[#ff9500] hover:bg-[#fffbf5] transition-all"
          >
            + 填空符
          </button>
        </div>
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="输入题目内容，点击「填空符」插入空白..."
            className="w-full min-h-[80px] p-4 pr-12 border-[1.5px] border-gray-200 rounded-[10px] text-sm text-gray-900 bg-[#fafbfc] resize-y transition-all focus:outline-none focus:border-[#ff9500] focus:bg-white"
          />
          <button
            className="absolute right-2 bottom-2 w-8 h-8 rounded-lg border-[1.5px] border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-[#ff9500] hover:text-[#ff9500] hover:bg-[#fffbf5] transition-all z-10"
            title="上传图片"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 参考答案 */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-500">参考答案</label>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="按顺序输入答案，用逗号分隔..."
          className="w-full h-10 px-4 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-900 bg-white transition-all focus:outline-none focus:border-[#ff9500]"
        />
      </div>
    </div>
  );
}

// 排序编辑组件
function SortEditor() {
  const [items, setItems] = useState([
    { id: 1, text: '冰' },
    { id: 2, text: '水' },
    { id: 3, text: '水蒸气' },
  ]);

  const addItem = () => {
    const newId = items.length + 1;
    setItems([...items, { id: newId, text: '' }]);
  };

  const updateItem = (index: number, text: string) => {
    const newItems = [...items];
    newItems[index].text = text;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 2) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      {/* 排序项目 */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-orange-500">排序项目</label>
        <div className="space-y-2.5">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-1 rounded-lg group hover:bg-[#f9fafb] transition-colors"
            >
              {/* 序号标签 */}
              <span className="w-6 h-6 rounded-md bg-[#ff9500] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {index + 1}
              </span>

              {/* 项目输入 */}
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder={`项目${index + 1}`}
                className="flex-1 h-10 px-3.5 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-900 bg-white transition-all focus:outline-none focus:border-[#ff9500]"
              />

              {/* 操作按钮 */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {items.length > 2 && (
                  <button
                    onClick={() => removeItem(index)}
                    className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="删除项目"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* 添加项目按钮 */}
          <button
            onClick={addItem}
            className="inline-flex items-center gap-2 h-8 px-3 ml-9 mt-2 border-[1.5px] border-dashed border-gray-300 rounded-lg text-xs font-medium text-gray-500 hover:border-[#ff9500] hover:text-[#ff9500] hover:bg-[#fffbf5] transition-all"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>项目</span>
          </button>
        </div>
      </div>

      {/* 正确排序显示 */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-500">正确排序</label>
        <div className="flex flex-wrap gap-2 p-4 bg-[#fafbfc] rounded-xl min-h-[60px]">
          {items.filter(item => item.text).map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-2 h-8 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700"
            >
              <span className="w-5 h-5 rounded bg-[#ff9500] text-white text-xs font-bold flex items-center justify-center">
                {index + 1}
              </span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 白板编辑组件
function WhiteboardEditor() {
  const [topic, setTopic] = useState('画出水的三态变化示意图');

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-semibold text-orange-500">白板主题</label>
        <div className="relative">
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="输入白板主题..."
            className="w-full min-h-[120px] p-4 pr-12 border-[1.5px] border-gray-200 rounded-[10px] text-sm text-gray-900 bg-[#fafbfc] resize-y transition-all focus:outline-none focus:border-[#ff9500] focus:bg-white"
          />
          <button
            className="absolute right-2 bottom-2 w-8 h-8 rounded-lg border-[1.5px] border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-[#ff9500] hover:text-[#ff9500] hover:bg-[#fffbf5] transition-all z-10"
            title="上传背景图片"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// 抽认卡编辑组件
function FlashcardEditor() {
  const [cards, setCards] = useState([
    { id: 1, front: '固态', back: '冰' },
  ]);

  const addCard = () => {
    const newId = cards.length + 1;
    setCards([...cards, { id: newId, front: '', back: '' }]);
  };

  const updateCard = (index: number, side: 'front' | 'back', value: string) => {
    const newCards = [...cards];
    newCards[index][side] = value;
    setCards(newCards);
  };

  const removeCard = (index: number) => {
    if (cards.length > 1) {
      setCards(cards.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      {cards.map((card, index) => (
        <div key={card.id} className="p-4 bg-[#fafbfc] rounded-xl space-y-4">
          {/* 卡片头部 */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#ff9500]">卡片 {index + 1}</span>
            {cards.length > 1 && (
              <button
                onClick={() => removeCard(index)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="删除卡片"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 正面和背面 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 正面 */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">正面</label>
              <div className="relative">
                <textarea
                  value={card.front}
                  onChange={(e) => updateCard(index, 'front', e.target.value)}
                  placeholder="输入正面内容..."
                  className="w-full min-h-[80px] p-3 pr-10 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-900 bg-white resize-none transition-all focus:outline-none focus:border-[#ff9500]"
                />
                <button
                  className="absolute right-2 bottom-2 w-6 h-6 rounded border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-[#ff9500] hover:text-[#ff9500] transition-all"
                  title="上传图片"
                >
                  <ImageIcon className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 背面 */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">背面</label>
              <div className="relative">
                <textarea
                  value={card.back}
                  onChange={(e) => updateCard(index, 'back', e.target.value)}
                  placeholder="输入背面内容..."
                  className="w-full min-h-[80px] p-3 pr-10 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-900 bg-white resize-none transition-all focus:outline-none focus:border-[#ff9500]"
                />
                <button
                  className="absolute right-2 bottom-2 w-6 h-6 rounded border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-[#ff9500] hover:text-[#ff9500] transition-all"
                  title="上传图片"
                >
                  <ImageIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* 添加卡片按钮 */}
      <button
        onClick={addCard}
        className="w-full h-12 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-400 flex items-center justify-center gap-2 hover:border-[#ff9500] hover:text-[#ff9500] hover:bg-[#fffbf5] transition-all"
      >
        <PlusIcon className="w-4 h-4" />
        <span>添加卡片</span>
      </button>
    </div>
  );
}

// CocoPi编辑组件
function CocoPiEditor() {
  const [task, setTask] = useState('使用CocoPi测量水温变化');

  return (
    <div className="space-y-6">
      {/* 任务描述 */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-orange-500">任务描述</label>
        <div className="relative">
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="输入CocoPi任务描述..."
            className="w-full min-h-[80px] p-4 pr-12 border-[1.5px] border-gray-200 rounded-[10px] text-sm text-gray-900 bg-[#fafbfc] resize-y transition-all focus:outline-none focus:border-[#ff9500] focus:bg-white"
          />
          <button
            className="absolute right-2 bottom-2 w-8 h-8 rounded-lg border-[1.5px] border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-[#ff9500] hover:text-[#ff9500] hover:bg-[#fffbf5] transition-all z-10"
            title="上传图片"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CocoPi 编程界面占位 */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-500">CocoPi 编程</label>
        <div className="w-full h-[200px] bg-[#1e1e1e] rounded-xl flex items-center justify-center">
          <div className="text-center">
            <CodeIcon className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <p className="text-sm text-gray-400">CocoPi 编程界面</p>
            <p className="text-xs text-gray-500 mt-1">拖拽积木块编写程序</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 创作空间编辑组件
function WorkspaceEditor() {
  const [task, setTask] = useState('使用CocoFlow设计水循环流程图');

  return (
    <div className="space-y-6">
      {/* 任务描述 */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-orange-500">任务描述</label>
        <div className="relative">
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="输入创作任务描述..."
            className="w-full min-h-[80px] p-4 pr-12 border-[1.5px] border-gray-200 rounded-[10px] text-sm text-gray-900 bg-[#fafbfc] resize-y transition-all focus:outline-none focus:border-[#ff9500] focus:bg-white"
          />
          <button
            className="absolute right-2 bottom-2 w-8 h-8 rounded-lg border-[1.5px] border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-[#ff9500] hover:text-[#ff9500] hover:bg-[#fffbf5] transition-all z-10"
            title="上传图片"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CocoFlow 创作界面占位 */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-500">CocoFlow 创作空间</label>
        <div className="w-full h-[200px] bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] rounded-xl border-2 border-dashed border-[#7dd3fc] flex items-center justify-center">
          <div className="text-center">
            <LayersIcon className="w-10 h-10 text-[#38bdf8] mx-auto mb-3" />
            <p className="text-sm text-[#0284c7]">CocoFlow 创作空间</p>
            <p className="text-xs text-[#7dd3fc] mt-1">拖拽组件创建流程图</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 诊断页面编辑器组件
function DiagnosisPageEditor({ page }: { page: CoursePage }) {
  const { dispatchCourse } = useEditor();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const questions = page.diagnosisData?.questions || [];

  // 获取难度名称
  const getDifficultyName = (difficulty: string) => {
    const names: Record<string, string> = {
      'hard': '难',
      'medium-hard': '较难',
      'medium': '中等',
      'medium-easy': '较易',
      'easy': '易'
    };
    return names[difficulty] || difficulty;
  };

  // 获取题型名称
  const getQuestionTypeName = (type: string) => {
    const names: Record<string, string> = {
      'single': '单选题',
      'multiple': '多选题',
      'judge': '判断题'
    };
    return names[type] || type;
  };

  // 换一道题（保持相同难度）
  const replaceQuestion = (questionId: string) => {
    // 这里需要有一个题库来替换，暂时显示提示
    alert('换题功能需要连接题库API');
  };

  if (questions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-3">📝</div>
          <div className="text-sm">暂无题目数据</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      {/* 左侧：题目列表 */}
      <div className="w-72 border-r border-gray-200 overflow-y-auto bg-gray-50">
        <div className="p-3 space-y-2">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                index === currentQuestionIndex
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setCurrentQuestionIndex(index)}
            >
              <div className="flex items-start gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                  index === currentQuestionIndex ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-800 line-clamp-2 mb-1">{question.content}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      question.difficulty === 'hard' ? 'bg-rose-100 text-rose-600' :
                      question.difficulty === 'medium-hard' ? 'bg-orange-100 text-orange-600' :
                      question.difficulty === 'medium' ? 'bg-amber-100 text-amber-600' :
                      question.difficulty === 'medium-easy' ? 'bg-teal-100 text-teal-600' :
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      {getDifficultyName(question.difficulty)}
                    </span>
                    <span className="text-[10px] text-gray-400">{question.knowledgePoint}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  replaceQuestion(question.id);
                }}
                className="mt-2 w-full px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                换一道
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧：题目详情 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {questions[currentQuestionIndex] && (
            <div className="p-6">
              {/* 题目头部信息 */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-emerald-600">第 {currentQuestionIndex + 1} 题</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    questions[currentQuestionIndex].difficulty === 'hard' ? 'bg-rose-100 text-rose-700' :
                    questions[currentQuestionIndex].difficulty === 'medium-hard' ? 'bg-orange-100 text-orange-700' :
                    questions[currentQuestionIndex].difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                    questions[currentQuestionIndex].difficulty === 'medium-easy' ? 'bg-teal-100 text-teal-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {getDifficultyName(questions[currentQuestionIndex].difficulty)}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    questions[currentQuestionIndex].type === 'single' ? 'bg-blue-100 text-blue-700' :
                    questions[currentQuestionIndex].type === 'multiple' ? 'bg-purple-100 text-purple-700' :
                    'bg-pink-100 text-pink-700'
                  }`}>
                    {getQuestionTypeName(questions[currentQuestionIndex].type)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">知识点：{questions[currentQuestionIndex].knowledgePoint}</span>
              </div>

              {/* 题目内容 */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">题目</h4>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{questions[currentQuestionIndex].content}</p>
              </div>

              {/* 选项（单选/多选/判断） */}
              {questions[currentQuestionIndex].options && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">选项</h4>
                  <div className="space-y-2">
                    {questions[currentQuestionIndex].options!.map((option: string, idx: number) => (
                      <div key={idx} className="p-3 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors">
                        <p className="text-sm text-gray-800">{option}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 答案 */}
              <div className="bg-emerald-50 rounded-xl p-4 mb-4">
                <h4 className="text-sm font-medium text-emerald-800 mb-2">参考答案</h4>
                <p className="text-sm text-emerald-700 font-medium">
                  {Array.isArray(questions[currentQuestionIndex].answer)
                    ? questions[currentQuestionIndex].answer.join('、')
                    : questions[currentQuestionIndex].answer}
                </p>
              </div>

              {/* 解析 */}
              {questions[currentQuestionIndex].analysis && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">解析</h4>
                  <p className="text-sm text-blue-700 leading-relaxed">{questions[currentQuestionIndex].analysis}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部导航栏 */}
        <div className="h-14 bg-gray-50 border-t border-gray-200 flex items-center justify-between px-5 flex-shrink-0">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentQuestionIndex === 0
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            上一道
          </button>

          <span className="text-sm text-gray-600">
            {currentQuestionIndex + 1} / {questions.length}
          </span>

          <button
            onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
            disabled={currentQuestionIndex === questions.length - 1}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentQuestionIndex === questions.length - 1
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            下一道
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// 对话诊断页面编辑器组件
function ConversationDiagnosisEditor({ page }: { page: CoursePage }) {
  const { dispatchCourse } = useEditor();
  const [isAdvancedMode, setIsAdvancedMode] = useState(page.conversationDiagnosisData?.config.isAdvancedMode || false);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [debugStep, setDebugStep] = useState<'question' | 'chat'>('question');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'ai' | 'user'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  const config = page.conversationDiagnosisData?.config;

  // 本地状态
  const [aiRole, setAiRole] = useState(config?.aiRole || '专业学科教师');
  const [dialogueStyle, setDialogueStyle] = useState<DialogueStyle>(config?.dialogueStyle || 'friendly');
  const [scoringPreference, setScoringPreference] = useState<ScoringPreference>(config?.scoringPreference || 'moderate');
  const [encouragementStyle, setEncouragementStyle] = useState<EncouragementStyle>(config?.encouragementStyle || 'moderate');
  const [maxRounds, setMaxRounds] = useState(config?.maxRounds || 5);
  const [specialFocus, setSpecialFocus] = useState(config?.specialFocus || '');
  const [customPrompt, setCustomPrompt] = useState(config?.customPrompt || '');

  // 高级配置状态
  const [avatarImage, setAvatarImage] = useState(config?.avatarConfig?.imageUrl || '');
  const [voiceId, setVoiceId] = useState(config?.voiceConfig?.voiceId || 'default');
  const [voicePitch, setVoicePitch] = useState(config?.voiceConfig?.pitch || 0);
  const [voiceVolume, setVoiceVolume] = useState(config?.voiceConfig?.volume || 70);
  const [voiceSpeed, setVoiceSpeed] = useState(config?.voiceConfig?.speed || 1);
  const [voiceAutoRead, setVoiceAutoRead] = useState(config?.voiceConfig?.autoRead || false);
  const [backgroundImage, setBackgroundImage] = useState(config?.backgroundConfig?.imageUrl || '');
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [showVoiceAdvanced, setShowVoiceAdvanced] = useState(false);

  // 音色选项
  const voiceOptions = [
    { id: 'default', name: '请选择' },
    { id: 'male-child', name: '男声普通话（儿童）' },
    { id: 'female-child', name: '女声普通话（儿童）' },
    { id: 'male-adult', name: '男声普通话（成人）' },
    { id: 'female-adult', name: '女声普通话（成人）' },
    { id: 'male-cantonese', name: '男声粤语' },
    { id: 'female-cantonese', name: '女声粤语' },
  ];

  // 默认提示词
  const defaultPrompt = `# 角色设定
你是一位专业且富有耐心的学科教师，负责诊断学生对以下前序知识点的掌握程度：

1. 运动和静止的相对性
2. 速度的概念
3. 物体间的相互作用

# 交流风格
请使用亲切、友好的语言与学生交流，像一位关心学生的老师。

# 评分标准
评分时请按照适中标准，既反映学生真实水平，也适当考虑学生的努力。

# 反馈方式
反馈时在指出问题的同时，肯定学生做得好的地方。

## 对话引导规则

### 开场白
诊断开始时，请友好地介绍自己和诊断目的，让学生放松心情。

### 选择题阶段
- 每次只展示一道题目
- 等待学生回答后再给出下一题`;

  // 模拟题目
  const sampleQuestion = {
    content: '水在常温下是什么状态？',
    options: ['A. 固态', 'B. 液态', 'C. 气态', 'D. 不确定'],
    answer: 'B'
  };

  // 保存配置
  const saveConfig = () => {
    if (!page.conversationDiagnosisData) return;

    const avatarConfig: AvatarConfig | undefined = avatarImage ? { imageUrl: avatarImage, name: '' } : undefined;
    const voiceConfig: VoiceConfig = {
      voiceId,
      pitch: voicePitch,
      volume: voiceVolume,
      speed: voiceSpeed,
      autoRead: voiceAutoRead,
    };
    const backgroundConfig: BackgroundConfig | undefined = backgroundImage ? { imageUrl: backgroundImage } : undefined;

    const updatedConfig: ConversationDiagnosisConfig = {
      aiRole,
      dialogueStyle,
      scoringPreference,
      encouragementStyle,
      maxRounds,
      specialFocus,
      customPrompt,
      isAdvancedMode,
      avatarConfig,
      voiceConfig,
      backgroundConfig,
    };

    const updatedPage: CoursePage = {
      ...page,
      conversationDiagnosisData: {
        ...page.conversationDiagnosisData,
        config: updatedConfig,
      }
    };

    dispatchCourse({ type: 'UPDATE_PAGE', payload: updatedPage });
  };

  // 提交答案进入对话
  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    setDebugStep('chat');
    setChatMessages([
      { role: 'ai', content: `同学你好呀😊，咱们今天来检测一下你对物质状态这个知识点的理解。你先说说，在生活中，你能想到哪些地方会用到物质状态的知识呢🤔？` }
    ]);
  };

  // 发送聊天消息
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]);
    setChatInput('');
    // 模拟AI回复
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'ai', content: '很好！你的回答很有思考。让我们继续探讨一下，你觉得水在什么条件下会变成冰呢？' }]);
    }, 1000);
  };

  // 退出调试模式
  const handleExitDebug = () => {
    setIsDebugMode(false);
    setDebugStep('question');
    setSelectedAnswer(null);
    setChatMessages([]);
  };

  // 对话风格选项
  const dialogueStyleOptions: { value: DialogueStyle; label: string; desc: string }[] = [
    { value: 'formal', label: '正式严谨', desc: '专业术语，逻辑清晰' },
    { value: 'friendly', label: '亲切友好', desc: '温和鼓励，循循善诱' },
    { value: 'inspiring', label: '启发引导', desc: '问题引导，激发思考' },
  ];

  // 评分偏好选项
  const scoringOptions: { value: ScoringPreference; label: string; desc: string }[] = [
    { value: 'strict', label: '严格', desc: '严格按标准评分' },
    { value: 'moderate', label: '适中', desc: '兼顾过程与结果' },
    { value: 'encouraging', label: '鼓励性', desc: '侧重进步与努力' },
  ];

  // 鼓励方式选项
  const encouragementOptions: { value: EncouragementStyle; label: string; desc: string }[] = [
    { value: 'brief', label: '简洁反馈', desc: '简明扼要' },
    { value: 'moderate', label: '适度鼓励', desc: '适当肯定' },
    { value: 'enthusiastic', label: '热情鼓励', desc: '积极正向' },
  ];

  if (!config) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-3">💬</div>
          <div className="text-sm">暂无配置数据</div>
        </div>
      </div>
    );
  }

  // 调试模式UI
  if (isDebugMode) {
    return (
      <div
        className="flex-1 flex flex-col overflow-hidden relative"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* 顶部工具栏 */}
        <div className="absolute top-0 left-0 right-0 h-14 bg-black/30 backdrop-blur-sm flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <span className="text-white font-medium">对话诊断-测试工具</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 text-white text-sm hover:bg-white/30 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              重开
            </button>
            <button
              onClick={handleExitDebug}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/80 text-white text-sm hover:bg-red-500 transition-colors"
            >
              退出调试
            </button>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 flex items-center justify-center pt-14 pb-24 px-6">
          {/* 角色形象 */}
          {avatarImage && (
            <div className="absolute left-8 bottom-24 w-48 h-64">
              <img src={avatarImage} alt="AI角色" className="w-full h-full object-contain" />
            </div>
          )}

          {/* 对话/题目区域 */}
          <div className="w-full max-w-4xl">
            {debugStep === 'question' ? (
              // 答题界面
              <div className="bg-black/60 backdrop-blur-md rounded-2xl p-8 border-2 border-yellow-400/50">
                <h3 className="text-xl font-bold text-white mb-6">{sampleQuestion.content}</h3>
                <div className="space-y-3">
                  {sampleQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedAnswer(option.charAt(0))}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        selectedAnswer === option.charAt(0)
                          ? 'bg-yellow-400 text-gray-900'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                  className={`mt-6 w-full py-3 rounded-xl font-medium transition-all ${
                    selectedAnswer
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  提交答案
                </button>
              </div>
            ) : (
              // 对话界面
              <div className="bg-black/60 backdrop-blur-md rounded-2xl border-2 border-yellow-400/50 overflow-hidden">
                {/* 对话消息区 */}
                <div className="h-[400px] overflow-y-auto p-6 space-y-4">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/90 text-gray-900'
                      }`}>
                        {msg.role === 'ai' && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-gray-500">AI:</span>
                            <div className="flex items-center gap-1">
                              <button className="p-1 hover:bg-gray-200 rounded"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
                              <button className="p-1 hover:bg-gray-200 rounded"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg></button>
                            </div>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* 导航按钮 */}
                <div className="px-6 py-3 border-t border-white/10 flex justify-end gap-4">
                  <button className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">《 上一步</button>
                  <button className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">下一步 》</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部输入框 */}
        {debugStep === 'chat' && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/30 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="请输入"
                  className="w-full h-12 px-4 pr-24 rounded-xl bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-1.5 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    发送
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* 顶部标签切换 */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdvancedMode(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !isAdvancedMode
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            基础配置
          </button>
          <button
            onClick={() => setIsAdvancedMode(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isAdvancedMode
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            高级模式
          </button>
        </div>
        {/* 调试按钮 */}
        <button
          onClick={() => setIsDebugMode(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          调试
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-6">
        {!isAdvancedMode ? (
          // 基础配置模式
          <div className="max-w-2xl mx-auto space-y-6">
            {/* AI角色设定 */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">AI角色设定</label>
              <input
                type="text"
                value={aiRole}
                onChange={(e) => setAiRole(e.target.value)}
                placeholder="例如：专业学科教师"
                className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* 对话风格 */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900">对话风格</label>
              <div className="grid grid-cols-3 gap-3">
                {dialogueStyleOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDialogueStyle(option.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      dialogueStyle === option.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`text-sm font-medium ${dialogueStyle === option.value ? 'text-emerald-700' : 'text-gray-900'}`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 评分偏好 */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900">评分偏好</label>
              <div className="grid grid-cols-3 gap-3">
                {scoringOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setScoringPreference(option.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      scoringPreference === option.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`text-sm font-medium ${scoringPreference === option.value ? 'text-emerald-700' : 'text-gray-900'}`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 鼓励方式 */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900">鼓励方式</label>
              <div className="grid grid-cols-3 gap-3">
                {encouragementOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setEncouragementStyle(option.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      encouragementStyle === option.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`text-sm font-medium ${encouragementStyle === option.value ? 'text-emerald-700' : 'text-gray-900'}`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 最大对话轮次 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-900">最大对话轮次</label>
                <span className="text-sm font-medium text-emerald-600">{maxRounds}轮</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={maxRounds}
                onChange={(e) => setMaxRounds(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>1轮</span>
                <span>10轮</span>
              </div>
            </div>

            {/* 特别关注 */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">特别关注（可选）</label>
              <textarea
                value={specialFocus}
                onChange={(e) => setSpecialFocus(e.target.value)}
                placeholder="例如：重点关注学生对物质状态变化的理解..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        ) : (
          // 高级模式
          <div className="max-w-3xl mx-auto space-y-6">
            {/* 自定义提示词 */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-900">自定义提示词</span>
                <button
                  onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  {isPromptExpanded ? '收起' : '展开'}
                  <svg className={`w-4 h-4 transition-transform ${isPromptExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <textarea
                value={customPrompt}
                onChange={(e) => {
                  setCustomPrompt(e.target.value);
                  saveConfig();
                }}
                rows={isPromptExpanded ? 20 : 6}
                className="w-full px-4 py-3 text-sm font-mono resize-none focus:outline-none border-none"
                placeholder="输入自定义提示词..."
              />
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setCustomPrompt(defaultPrompt)}
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                >
                  重置为默认
                </button>
                <button
                  onClick={() => setIsPromptExpanded(false)}
                  className="px-4 py-1.5 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  完成编辑
                </button>
              </div>
            </div>

            {/* 角色形象和背景图片 - 同一行 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 角色形象 */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                    <span className="text-sm font-semibold text-gray-900">角色形象</span>
                  </div>
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            setAvatarImage(e.target?.result as string);
                            saveConfig();
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                    className="text-xs text-pink-500 hover:text-pink-600 font-medium"
                  >
                    更换图片
                  </button>
                </div>
                <div
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setAvatarImage(e.target?.result as string);
                          saveConfig();
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                  className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors"
                >
                  {avatarImage ? (
                    <img src={avatarImage} alt="角色形象" className="h-full object-contain" />
                  ) : (
                    <>
                      <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-gray-500">点击上传角色图片</span>
                    </>
                  )}
                </div>
              </div>

              {/* 背景图片 */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                    <span className="text-sm font-semibold text-gray-900">背景图片</span>
                  </div>
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            setBackgroundImage(e.target?.result as string);
                            saveConfig();
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                    className="text-xs text-pink-500 hover:text-pink-600 font-medium"
                  >
                    更换图片
                  </button>
                </div>
                <div
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setBackgroundImage(e.target?.result as string);
                          saveConfig();
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                  className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors"
                >
                  {backgroundImage ? (
                    <img src={backgroundImage} alt="背景图片" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <>
                      <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-gray-500">点击上传背景图片</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 语音播报配置 */}
            <div className="bg-gray-50 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                  <span className="text-sm font-semibold text-gray-900">语音播报</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-sm text-pink-500 border border-pink-300 rounded-lg hover:bg-pink-50 transition-colors">
                    播放
                  </button>
                  <button
                    onClick={() => setShowVoiceAdvanced(!showVoiceAdvanced)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    高级设置 {showVoiceAdvanced ? '∧' : '∨'}
                  </button>
                </div>
              </div>

              {/* 音色选择 */}
              <div className="space-y-2">
                <select
                  value={voiceId}
                  onChange={(e) => {
                    setVoiceId(e.target.value);
                    saveConfig();
                  }}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  {voiceOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              </div>

              {/* 高级设置 */}
              {showVoiceAdvanced && (
                <div className="space-y-4 pt-2 border-t border-gray-200">
                  {/* 音高 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">音高</span>
                      <span className="text-sm font-medium text-gray-900">{voicePitch}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={voicePitch}
                      onChange={(e) => {
                        setVoicePitch(parseInt(e.target.value));
                        saveConfig();
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>

                  {/* 音量 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">音量</span>
                      <span className="text-sm font-medium text-gray-900">{voiceVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={voiceVolume}
                      onChange={(e) => {
                        setVoiceVolume(parseInt(e.target.value));
                        saveConfig();
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>

                  {/* 语速 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">语速</span>
                      <span className="text-sm font-medium text-gray-900">{voiceSpeed}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={voiceSpeed}
                      onChange={(e) => {
                        setVoiceSpeed(parseFloat(e.target.value));
                        saveConfig();
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>

                  {/* 自动朗读 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">自动朗读</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={voiceAutoRead}
                        onChange={(e) => {
                          setVoiceAutoRead(e.target.checked);
                          saveConfig();
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 底部保存按钮 */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={saveConfig}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition-colors"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
}

// 底部页面大纲组件
function BottomOutline({ selectedPageIndex = 0 }: { selectedPageIndex?: number }) {
  const pages = [
    { id: 1, type: 'title' as PageType, title: '标题页' },
    { id: 2, type: 'choice' as PageType, title: '选择题' },
    { id: 3, type: 'content' as PageType, title: '内容页' },
    { id: 4, type: 'qa' as PageType, title: '问答' },
  ];

  return (
    <div className="h-[140px] bg-white rounded-2xl shadow-sm flex-shrink-0 overflow-hidden">
      <div className="h-full px-6 py-4 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-3.5 h-full items-center">
          {pages.map((page, index) => (
            <div
              key={page.id}
              className={`relative flex-shrink-0 w-[160px] h-[95px] rounded-xl border-2 bg-white cursor-pointer transition-all flex flex-col items-center justify-center ${
                index === selectedPageIndex
                  ? 'border-[#ff9500] shadow-[0_0_0_2px_rgba(255,149,0,0.1)]'
                  : 'border-gray-200 hover:border-[#ff9500] hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(255,149,0,0.15)]'
              }`}
            >
              {/* 页码 */}
              <span className="absolute top-2 left-2.5 text-[11px] font-bold text-gray-500 bg-white w-5 h-5 rounded-md flex items-center justify-center">
                {page.id}
              </span>
              {/* 页面类型标签 */}
              <span className="absolute top-2 right-2.5 text-[10px] font-medium text-gray-400">
                {pageTypeNames[page.type]}
              </span>
              {/* 页面预览占位 */}
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs text-gray-400">{page.title}</span>
              </div>
            </div>
          ))}

          {/* 添加页面按钮 */}
          <button className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 bg-white cursor-pointer flex items-center justify-center text-gray-400 text-xl transition-all flex-shrink-0 hover:border-[#ff9500] hover:border-solid hover:text-[#ff9500] hover:bg-[#fff7ed]">
            +
          </button>
        </div>
      </div>
    </div>
  );
}

// 工具编辑区域组件
function ToolEditArea({ toolType }: { toolType: ToolType }) {
  const { dispatchEditor } = useEditor();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSwitchTool = (newTool: ToolType) => {
    dispatchEditor({ type: 'SWITCH_TO_TOOL_MODE', payload: newTool });
    setShowDropdown(false);
  };

  const renderToolEditor = () => {
    switch (toolType) {
      case 'vote':
        return <VoteEditor />;
      case 'choice':
        return <ChoiceEditor />;
      case 'qa':
        return <QAEditor />;
      case 'photo':
        return <PhotoEditor />;
      case 'fillblank':
        return <FillBlankEditor />;
      case 'sort':
        return <SortEditor />;
      case 'whiteboard':
        return <WhiteboardEditor />;
      case 'flashcard':
        return <FlashcardEditor />;
      case 'cocopi':
        return <CocoPiEditor />;
      case 'workspace':
        return <WorkspaceEditor />;
      default:
        return (
          <div className="text-center text-gray-400 py-10">
            <div className="text-4xl mb-3">🛠️</div>
            <div className="text-sm">{toolConfigs[toolType as keyof typeof toolConfigs]?.name || '未知'}工具编辑区域</div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* 工具类型选择器 */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="relative inline-block">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {toolConfigs[toolType].icon}
            <span>{toolConfigs[toolType].name}</span>
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </button>

          {/* 下拉菜单 */}
          {showDropdown && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
              {Object.entries(toolConfigs).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleSwitchTool(key as ToolType)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors ${
                    key === toolType ? 'text-orange-500 bg-orange-50' : 'text-gray-700'
                  }`}
                >
                  {config.icon}
                  <span>{config.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 工具编辑内容 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {renderToolEditor()}
        </div>
      </div>
    </div>
  );
}

export default function CenterEditor() {
  const { courseData, editorState, dispatchEditor } = useEditor();

  // 工具模式
  if (editorState.editorMode === 'tool' && editorState.currentTool) {
    return (
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* 工具编辑区域 */}
        <ToolEditArea toolType={editorState.currentTool} />

        {/* 底部大纲 */}
        <BottomOutline selectedPageIndex={1} />
      </div>
    );
  }

  // 默认编辑模式
  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] relative">
      {/* 元素工具栏 */}
      <div
        className={`min-h-[60px] bg-white border-b border-gray-100 items-center px-6 gap-2.5 sticky top-0 z-[3] ${
          editorState.selectedElement ? 'flex' : 'hidden'
        }`}
      >
        {/* 插入工具 */}
        <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
          <button className="h-[38px] px-3.5 rounded-xl border-none bg-gray-50 text-sm font-medium text-gray-600 cursor-pointer flex items-center gap-1.5 transition-all hover:bg-orange-50 hover:text-orange-500 hover:-translate-y-px">
            <TextIcon className="w-4 h-4" />
            文本
          </button>
          <button className="h-[38px] px-3.5 rounded-xl border-none bg-gray-50 text-sm font-medium text-gray-600 cursor-pointer flex items-center gap-1.5 transition-all hover:bg-orange-50 hover:text-orange-500 hover:-translate-y-px">
            <ImageIcon className="w-4 h-4" />
            图片
          </button>
          <button className="h-[38px] px-3.5 rounded-xl border-none bg-gray-50 text-sm font-medium text-gray-600 cursor-pointer flex items-center gap-1.5 transition-all hover:bg-orange-50 hover:text-orange-500 hover:-translate-y-px">
            <TableIcon className="w-4 h-4" />
            表格
          </button>
          <div className="relative">
            <button className="h-[38px] px-3.5 rounded-xl border-none bg-gray-50 text-sm font-medium text-gray-600 cursor-pointer flex items-center gap-1.5 transition-all hover:bg-orange-50 hover:text-orange-500 hover:-translate-y-px">
              <CircleIcon className="w-4 h-4" />
              形状
              <ChevronDownIcon className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 编辑工具 */}
        {editorState.selectedElement && (
          <div className="flex items-center gap-2 pl-4">
            <button className="h-[38px] px-3.5 rounded-xl border-none bg-gray-50 text-sm font-medium text-gray-600 cursor-pointer flex items-center gap-1.5 transition-all hover:bg-orange-50 hover:text-orange-500 hover:-translate-y-px">
              <EditIcon className="w-4 h-4" />
              编辑
            </button>
            <button className="h-[38px] px-3.5 rounded-xl border-none bg-gray-50 text-sm font-medium text-gray-600 cursor-pointer flex items-center gap-1.5 transition-all hover:bg-orange-50 hover:text-orange-500 hover:-translate-y-px">
              <TrashIcon className="w-4 h-4" />
              删除
            </button>
            <button className="h-[38px] px-3.5 rounded-xl border-none bg-gray-50 text-sm font-medium text-gray-600 cursor-pointer flex items-center gap-1.5 transition-all hover:bg-orange-50 hover:text-orange-500 hover:-translate-y-px">
              <CopyIcon className="w-4 h-4" />
              复制
            </button>
          </div>
        )}
      </div>

      {/* 幻灯片区域 */}
      <div className="flex-1 flex flex-col p-0 overflow-hidden bg-gray-50 relative">
        {(() => {
          // 获取当前选中的页面
          const selectedPage = courseData.pages.find(p => p.id === editorState.selectedPage);

          // 如果是诊断页面，渲染诊断编辑器
          if (selectedPage?.type === 'diagnosis') {
            return <DiagnosisPageEditor page={selectedPage} />;
          }

          // 如果是对话诊断页面，渲染对话诊断编辑器
          if (selectedPage?.type === 'conversation-diagnosis') {
            return <ConversationDiagnosisEditor page={selectedPage} />;
          }

          // 默认内容
          return (
            <div className="flex-1 w-full h-auto bg-white shadow-none rounded-none flex items-center justify-center p-10">
              {courseData.pages.length === 0 ? (
                <div className="text-center text-gray-400">
                  <div className="text-6xl mb-5 opacity-60">✨</div>
                  <div className="text-base font-medium mb-2 text-gray-500">
                    使用左侧AI生成课程内容
                  </div>
                  <div className="text-sm text-gray-300">
                    描述您的需求,AI将为您创建完整课程
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    {selectedPage ? selectedPage.title : '请选择一个页面'}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* 底部大纲 */}
      {courseData.pages.filter(p => !p.hidden).length > 0 && (
        <div className="h-[150px] bg-gray-50 border-t border-gray-100 px-6 py-4 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-3.5 h-full items-center">
            {courseData.pages.filter(p => !p.hidden).map((page, index) => {
              const isSelected = editorState.selectedPage === page.id;
              const isDiagnosis = page.type === 'diagnosis';
              const isConversationDiagnosis = page.type === 'conversation-diagnosis';
              const isSpecialPage = isDiagnosis || isConversationDiagnosis;
              return (
                <div
                  key={page.id}
                  className="relative flex items-center gap-3.5 z-[1]"
                  onClick={() => dispatchEditor({ type: 'SELECT_PAGE', payload: page.id })}
                >
                  <div className={`w-[190px] h-[110px] flex-shrink-0 rounded-xl border-2 bg-white cursor-pointer relative transition-all flex flex-col items-center justify-center text-xs ${
                    isSelected
                      ? isSpecialPage
                        ? 'border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.1)]'
                        : 'border-orange-500 shadow-[0_0_0_2px_rgba(255,149,0,0.1)]'
                      : 'border-gray-200 hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.08)]'
                  }`}>
                    <span className="absolute top-2 left-2.5 text-[11px] font-bold text-gray-500 bg-white w-6 h-6 rounded-md flex items-center justify-center">
                      {index + 1}
                    </span>
                    {isDiagnosis && (
                      <span className="absolute top-2 right-2.5 text-sm">📝</span>
                    )}
                    {isConversationDiagnosis && (
                      <span className="absolute top-2 right-2.5 text-sm">💬</span>
                    )}
                    <span className={`text-sm ${isSelected ? (isSpecialPage ? 'text-emerald-600 font-medium' : 'text-orange-600 font-medium') : 'text-gray-500'}`}>
                      {page.title}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* 添加页面按钮 */}
            <button className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 bg-white cursor-pointer flex items-center justify-center text-gray-400 text-xl transition-all flex-shrink-0 hover:border-orange-500 hover:border-solid hover:text-orange-500 hover:bg-orange-50">
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
