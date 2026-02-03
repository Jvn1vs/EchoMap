# EchoMap 开发日志 - Day 1

## ��� 日期
2025年12月13日

##  今日完成任务 (Milestones Achieved)

我们从零开始，成功搭建并运行了 EchoMap 项目的最小可行性前端 (MVP)，为后续所有开发工作打下了坚实的基础。

### 1. ���️ 项目初始化与环境搭建
- **项目创建**: 使用 `npm create vite@latest . -- --template react` 命令在当前目录成功初始化了 Vite + React 项目框架。
- **依赖安装**:
    - 通过 `npm install` 安装了项目基础依赖。
    - 通过 `npm install echarts axios` 安装了核心的可视化库 ECharts 和数据请求库 Axios。
- **项目启动**: 成功运行 `npm run dev` 并通过 `http://localhost:5173` 访问到本地开发服务器。

### 2. ���️ 核心功能：地图可视化
- **静态资源管理**: 理解了 `public` 文件夹的作用，并成功创建 `public/maps` 目录用于存放地图数据。
- **数据集成**: 成功下载了 `china.json` 地图数据并放置到正确位置。
- **组件化开发**:
    - 创建了可复用的 `src/components/MapChart.jsx` 组件。
    - 在组件中使用 `useEffect` 和 `useRef` Hooks 来管理 ECharts 实例的生命周期。
    - 使用 `axios` 异步请求本地的 GeoJSON 数据。
- **页面渲染**:
    - 修改了主入口 `App.jsx` 以渲染地图组件。
    - 清理了 `index.css` 的默认样式，实现了地图的全屏展示。

### 3. ��� 调试与问题解决 (Troubleshooting)
- **依赖缺失问题**: 解决了因 `echarts` 未安装导致的 `Failed to resolve import` 错误。
- **React 严格模式问题**:
    - 遇到了由 React 严格模式 (`StrictMode`) 引起的 `useEffect` 重复执行，导致 ECharts 实例初始化和销毁的逻辑冲突。
    - 通过优化 `MapChart.jsx` 组件内的代码，确保 ECharts 实例在组件生命周期内被正确地创建和销毁，最终成功渲染出地图。

### 4. ��� 版本控制 (Version Control)
- **Git 初始化**: 使用 `git init` 成功将项目初始化为 Git 仓库。
- **.gitignore 配置**:
    - 理解了 `.gitignore` 文件的作用，用于忽略 `node_modules` 等不需要版本控制的文件。
    - 在 Vite 自动生成的基础上，补充了对 `.env` 环境变量文件的忽略规则。
- **首次提交 (Initial Commit)**:
    - 使用 `git add .` 将所有项目文件添加到暂存区。
    - 使用 `git commit -m "feat:  Initial commit with basic China map display"` 创建了项目的第一个版本快照，标志着“基础地图展示”功能开发完成。

## ��� 下一步计划 (Next Steps)
- **实现地图交互**：为地图添加点击事件，实现从全国地图“下钻”到省级地图的功能。
- **关联 GitHub 仓库**：在 GitHub 上创建远程仓库，并将本地代码推送到云端。

---

**今日总结**: 今天你不仅学会了如何从零启动一个现代前端项目，更重要的是，你亲身经历并解决了开发中最常见的三类问题：**环境配置、代码逻辑、版本管理**。这为你后续做任何项目都打下了极其宝贵的基础。为你今天的耐心和探索精神点赞！


# EchoMap 开发日志 - Day 2

## 日期
2026年1月26日

## 今日完成任务 (Milestones Achieved)

本日重点攻克了地图的核心交互逻辑，实现了从“全国”到“省份”的平滑切换，并完成了项目代码的云端备份。

### 1. 核心功能：地图下钻 (Map Drill-down)
- **动态数据加载**：
    - 重构了 `MapChart.jsx`，引入 `useState` 管理当前地图状态 (`mapName`)。
    - 实现了点击省份时，利用 Axios 动态请求对应的 JSON 地图文件。
- **交互逻辑**：
    - 建立了 `PROVINCE_MAP` 映射字典（如 `'河南省': 'henan'`），解决了中文地名与英文文件名之间的转换问题。
    - 实现了**双向导航**：点击省份下钻，点击左上角“返回全国”按钮复原。
- **数据准备**：
    - 掌握了从 DataV 获取 GeoJSON 数据的方法。
    - 成功添加了测试数据 `henan.json` 并跑通流程。

### 2. 版本控制与 GitHub 协作
- **远程仓库关联**：
    - 在 GitHub 上成功创建了 `EchoMap` 仓库。
    - 使用 `git remote add origin` 建立了本地与云端的连接。
- **规范化管理**：
    - 理解了 `git branch -M main` 的意义，将主分支重命名为社区标准的 `main`。
    - 理解了 `git push -u` 的作用，建立了本地分支与远程分支的追踪关系。
    - 遵循 Commit Message 规范，使用了 `feat:` 前缀提交新功能。

## 调试与问题解决 (Troubleshooting)

今天遇到的问题非常有代表性，解决过程加深了对代码和工具的理解：

### 1. 地图点击无反应（404 Error）
- **现象**：点击“河南省”后，URL 变为红色“返回”按钮出现，但地图依然显示中国全图。
- **原因**：代码中硬编码请求 `.json` 后缀的文件 (`/maps/${mapName}.json`)，但实际下载的文件名为 `henan.geojson`。虽然内容格式一样，但文件名不匹配导致请求失败。
- **解决**：将文件重命名为 `henan.json`，问题解决。
- **收获**：代码是字面义的，文件扩展名必须严格匹配。

### 2. Git 推送权限拒绝 (403 Permission Denied)
- **现象**：执行 `git push` 时报错 `Permission to ... denied to Sh1SaaN`。
- **原因**：Windows 凭据管理器中缓存了旧的 GitHub 账号 (`Sh1SaaN`)，导致 Git 使用了错误的身份去验证当前仓库 (`Jvn1vs`)。
- **解决**：进入 Windows“凭据管理器”，删除旧的 GitHub 凭据，重新触发登录验证。
- **收获**：Git 的身份验证机制依赖于本地系统的凭据存储。

## 新学到的概念 (Key Learnings)
- **feat**: Git 提交规范中代表“Feature”，用于标识新增功能。
- **upstream (-u)**: 设置上游分支，让本地分支“记住”它的远程对应分支，简化后续的 push/pull 操作。
- **GeoJSON vs JSON**: GeoJSON 是 JSON 的一种特定格式，本质上还是 JSON 文本，可以直接重命名使用。

## 下一步计划 (Next Steps)
- **后端接入**：注册 Supabase，创建云端数据库。
- **数据存储**：不再使用假数据，尝试将“足迹”信息写入数据库。

# EchoMap 开发日志 - Day 2 续

## 日期
2026年1月26日

##  今日完成任务 (Milestones Achieved)

本日完成了地图核心交互功能的开发，从基础的“点击下钻”进化为“丝滑的地图漫游体验”，并解决了多个复杂的技术难题。

### 1.  地图交互与可视化 (Advanced Map Interaction)
- **多层级渲染 (Overlay Technique)**：
    - 摒弃了简单的“切换地图”方案，采用 **Geo (背景层) + Series (高亮层)** 叠加的技术方案。
    - 实现了点击省份时，背景中国地图不消失，仅在对应位置叠加详细省份地图的效果。
- **智能镜头控制 (Smart Camera)**：
    - 解决了“点击边缘导致地图偏移”的问题。
    - 引入 `PROVINCE_CENTER` 坐标常量库，实现了点击省份任意位置，镜头都能精准飞向该省份几何中心的功能。
- **无缝切换 (Smooth Transition)**：
    - 优化了点击事件逻辑：点击新省份瞬间清除旧高亮 -> 镜头平滑移动 -> 异步加载新数据。
    - 解决了 ECharts 事件穿透问题，实现了省份之间的直接跳转，无需先返回全国。

# EchoMap 开发日志 - Day 3

## 日期
2026年1月30日

## 今日完成任务 (Milestones Achieved)

本次对话完成了全国地图省级数据的补齐，保证中国地图包含全部省份。

### 1. 地图数据完善
- **省份数据补齐**：将所有省级地图文件统一整理为英文命名并放入 `public/maps/`。
- **全国地图更新**：替换 `china.json` 为包含省级边界的版本，确保初始展示可见完整省级边界。

# EchoMap 开发日志 - Day 4

## 日期
2026年2月3日

## 今日完成任务 (Milestones Achieved)

本次完成了“足迹录入抽屉 + 云端存储接入”的阶段性搭建，并整理了可扩展的前端结构。

### 1. Supabase 前端接入
- **SDK 引入**：新增 `@supabase/supabase-js` 依赖，并封装 `src/lib/supabase.js` 统一读取环境变量。
- **环境变量模板**：新增 `.env.example` 作为本地配置模板（不提交真实密钥）。

### 2. 右侧抽屉与录入流程
- **抽屉组件拆分**：新增 `src/components/FootprintDrawer.jsx`，将表单与上传逻辑从地图组件中解耦。
- **城市点击录入**：在省内视角点击地级市后打开抽屉，可填写日期、标签、评分与备注。
- **多媒体上传**：支持图片与音频多文件上传到 Supabase Storage（Bucket: `travel-assets`）。
- **云端写入**：表单提交后写入 `footprints` 表，保存 `region_name`、`visited_at`、`rating`、`tags`、`notes`、`media_urls` 等字段。

### 3. 占位功能
- **文案生成占位**：提供“生成旅游文案（占位）”按钮，为后续接入真实文案 API 预留入口。

### 4. 抽屉交互与评分优化
- **标签体验增强**：新增一级标签快捷选择、标签输入框自动增高、清空按钮与样式优化。
- **评分展示**：评分区域改为 Ant Design Rate 组件，并对样式进行自定义调整。
- **备注与表单细化**：备注输入框样式统一、清空按钮尺寸优化。
