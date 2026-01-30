# 面板切换JavaScript逻辑分析报告

## 文件来源
- 源文件：`/Users/cpaella/Downloads/Interactive_Courseware_without_ToolAI.html`
- 分析日期：2026-01-27

---

## 1. switchToPanel() 函数完整实现

### 核心函数定义（第8282-8342行）

```javascript
// 切换面板
function switchToPanel(panelType) {
    const aiPanel = document.getElementById('aiPanel');
    const pagesPanel = document.getElementById('pagesPanel');
    const toolsPanel = document.getElementById('toolsPanel');
    const appsPanel = document.getElementById('appsPanel');
    const webPanel = document.getElementById('webPanel');
    const resourcesPanel = document.getElementById('resourcesPanel');

    // 第一步：移除所有面板的 collapsed 和 hidden 类
    [aiPanel, pagesPanel, toolsPanel, appsPanel, webPanel, resourcesPanel].forEach(panel => {
        if (panel) {
            panel.classList.remove('collapsed', 'hidden');
        }
    });

    // 第二步：根据 panelType 隐藏其他面板，显示目标面板
    if (panelType === 'ai') {
        pagesPanel.classList.add('hidden');
        toolsPanel.classList.add('hidden');
        appsPanel.classList.add('hidden');
        webPanel.classList.add('hidden');
        resourcesPanel.classList.add('hidden');
        restoreNormalView();
    } else if (panelType === 'pages') {
        aiPanel.classList.add('hidden');
        toolsPanel.classList.add('hidden');
        appsPanel.classList.add('hidden');
        webPanel.classList.add('hidden');
        resourcesPanel.classList.add('hidden');
        restoreNormalView();
    } else if (panelType === 'tools') {
        aiPanel.classList.add('hidden');
        pagesPanel.classList.add('hidden');
        appsPanel.classList.add('hidden');
        webPanel.classList.add('hidden');
        resourcesPanel.classList.add('hidden');
        document.getElementById('toolsListView').classList.remove('hidden');
        document.getElementById('toolsConfigView').classList.add('hidden');
        restoreNormalView();
    } else if (panelType === 'apps') {
        aiPanel.classList.add('hidden');
        pagesPanel.classList.add('hidden');
        toolsPanel.classList.add('hidden');
        webPanel.classList.add('hidden');
        resourcesPanel.classList.add('hidden');
        restoreNormalView();
    } else if (panelType === 'web') {
        aiPanel.classList.add('hidden');
        pagesPanel.classList.add('hidden');
        toolsPanel.classList.add('hidden');
        appsPanel.classList.add('hidden');
        resourcesPanel.classList.add('hidden');
        switchToWebView('list');
        restoreNormalView();
    } else if (panelType === 'resources') {
        aiPanel.classList.add('hidden');
        pagesPanel.classList.add('hidden');
        toolsPanel.classList.add('hidden');
        appsPanel.classList.add('hidden');
        webPanel.classList.add('hidden');
        restoreNormalView();
    }
}
```

### 函数逻辑流程

```
switchToPanel(panelType)
    ↓
1. 获取所有6个面板的DOM引用
    ↓
2. 移除所有面板的 'collapsed' 和 'hidden' 类
    ↓
3. 根据 panelType 执行条件分支：
    ├─ 'ai'        → 隐藏其他5个面板 + restoreNormalView()
    ├─ 'pages'     → 隐藏其他5个面板 + restoreNormalView()
    ├─ 'tools'     → 隐藏其他5个面板 + 显示toolsListView + restoreNormalView()
    ├─ 'apps'      → 隐藏其他5个面板 + restoreNormalView()
    ├─ 'web'       → 隐藏其他5个面板 + switchToWebView('list') + restoreNormalView()
    └─ 'resources' → 隐藏其他5个面板 + restoreNormalView()
```

---

## 2. 面板显示/隐藏的逻辑

### CSS 类定义

#### 隐藏类（.hidden）
```css
.hidden {
    display: none;
}
```
- **作用**：完全隐藏面板，不占用DOM空间
- **应用场景**：切换不同的主面板时

#### 折叠类（.collapsed）
```css
.secondary-panel.collapsed {
    width: 0;
    overflow: hidden;
}

.right-panel.collapsed {
    width: 60px;
}

.right-panel.collapsed .menu-content {
    opacity: 0;
    pointer-events: none;
}

.right-panel.collapsed .collapse-text,
.right-panel.collapsed .outline-panel {
    display: none;
}
```
- **作用**：折叠面板，保留最小宽度显示图标
- **应用场景**：用户点击折叠按钮时

### 面板显示/隐藏状态转换表

| 操作 | 类名变化 | 效果 |
|------|---------|------|
| 显示面板 | 移除 `hidden` | `display: block` |
| 隐藏面板 | 添加 `hidden` | `display: none` |
| 折叠面板 | 添加 `collapsed` | 宽度变为0或60px |
| 展开面板 | 移除 `collapsed` | 恢复原始宽度 |

---

## 3. 菜单项激活状态的切换

### 菜单项HTML结构

```html
<div class="menu-item active" data-panel="ai">
    <svg class="menu-icon"><!-- AI图标 --></svg>
    <span class="menu-label">AI</span>
</div>

<div class="menu-item" data-panel="pages">
    <svg class="menu-icon"><!-- Pages图标 --></svg>
    <span class="menu-label">页面</span>
</div>

<div class="menu-item" data-panel="tools">
    <svg class="menu-icon"><!-- Tools图标 --></svg>
    <span class="menu-label">工具</span>
</div>

<div class="menu-item" data-panel="apps">
    <svg class="menu-icon"><!-- Apps图标 --></svg>
    <span class="menu-label">应用</span>
</div>

<div class="menu-item" data-panel="web">
    <svg class="menu-icon"><!-- Web图标 --></svg>
    <span class="menu-label">网页</span>
</div>

<div class="menu-item" data-panel="resources">
    <svg class="menu-icon"><!-- Resources图标 --></svg>
    <span class="menu-label">资源</span>
</div>
```

### 菜单项激活状态切换逻辑（第8392-8413行）

```javascript
// 一级菜单点击
document.querySelectorAll('.primary-menu .menu-item').forEach(item => {
    item.addEventListener('click', function() {
        // 第一步：移除所有菜单项的 active 类
        document.querySelectorAll('.primary-menu .menu-item').forEach(i =>
            i.classList.remove('active')
        );

        // 第二步：为当前点击的菜单项添加 active 类
        this.classList.add('active');

        // 第三步：获取 data-panel 属性值
        const panelType = this.getAttribute('data-panel');

        // 第四步：根据 panelType 调用 switchToPanel()
        if (panelType === 'ai') {
            switchToPanel('ai');
        } else if (panelType === 'pages') {
            switchToPanel('pages');
        } else if (panelType === 'tools') {
            switchToPanel('tools');
        } else if (panelType === 'apps') {
            switchToPanel('apps');
        } else if (panelType === 'web') {
            switchToPanel('web');
        } else if (panelType === 'resources') {
            switchToPanel('resources');
        }
    });
});
```

### 菜单项激活状态CSS样式

```css
/* 默认状态 */
.menu-item {
    width: 84px;
    padding: 12px 8px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
}

/* 悬停状态 */
.menu-item:hover {
    background: #f3f4f6;
}

/* 激活状态 */
.menu-item.active {
    background: #fff7ed;
    box-shadow: 0 2px 8px rgba(255, 149, 0, 0.15);
}

/* 激活状态 - 左侧指示条 */
.menu-item.active::after {
    content: '';
    position: absolute;
    left: -8px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 32px;
    background: #ff9500;
    border-radius: 0 2px 2px 0;
}

/* 菜单图标 - 默认状态 */
.menu-icon {
    width: 22px;
    height: 22px;
    color: #6b7280;
    flex-shrink: 0;
}

/* 菜单图标 - 激活状态 */
.menu-item.active .menu-icon {
    color: #ff9500;
}

/* 菜单标签 - 默认状态 */
.menu-label {
    font-size: 11px;
    font-weight: 500;
    color: #6b7280;
    text-align: center;
    line-height: 1.2;
}

/* 菜单标签 - 激活状态 */
.menu-item.active .menu-label {
    color: #ff9500;
    font-weight: 600;
}
```

### 激活状态视觉变化

| 元素 | 默认状态 | 激活状态 |
|------|---------|---------|
| 背景色 | 透明 | `#fff7ed`（浅橙色） |
| 阴影 | 无 | `0 2px 8px rgba(255, 149, 0, 0.15)` |
| 左侧指示条 | 无 | 4px宽 橙色条 |
| 图标颜色 | `#6b7280`（灰色） | `#ff9500`（橙色） |
| 标签颜色 | `#6b7280`（灰色） | `#ff9500`（橙色） |
| 标签字重 | 500 | 600 |

---

## 4. 面板折叠/展开的动画效果

### 二级面板折叠逻辑（第8345-8377行）

```javascript
// 二级菜单折叠
function toggleSecondaryPanel() {
    const aiPanel = document.getElementById('aiPanel');
    const pagesPanel = document.getElementById('pagesPanel');
    const toolsPanel = document.getElementById('toolsPanel');
    const appsPanel = document.getElementById('appsPanel');
    const webPanel = document.getElementById('webPanel');
    const resourcesPanel = document.getElementById('resourcesPanel');

    // 第一步：找到当前显示的活跃面板
    let activePanel = null;
    if (!aiPanel.classList.contains('hidden')) {
        activePanel = aiPanel;
    } else if (!pagesPanel.classList.contains('hidden')) {
        activePanel = pagesPanel;
    } else if (!toolsPanel.classList.contains('hidden')) {
        activePanel = toolsPanel;
    } else if (!appsPanel.classList.contains('hidden')) {
        activePanel = appsPanel;
    } else if (!webPanel.classList.contains('hidden')) {
        activePanel = webPanel;
    } else if (!resourcesPanel.classList.contains('hidden')) {
        activePanel = resourcesPanel;
    }

    if (!activePanel) return;

    // 第二步：切换 collapsed 类
    activePanel.classList.toggle('collapsed');

    // 第三步：更新折叠按钮的SVG图标
    const btn = activePanel.querySelector('.collapse-btn svg');
    if (activePanel.classList.contains('collapsed')) {
        // 折叠状态：显示右箭头 →
        btn.innerHTML = '<polyline points="9 18 15 12 9 6"/>';
    } else {
        // 展开状态：显示左箭头 ←
        btn.innerHTML = '<polyline points="15 18 9 12 15 6"/>';
    }
}
```

### 右侧面板折叠逻辑（第8380-8389行）

```javascript
// 右侧面板折叠
function toggleRightPanel() {
    const panel = document.getElementById('rightPanel');
    panel.classList.toggle('collapsed');
    const btn = panel.querySelector('.collapse-btn svg');
    if (panel.classList.contains('collapsed')) {
        // 折叠状态：显示左箭头 ←
        btn.innerHTML = '<polyline points="15 18 9 12 15 6"/>';
    } else {
        // 展开状态：显示右箭头 →
        btn.innerHTML = '<polyline points="9 18 15 12 9 6"/>';
    }
}
```

### 动画效果CSS

#### 二级面板动画
```css
.secondary-panel {
    width: 420px;
    background: white;
    display: flex;
    flex-direction: column;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.secondary-panel.collapsed {
    width: 0;
    overflow: hidden;
}
```

**动画参数：**
- 持续时间：`0.3s`
- 缓动函数：`cubic-bezier(0.4, 0, 0.2, 1)`（Material Design标准缓动）
- 变化属性：`all`（宽度、溢出等）

#### 右侧面板动画
```css
.right-panel {
    width: 280px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 50;
    overflow: hidden;
    height: calc(100vh - 32px);
    max-height: calc(100vh - 32px);
}

.right-panel.collapsed {
    width: 60px;
}

.right-panel.collapsed .menu-content {
    opacity: 0;
    pointer-events: none;
}

.right-panel.collapsed .collapse-text,
.right-panel.collapsed .outline-panel {
    display: none;
}
```

**动画参数：**
- 持续时间：`0.3s`
- 缓动函数：`cubic-bezier(0.4, 0, 0.2, 1)`
- 折叠宽度：`60px`（保留图标显示空间）

### 折叠按钮样式

```css
.collapse-btn {
    width: 28px;
    height: 28px;
    border-radius: 10px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    color: #9ca3af;
}

.collapse-btn:hover {
    background: #f3f4f6;
    color: #6b7280;
}
```

---

## 5. 事件监听器

### 菜单项点击事件（第8392-8413行）

```javascript
document.querySelectorAll('.primary-menu .menu-item').forEach(item => {
    item.addEventListener('click', function() {
        // 处理菜单项点击
        document.querySelectorAll('.primary-menu .menu-item').forEach(i =>
            i.classList.remove('active')
        );
        this.classList.add('active');
        const panelType = this.getAttribute('data-panel');
        // ... 调用 switchToPanel()
    });
});
```

**事件类型：** `click`
**触发元素：** `.primary-menu .menu-item`
**处理流程：**
1. 移除所有菜单项的 `active` 类
2. 为当前菜单项添加 `active` 类
3. 获取 `data-panel` 属性
4. 调用 `switchToPanel(panelType)`

### 折叠按钮点击事件

#### 二级面板折叠按钮
```html
<button class="collapse-btn" onclick="toggleSecondaryPanel()">
    <svg><!-- 箭头图标 --></svg>
</button>
```

**事件类型：** `onclick`（内联事件处理）
**处理函数：** `toggleSecondaryPanel()`

#### 右侧面板折叠按钮
```html
<button class="collapse-btn" onclick="toggleRightPanel()">
    <svg><!-- 箭头图标 --></svg>
</button>
```

**事件类型：** `onclick`（内联事件处理）
**处理函数：** `toggleRightPanel()`

---

## 6. 相关辅助函数

### restoreNormalView()
- **作用**：恢复正常视图（隐藏工具配置视图，显示工具列表视图）
- **调用时机**：每次切换面板时

### switchToWebView(viewType)
- **作用**：切换Web视图（列表视图或详情视图）
- **调用时机**：切换到Web面板时

---

## 7. React实现建议

### 状态管理
```typescript
interface PanelState {
    activePanel: 'ai' | 'pages' | 'tools' | 'apps' | 'web' | 'resources';
    secondaryPanelCollapsed: boolean;
    rightPanelCollapsed: boolean;
}
```

### 核心Hook
```typescript
const [panelState, setPanelState] = useState<PanelState>({
    activePanel: 'ai',
    secondaryPanelCollapsed: false,
    rightPanelCollapsed: false,
});

const switchToPanel = (panelType: string) => {
    setPanelState(prev => ({
        ...prev,
        activePanel: panelType,
        secondaryPanelCollapsed: false,
    }));
};

const toggleSecondaryPanel = () => {
    setPanelState(prev => ({
        ...prev,
        secondaryPanelCollapsed: !prev.secondaryPanelCollapsed,
    }));
};

const toggleRightPanel = () => {
    setPanelState(prev => ({
        ...prev,
        rightPanelCollapsed: !prev.rightPanelCollapsed,
    }));
};
```

### 类名绑定
```typescript
const getSecondaryPanelClass = () => {
    const classes = ['secondary-panel'];
    if (panelState.secondaryPanelCollapsed) classes.push('collapsed');
    if (panelState.activePanel !== 'ai') classes.push('hidden');
    return classes.join(' ');
};
```

---

## 8. 关键CSS过渡参数

| 属性 | 值 | 说明 |
|------|-----|------|
| 过渡时间 | `0.3s` | 面板折叠/展开 |
| 过渡时间 | `0.2s` | 菜单项、按钮 |
| 缓动函数 | `cubic-bezier(0.4, 0, 0.2, 1)` | Material Design标准 |
| 过渡属性 | `all` | 所有可动画属性 |

---

## 9. 完整交互流程图

```
用户点击菜单项
    ↓
触发 click 事件监听器
    ↓
移除所有菜单项的 active 类
    ↓
为当前菜单项添加 active 类
    ↓
获取 data-panel 属性值
    ↓
调用 switchToPanel(panelType)
    ↓
移除所有面板的 collapsed 和 hidden 类
    ↓
根据 panelType 隐藏其他面板
    ↓
为目标面板移除 hidden 类（显示）
    ↓
执行特殊逻辑（如 restoreNormalView()）
    ↓
CSS 过渡动画（0.3s）
    ↓
面板显示完成
```

---

## 10. 文件位置参考

| 内容 | 行号范围 |
|------|---------|
| 菜单项CSS | 165-232 |
| 二级面板CSS | 235-250 |
| 右侧面板CSS | 1710-1734 |
| switchToPanel() | 8282-8342 |
| toggleSecondaryPanel() | 8345-8377 |
| toggleRightPanel() | 8380-8389 |
| 菜单项事件监听 | 8392-8413 |
| 菜单项HTML | 4577-4616 |

