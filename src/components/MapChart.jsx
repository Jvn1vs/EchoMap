import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import axios from 'axios';

// 1. 定义映射字典：中文名 -> 文件名 (拼音)
// 暂时只加了四川，后续你下载了其他省份，就在这里补充
const PROVINCE_MAP = {
  '四川省': 'sichuan',
  '北京市': 'beijing',
  '广东省': 'guangdong',
  '河南省': 'henan'
  // ... 继续添加
};

const MapChart = () => {
  const chartRef = useRef(null);
  const myChartRef = useRef(null); // 用于持久化 echarts 实例
  
  // 2. 状态管理：当前地图名称，默认为 'china'
  const [mapName, setMapName] = useState('china');

  useEffect(() => {
    // 初始化 ECharts 实例（如果还没初始化）
    if (!myChartRef.current) {
      myChartRef.current = echarts.init(chartRef.current);
      
      // 绑定点击事件 (核心逻辑)
      myChartRef.current.on('click', (params) => {
        const name = params.name; // 获取点击的区域名，例如 "四川省"
        const pinyin = PROVINCE_MAP[name]; // 查找对应的拼音

        // 如果存在对应的地图文件，且当前不是该地图，则切换
        if (pinyin) {
          setMapName(pinyin);
        } else {
          console.log(`未找到 ${name} 的地图文件，请先下载并配置 PROVINCE_MAP`);
        }
      });
      
      // 绑定窗口大小调整
      const resizeChart = () => myChartRef.current?.resize();
      window.addEventListener('resize', resizeChart);
    }

    // 加载地图数据并渲染
    const renderMap = async () => {
      myChartRef.current.showLoading();
      
      try {
        // 根据 mapName 动态请求 json 文件
        const { data } = await axios.get(`/maps/${mapName}.json`);
        
        // 注册地图，名字就叫当前的 mapName
        echarts.registerMap(mapName, data);
        
        const option = {
          title: { 
            text: mapName === 'china' ? 'EchoMap - 山河志' : `EchoMap - ${mapName}`, 
            left: 'center', 
            top: 20,
            textStyle: { color: '#fff' } 
          },
          backgroundColor: '#1a1a1a',
          tooltip: { trigger: 'item', formatter: '{b}' },
          geo: {
            map: mapName, // 这里动态引用注册的地图名
            roam: true,
            label: { show: true, color: 'rgba(255,255,255,0.7)', fontSize: 10 },
            itemStyle: { areaColor: '#323c48', borderColor: '#111' },
            emphasis: { itemStyle: { areaColor: '#c23531' } } // 鼠标悬停颜色
          }
        };

        myChartRef.current.hideLoading();
        myChartRef.current.setOption(option);
      } catch (error) {
        console.error(`加载地图 ${mapName} 失败:`, error);
        myChartRef.current.hideLoading();
        // 如果加载省份失败（比如文件不存在），可以考虑自动切回 china
        // setMapName('china'); 
      }
    };

    renderMap();

    // 清理函数：只在组件卸载时执行
    return () => {
      // 注意：这里我们不销毁实例，因为 mapName 变化会触发 useEffect，
      // 我们希望复用实例。只有当组件彻底销毁时（比如路由跳转）才 dispose。
      // 但为了配合 React StrictMode，这里可以保留 resize 的移除。
    };

  }, [mapName]); // 依赖 mapName，当它变化时重新加载数据

  // 组件卸载时的最终清理
  useEffect(() => {
    return () => {
      window.removeEventListener('resize', () => myChartRef.current?.resize());
      myChartRef.current?.dispose();
      myChartRef.current = null;
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* 3. 返回按钮：只有在非 china 地图时显示 */}
      {mapName !== 'china' && (
        <button 
          onClick={() => setMapName('china')}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 10,
            padding: '8px 16px',
            background: '#c23531',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ⬅ 返回全国
        </button>
      )}
      
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapChart;