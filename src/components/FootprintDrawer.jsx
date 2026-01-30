import React, { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const defaultForm = {
  visitedAt: '',
  rating: '',
  tags: '',
  notes: '',
  files: [],
};

const FootprintDrawer = ({ open, city, onClose }) => {
  const [form, setForm] = useState(defaultForm);
  const [saveState, setSaveState] = useState({ loading: false, error: '', success: false });

  useEffect(() => {
    if (!open) return;
    setForm(defaultForm);
    setSaveState({ loading: false, error: '', success: false });
  }, [open, city]);

  const handleGenerateNotes = () => {
    if (!city) return;
    const dateText = form.visitedAt ? `，时间是 ${form.visitedAt}` : '';
    setForm((prev) => ({
      ...prev,
      notes: `我在${city}留下了旅行足迹${dateText}。这次旅程有很多值得回味的细节。`,
    }));
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
        rating: form.rating ? Number(form.rating) : null,
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
            padding: '6px 10px',
            cursor: 'pointer',
          }}
        >
          关闭
        </button>
      </div>
      <div style={{ fontSize: 12, color: '#666' }}>
        点击省内区域即可记录该地级市的旅行足迹。
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
          <input
            type="text"
            placeholder="例如：美食, 夜景"
            value={form.tags}
            onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
            style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
          评分（1-5）
          <input
            type="number"
            min="1"
            max="5"
            value={form.rating}
            onChange={(event) => setForm((prev) => ({ ...prev, rating: event.target.value }))}
            style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
          游记/备注
          <textarea
            rows={5}
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
            placeholder="记录你的旅途故事..."
            style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd' }}
          />
        </label>
        <button
          type="button"
          onClick={handleGenerateNotes}
          style={{
            alignSelf: 'flex-start',
            padding: '6px 10px',
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
