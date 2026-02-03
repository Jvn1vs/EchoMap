import React, { useEffect, useState } from 'react';
import { Rate } from 'antd';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const defaultForm = {
  visitedAt: '',
  rating: 0,
  tags: '',
  notes: '',
  files: [],
};

const primaryTags = [
  '美食',
  '小吃',
  '自驾',
  '徒步',
  '露营',
  'city walk',
  '打卡',
  '地标',
  '民俗',
  '人文历史',
  '摄影',
  '自然风光',
  '山川',
  '海岛',
  '江河湖泊',
  '森林',
  '草原',
  '夜景',
  '购物',
  '温泉',
  '滑雪',
  '演出',
  '赛事',
  '博物馆',
  '公园',
  '动物园',
  '植物园',
  
];


const FootprintDrawer = ({ open, city, onClose }) => {
  const [form, setForm] = useState(defaultForm);
  const [saveState, setSaveState] = useState({ loading: false, error: '', success: false });
  const [hoverRating, setHoverRating] = useState(null);
  const displayRating = (Number.isFinite(hoverRating) ? hoverRating : (form.rating || 0)).toFixed(1);

  useEffect(() => {
    if (!open) return;
    setForm(defaultForm);
    setSaveState({ loading: false, error: '', success: false });
  }, [open]);

  const handleGenerateNotes = () => {
    if (!city) return;
    const dateText = form.visitedAt ? `，时间是 ${form.visitedAt}` : '';
    setForm((prev) => ({
      ...prev,
      notes: `我在${city}留下了旅行足迹${dateText}。这次旅程有很多值得回味的细节。`,
    }));
  };

  const clearTags = () => {
    setForm((prev) => ({ ...prev, tags: '' }));
  };

  const clearNotes = () => {
    setForm((prev) => ({ ...prev, notes: '' }));
  };

  const toggleTag = (tag) => {
    setForm((prev) => {
      const nextTags = prev.tags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      const formatted = tag.startsWith('#') ? tag : `#${tag}`;
      const exists = nextTags.includes(formatted);
      const updated = exists
        ? nextTags.filter((item) => item !== formatted)
        : [...nextTags, formatted];
      return { ...prev, tags: updated.join(', ') };
    });
  };

  const isTagSelected = (tag) => {
    const formatted = tag.startsWith('#') ? tag : `#${tag}`;
    return form.tags
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .includes(formatted);
  };

  const handleFileChange = (event) => {
    const nextFiles = Array.from(event.target.files || []);
    setForm((prev) => ({ ...prev, files: nextFiles }));
  };

  const uploadFiles = async (uploadItems) => {
    if (!uploadItems.length) return [];
    const urls = [];
    for (let i = 0; i < uploadItems.length; i += 1) {
      const file = uploadItems[i];
      const safeName = file.name.replace(/\s+/g, '_');
      const path = `footprints/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from('travel-assets')
        .upload(path, file);
      if (uploadError) {
        throw uploadError;
      }
      const { data } = supabase.storage.from('travel-assets').getPublicUrl(path);
      if (data?.publicUrl) {
        urls.push(data.publicUrl);
      }
    }
    return urls;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!city) return;
    if (!isSupabaseConfigured || !supabase) {
      setSaveState({ loading: false, error: '请先配置 Supabase 环境变量', success: false });
      return;
    }
    setSaveState({ loading: true, error: '', success: false });
    try {
      const mediaUrls = await uploadFiles(form.files);
      const tagList = form.tags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      const payload = {
        region_name: city,
        visited_at: form.visitedAt || null,
        rating: Number.isFinite(form.rating) ? form.rating : 0,
        tags: tagList.length ? tagList : null,
        notes: form.notes || null,
        media_urls: mediaUrls.length ? mediaUrls : null,
      };
      const { error } = await supabase.from('footprints').insert(payload);
      if (error) throw error;
      setSaveState({ loading: false, error: '', success: true });
    } catch (err) {
      setSaveState({
        loading: false,
        error: err?.message || '保存失败，请重试',
        success: false,
      });
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 380,
        height: '100%',
        background: '#fff',
        boxShadow: '-8px 0 24px rgba(0,0,0,0.12)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 200ms ease',
        zIndex: 1001,
        padding: '20px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{city || '未选择城市'}</div>
        <button
          type="button"
          onClick={onClose}
          style={{
            border: 'none',
            background: '#f2f2f2',
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          关闭
        </button>
      </div>
      <div style={{ fontSize: 12, color: '#666' }}>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
          到访日期
          <input
            type="date"
            value={form.visitedAt}
            onChange={(event) => setForm((prev) => ({ ...prev, visitedAt: event.target.value }))}
            style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
          标签（逗号分隔）
          <div style={{ position: 'relative' }}>
            <textarea
              placeholder="例如：美食, 夜景"
              value={form.tags}
              onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
              rows={Math.max(1, Math.ceil(form.tags.length / 39))}
              style={{
                padding: '8px 30px 8px 10px',
                borderRadius: 6,
                border: '1px solid #ddd',
                color: '#5b84d6',
                fontStyle: 'italic',
                fontSize: 12,
                resize: 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={clearTags}
              title="清空标签"
              style={{
                position: 'absolute',
                right: 8,
                bottom: 8,
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: '1px solid #ccc',
                background: '#f6f6f6',
                color: '#999',
                cursor: 'pointer',
                lineHeight: '14px',
                textAlign: 'center',
                padding: 0,
              }}
            >
              ×
            </button>
          </div>
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {primaryTags.map((tag) => {
            const active = isTagSelected(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 999,
                  border: active ? '1px solid #409EFF' : '1px solid #ccc',
                  background: active ? 'rgba(64,158,255,0.12)' : '#fafafa',
                  color: active ? '#1f5fbf' : '#333',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>
        {/* 修改点：将 <label> 换成了 <div>，彻底解决自动触发按钮的问题 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
          <span>评分（0–5）</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="rating-krajee">
              <Rate
                allowHalf
                allowClear={false} // 保持你的原始逻辑
                value={form.rating || 0}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    rating: value || 0,
                  }))
                }
                onHoverChange={(value) => setHoverRating(value)}
                character="★"
              />
            </div>

            <div
              style={{
                width: 46,
                textAlign: 'right',
                fontSize: 12,
                color: '#666',
              }}
            >
              {displayRating}
            </div>

            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  rating: 0,
                }))
              }
              style={{
                border: 'none',
                background: '#f2f2f2',
                borderRadius: 6,
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: 12,
                color: '#666',
              }}
            >
              清除
            </button>
          </div>
        </div>
        {/* <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
          评分（0–5）
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="rating-krajee">
              <Rate
                allowHalf
                allowClear={false}
                value={form.rating}
                onChange={(value) => setForm((prev) => ({ ...prev, rating: value }))}
                onHoverChange={(value) => setHoverRating(value)}
                character="★"
              />
            </div>

            <div
              style={{
                width: 46,
                textAlign: 'right',
                fontSize: 12,
                color: '#666',
              }}
            >
              {(
                Number.isFinite(hoverRating)
                  ? hoverRating
                  : form.rating
              ).toFixed(1)}
            </div>

            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  rating: 0,
                }))
              }
              style={{
                border: 'none',
                background: '#f2f2f2',
                borderRadius: 6,
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: 12,
                color: '#666',
              }}
            >
              清除
            </button>
          </div>
        </label> */}

        {/* <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
          评分（0-5）
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="rating-krajee">
              <Rate
                allowHalf
                allowClear={false}
                // value={Number.isFinite(form.rating) ? form.rating : 0}
                value={Number(form.rating) || 0}
                onChange={(value) => setForm((prev) => ({ ...prev, rating: value }))}
                onHoverChange={(value) => setHoverRating(value)}
                character="★"
              />
            </div>
            <div style={{ width: 46, textAlign: 'right', fontSize: 12, color: '#666' }}>
               
              {(Number(hoverRating) || Number(form.rating) || 0).toFixed(1)}

            </div>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, rating: 0 }))}
              style={{
                border: 'none',
                background: '#f2f2f2',
                borderRadius: 6,
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: 12,
                color: '#666',
              }}
            >
              清除
            </button>
          </div>
        </label> */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
          游记/备注
          <div style={{ position: 'relative' }}>
            <textarea
              rows={5}
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              placeholder="记录你的旅途故事..."
              style={{
                padding: '8px 30px 8px 10px',
                borderRadius: 6,
                border: '1px solid #ddd',
                width: '100%',
                boxSizing: 'border-box',
                color: '#111',
                fontSize: 13,
                fontStyle: 'normal',
                resize: 'none',
              }}
            />
            <button
              type="button"
              onClick={clearNotes}
              title="清空备注"
              style={{
                position: 'absolute',
                right: 8,
                bottom: 8,
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: '1px solid #ccc',
                background: '#f6f6f6',
                color: '#999',
                cursor: 'pointer',
                lineHeight: '14px',
                textAlign: 'center',
                padding: 0,
              }}
            >
              ×
            </button>
          </div>
        </label>
        <button
          type="button"
          onClick={handleGenerateNotes}
          style={{
            alignSelf: 'flex-start',
            padding: '2px 5px',
            fontSize: 14,
            borderRadius: 6,
            border: '1px solid #ccc',
            background: '#fafafa',
            cursor: 'pointer',
          }}
        >
          生成旅游文案（占位）
        </button>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
          上传照片/音频
          <input type="file" multiple accept="image/*,audio/*" onChange={handleFileChange} />
        </label>
        {saveState.error && <div style={{ color: '#d93025', fontSize: 12 }}>{saveState.error}</div>}
        {saveState.success && (
          <div style={{ color: '#1a7f37', fontSize: 12 }}>已保存到云端</div>
        )}
        <button
          type="submit"
          disabled={saveState.loading}
          style={{
            padding: '10px 12px',
            background: '#409EFF',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: saveState.loading ? 'not-allowed' : 'pointer',
            opacity: saveState.loading ? 0.7 : 1,
          }}
        >
          {saveState.loading ? '保存中...' : '保存足迹'}
        </button>
        {!isSupabaseConfigured && (
          <div style={{ fontSize: 12, color: '#666' }}>
            请在本地 `.env` 中配置 Supabase 环境变量。
          </div>
        )}
      </form>
    </div>
  );
};

export default FootprintDrawer;
