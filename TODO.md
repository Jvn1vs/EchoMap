# 🗺️ 足迹地图 (Footprints Map) 开发路线图

本项目旨在开发一个基于 Web 的足迹记录应用，支持点亮中国地图（精确到省/市），并记录旅游文本、图片与音频。

---

## 📅 第一阶段：前端地图基础 (MVP - Minimum Viable Product)
**目标**：搭建 React 环境，成功展示可交互的中国地图，实现省份下钻功能。

- [ ] **1.1 初始化项目**
    - 使用 Vite 创建 React 项目：`npm create vite@latest footprints-map -- --template react`
    - 安装核心依赖：`npm install echarts axios`
    - 清理默认样式 (`App.css`, `index.css`)，确保容器能全屏显示。

- [ ] **1.2 获取地图数据 (GeoJSON)**
    - 在 `public` 目录下新建 `maps` 文件夹。
    - 下载 `china.json` (全国地图数据) 放入该文件夹。
    - 下载各个省份的 JSON 数据 (如 `sichuan.json`, `beijing.json`) 放入该文件夹。
    - *资源提示*：可使用 [DataV](http://datav.aliyun.com/portal/school/atlas/area_selector) 或 GitHub 开源库。

- [ ] **1.3 开发地图组件**
    - 创建 `components/MapChart.jsx`。
    - 使用 `echarts.init` 初始化地图。
    - 使用 `axios` 请求 `china.json` 并注册地图。
    - 配置 ECharts `geo` 和 `series` 属性，使地图渲染出来。

- [ ] **1.4 实现地图交互 (下钻)**
    - 监听 ECharts `click` 事件。
    - 建立“省份中文名”到“文件名”的映射字典 (如 `'四川省': 'sichuan'`)。
    - 点击省份时，动态请求对应的 JSON 文件并重新渲染地图 (`setOption`)。
    - 添加“返回全国”按钮，点击后重置为 `china.json`。

---

## 🛠️ 第二阶段：后端与数据库接入 (Supabase)
**目标**：不再使用假数据，搭建云端数据库，实现数据的写入功能。

- [ ] **2.1 Supabase 环境配置**
    - 注册 Supabase 账号并创建一个新 Project。
    - 获取 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`。
    - 在 React 项目中安装 SDK：`npm install @supabase/supabase-js`。
    - 创建 `.env` 文件存储环境变量。

- [ ] **2.2 数据库设计**
    - 在 Supabase Dashboard -> SQL Editor 中运行建表语句：
      - 表 `footprints`: 包含 `id`, `region_name` (地区名), `content` (备注), `visited_at` (日期)。
    - 配置 RLS (Row Level Security) 策略，允许读写操作（初期可先设为 public 方便调试）。

- [ ] **2.3 开发录入功能**
    - 在 UI 上增加一个简单的表单（或弹窗）。
    - 包含输入框：地区名称（如“成都市”）、备注文本。
    - 编写函数 `addFootprint()`：调用 Supabase `.insert()` 方法将数据存入云端。

---

## 💡 第三阶段：点亮地图 (前后端联调)
**目标**：打开网页时，自动从数据库拉取数据，并将去过的地方高亮显示。

- [ ] **3.1 数据获取逻辑**
    - 在 `useEffect` 中编写 `fetchFootprints()` 函数。
    - 使用 Supabase `.select('*')` 获取所有足迹数据。

- [ ] **3.2 地图渲染逻辑更新**
    - 修改 ECharts 配置，使用 `visualMap` 或 `dataRange`。
    - 或者在 `series` 的 `data` 属性中，将从数据库取回的地区 value 设为 1，没去过的设为 0。
    - 配置样式：去过的地区显示红色/金色，没去过的显示灰色。

- [ ] **3.3 数据展示交互**
    - 实现点击已点亮区域时，弹出 Modal (模态框) 或 Tooltip。
    - 在弹窗中显示该地区的备注文本和旅游时间。

---

## 📷 第四阶段：多媒体存储 (Storage)
**目标**：支持上传旅游照片和音频，丰富足迹详情。

- [ ] **4.1 配置对象存储**
    - 在 Supabase Dashboard -> Storage 创建一个新的 Bucket (例如叫 `travel-assets`)。
    - 设置 Bucket 权限为 Public (公开可读)。

- [ ] **4.2 图片上传功能**
    - 在录入表单中添加 `<input type="file" />`。
    - 编写上传逻辑：使用 Supabase `.storage.from('travel-assets').upload(...)`。
    - 获取上传成功后的 Public URL。

- [ ] **4.3 数据库字段更新**
    - 修改数据库表结构，增加 `media_url` 字段 (Text 或 Array)。
    - 保存足迹时，将图片的 URL 一并存入数据库。
    - 前端展示时，在弹窗中通过 URL 渲染 `<img />` 和 `<audio />`。

---

## 🚀 第五阶段：部署上线 (CI/CD)
**目标**：将项目发布到公网，通过链接即可访问。

- [ ] **5.1 代码版本管理**
    - 确保所有代码已提交到 GitHub 仓库 (`git push`)。
    - 检查 `.env` 文件是否已加入 `.gitignore` (不要把密钥上传到 GitHub！)。

- [ ] **5.2 Vercel 部署**
    - 注册/登录 Vercel。
    - 点击 "Add New Project" -> "Import" 你的 GitHub 仓库。
    - **关键步骤**：在 Vercel 的 "Environment Variables" 设置中，填入你的 Supabase URL 和 Key。
    - 点击 Deploy。

- [ ] **5.3 验证**
    - 访问 Vercel 生成的域名。
    - 测试地图交互、数据录入、图片上传是否正常。
    - 发送给朋友炫耀！