'use client';

import { useState } from 'react';
import { XIcon, ImageIcon } from '@/components/icons';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  onPublish: (config: PublishConfig) => void;
}

interface PublishConfig {
  subject: string;
  grade: string;
  classId: string;
  visibility: 'students' | 'organization' | 'public';
}

const subjects = [
  { value: '', label: '请选择学科' },
  { value: 'chinese', label: '语文' },
  { value: 'math', label: '数学' },
  { value: 'english', label: '英语' },
  { value: 'physics', label: '物理' },
  { value: 'chemistry', label: '化学' },
  { value: 'biology', label: '生物' },
  { value: 'history', label: '历史' },
  { value: 'geography', label: '地理' },
  { value: 'politics', label: '道德与法治' },
  { value: 'science', label: '科学' },
];

const grades = [
  { value: '', label: '请选择年级' },
  { value: '1', label: '一年级' },
  { value: '2', label: '二年级' },
  { value: '3', label: '三年级' },
  { value: '4', label: '四年级' },
  { value: '5', label: '五年级' },
  { value: '6', label: '六年级' },
  { value: '7', label: '七年级' },
  { value: '8', label: '八年级' },
  { value: '9', label: '九年级' },
];

const classes = [
  { value: '', label: '请选择班级' },
  ...Array.from({ length: 10 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}班`,
  })),
];

export default function PublishModal({
  isOpen,
  onClose,
  courseTitle,
  onPublish,
}: PublishModalProps) {
  const [config, setConfig] = useState<PublishConfig>({
    subject: '',
    grade: '',
    classId: '',
    visibility: 'students',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPublish(config);
  };

  const isValid = config.subject && config.grade && config.classId;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] animate-fadeIn">
      <div className="bg-white rounded-[20px] p-7 max-w-[780px] w-[90%] max-h-[85vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.2)] animate-scaleIn relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl border-none bg-gray-100 cursor-pointer flex items-center justify-center transition-all hover:bg-gray-200"
        >
          <XIcon className="w-5 h-5" />
        </button>

        {/* 头部 */}
        <div className="mb-4 pb-3 border-b border-gray-100 text-center">
          <h2 className="text-[22px] font-bold text-gray-900 mb-2">发布课程</h2>
          <div className="text-lg font-semibold text-gray-900 py-2.5 px-4 border border-transparent rounded-xl inline-block min-w-[120px] max-w-[500px]">
            {courseTitle}
          </div>
        </div>

        {/* 内容 */}
        <div className="grid grid-cols-[1fr_260px] gap-4">
          {/* 左侧表单 */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                学科 <span className="text-red-500">*</span>
              </label>
              <select
                value={config.subject}
                onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                className="w-full h-11 px-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white transition-all focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                required
              >
                {subjects.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  年级 <span className="text-red-500">*</span>
                </label>
                <select
                  value={config.grade}
                  onChange={(e) => setConfig({ ...config, grade: e.target.value })}
                  className="w-full h-11 px-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white transition-all focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                  required
                >
                  {grades.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  班级 <span className="text-red-500">*</span>
                </label>
                <select
                  value={config.classId}
                  onChange={(e) => setConfig({ ...config, classId: e.target.value })}
                  className="w-full h-11 px-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white transition-all focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                  required
                >
                  {classes.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                可见范围 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {[
                  {
                    value: 'students' as const,
                    label: '仅发布学生可见',
                    desc: '仅对发布的班级学生可见，其他人无法访问',
                  },
                  {
                    value: 'organization' as const,
                    label: '组织内可见',
                    desc: '组织内所有成员可见',
                  },
                  {
                    value: 'public' as const,
                    label: '公开',
                    desc: '所有人可见',
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      config.visibility === option.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={config.visibility === option.value}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          visibility: e.target.value as PublishConfig['visibility'],
                        })
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        config.visibility === option.value
                          ? 'border-orange-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {config.visibility === option.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold cursor-pointer transition-all hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!isValid}
                className="flex-1 h-11 rounded-xl border-none bg-orange-500 text-white text-sm font-semibold cursor-pointer transition-all hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认发布
              </button>
            </div>
          </form>

          {/* 右侧封面 */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-700">课程封面</label>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer transition-all hover:border-orange-500 hover:bg-orange-50 flex items-center justify-center">
              <div className="text-center text-gray-400 z-[1]">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium">点击上传封面</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
