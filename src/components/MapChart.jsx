import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import axios from 'axios';

// 1. 省份名称 -> 地图文件名映射
const PROVINCE_MAP = {
  '北京市': 'beijing', '天津市': 'tianjin', '上海市': 'shanghai', '重庆市': 'chongqing',
  '河北省': 'hebei', '山西省': 'shanxi', '辽宁省': 'liaoning', '吉林省': 'jilin', '黑龙江省': 'heilongjiang',
  '江苏省': 'jiangsu', '浙江省': 'zhejiang', '安徽省': 'anhui', '福建省': 'fujian', '江西省': 'jiangxi',
  '山东省': 'shandong', '河南省': 'henan', '湖北省': 'hubei', '湖南省': 'hunan', '广东省': 'guangdong',
  '海南省': 'hainan', '四川省': 'sichuan', '贵州省': 'guizhou', '云南省': 'yunnan', '陕西省': 'shaanxi',
  '甘肃省': 'gansu', '青海省': 'qinghai', '台湾省': 'taiwan',
  '内蒙古自治区': 'neimenggu', '广西壮族自治区': 'guangxi', '西藏自治区': 'xizang',
  '宁夏回族自治区': 'ningxia', '新疆维吾尔自治区': 'xinjiang',
  '香港特别行政区': 'xianggang', '澳门特别行政区': 'aomen'
};

// 2. 省份名称 -> 中心点坐标 (硬编码确保绝对稳定)
const PROVINCE_CENTER = {
  '北京市': [116.40, 39.90], '天津市': [117.20, 39.12], '上海市': [121.47, 31.23], '重庆市': [107.50, 29.80], // 重庆视觉中心微调
  '河北省': [114.53, 38.04], '山西省': [112.56, 37.87], '辽宁省': [123.43, 41.80], '吉林省': [125.32, 43.90], '黑龙江省': [127.96, 46.50],
  '江苏省': [119.76, 33.00], '浙江省': [120.15, 29.50], '安徽省': [117.29, 31.86], '福建省': [118.50, 26.30], '江西省': [115.81, 27.50],
  '山东省': [118.00, 36.40], '河南省': [113.62, 34.10], '湖北省': [112.80, 31.10], '湖南省': [111.70, 27.80], '广东省': [113.60, 23.80],
  '海南省': [109.84, 19.10], '四川省': [103.50, 30.20], '贵州省': [106.70, 26.80], '云南省': [101.50, 24.50], '陕西省': [109.00, 34.60],
  '甘肃省': [103.00, 37.00], '青海省': [97.00, 35.50], '台湾省': [121.00, 23.70],
  '内蒙古自治区': [114.00, 42.50], '广西壮族自治区': [108.50, 23.50], '西藏自治区': [88.00, 31.00],
  '宁夏回族自治区': [106.20, 37.30], '新疆维吾尔自治区': [85.00, 41.00],
  '香港特别行政区': [114.17, 22.32], '澳门特别行政区': [113.54, 22.19]
};

const MapChart = () => {
  const chartRef = useRef(null);
  const currProvinceRef = useRef(null); // 记录当前所在的省份
  const [isDrilledDown, setIsDrilledDown] = useState(false);

  useEffect(() => {
    const chartDom = document.getElementById('main');
    if (!chartDom) return;

    if (!chartRef.current) {
      chartRef.current = echarts.init(chartDom);
    }
    const myChart = chartRef.current;

    const initChinaMap = async () => {
      try {
        const res = await axios.get('/maps/china.json');
        echarts.registerMap('china', res.data);

        const option = {
          backgroundColor: '#f7f7f7',
          title: {
            text: 'EchoMap 足迹地图',
            subtext: '点击省份查看详情',
            left: 'center',
            top: 20,
            textStyle: { color: '#333', fontSize: 24 }
          },
          tooltip: {
            trigger: 'item',
            formatter: (params) => {
               // 如果是地级市，显示名字；如果是背景省份，也显示名字
               return params.name;
            }
          },
          // 底层中国地图 (Geo组件)
          geo: {
            map: 'china',
            roam: true,
            zoom: 1.2,
            label: { show: true, color: '#666', fontSize: 10 },
            itemStyle: {
              areaColor: '#eee',
              borderColor: '#999',
              borderWidth: 1
            },
            emphasis: {
              label: { show: true, color: '#000' },
              itemStyle: { areaColor: '#ccc' }
            },
            // 开启平滑过渡动画
            animationDurationUpdate: 1000,
            animationEasingUpdate: 'quinticInOut'
          },
          series: []
        };
        myChart.setOption(option);
      } catch (error) {
        console.error('加载中国地图失败:', error);
      }
    };

    // --- 核心点击交互逻辑 ---
    myChart.on('click', async (params) => {
      if (!params.name) return;

      const clickName = params.name;
      const fileName = PROVINCE_MAP[clickName];

      // 1. 如果点击的不是省份（比如点击了无数据的区域，或者点击了地级市），
      // 我们需要判断它是否是一个有效的“切换目标”。
      if (!fileName) {
        // 如果点击的是已经在显示的省份内部的地级市，则忽略（或者你以后可以做点击城市弹出详情）
        console.log('点击了非省份区域或详细城市:', clickName);
        return;
      }

      // 2. 如果点击的正是当前已经高亮显示的省份，不做重复加载，但可以微调镜头（可选）
      if (currProvinceRef.current === clickName) {
        console.log('已在当前省份:', clickName);
        return;
      }

      try {
        // 3. 加载新省份数据
        const mapRes = await axios.get(`/maps/${fileName}.json`);
        echarts.registerMap(fileName, mapRes.data);

        // 4. 更新状态
        currProvinceRef.current = clickName;
        setIsDrilledDown(true);

        // 5. 获取硬编码的中心点 (这是修复Bug的关键！)
        const targetCenter = PROVINCE_CENTER[clickName];
        if (!targetCenter) {
          console.warn('未找到该省份中心点坐标:', clickName);
          return;
        }

        // 6. 计算缩放比例
        let targetZoom = 10;
        if (['北京市', '天津市', '上海市', '香港', '澳门'].includes(clickName)) {
            targetZoom = 18;
        } else if (['新疆维吾尔自治区', '西藏自治区', '内蒙古自治区'].includes(clickName)) {
            targetZoom = 2.5;
        } else if (['青海省', '甘肃省', '黑龙江省'].includes(clickName)) {
            targetZoom = 3.5;
        }

        // 7. 触发动画和图层切换
        myChart.setOption({
          geo: {
            center: targetCenter, // 强制设置中心点
            zoom: targetZoom,     // 强制设置缩放
            label: { show: false }, // 隐藏底图文字
            itemStyle: {
              opacity: 0.3, 
              areaColor: '#ccc'
            }
          },
          series: [
            {
              type: 'map',
              map: fileName, // 切换到新地图
              geoIndex: 0,   // 绑定到底图
              label: {
                show: true,
                color: '#333',
                fontSize: 12
              },
              itemStyle: {
                areaColor: '#fff',
                borderColor: '#409EFF',
                borderWidth: 1.5,
                shadowColor: 'rgba(0, 0, 0, 0.2)',
                shadowBlur: 10
              },
              emphasis: {
                itemStyle: { areaColor: '#66b1ff' },
                label: { color: '#fff' }
              },
              data: [] // 此处可填入数据
            }
          ]
        }, { replaceMerge: ['series'] }); // 替换 series，确保旧的省份消失，新的出现

      } catch (error) {
        console.error(`无法加载 ${clickName}:`, error);
      }
    });

    const handleResize = () => myChart.resize();
    window.addEventListener('resize', handleResize);

    initChinaMap();

    return () => {
      window.removeEventListener('resize', handleResize);
      myChart.dispose();
      chartRef.current = null;
    };
  }, []);

  const handleBack = () => {
    const myChart = chartRef.current;
    if (!myChart) return;

    currProvinceRef.current = null;
    setIsDrilledDown(false);

    // 恢复全国视图
    myChart.setOption({
      geo: {
        center: null, // 恢复自动计算中心
        zoom: 1.2,    // 恢复默认缩放
        label: { show: true },
        itemStyle: {
          opacity: 1,
          areaColor: '#eee'
        }
      },
      series: [] // 清空详细层
    }, { replaceMerge: ['series'] });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {isDrilledDown && (
        <button
          onClick={handleBack}
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 999,
            padding: '10px 20px',
            backgroundColor: '#409EFF',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            boxShadow: '0 2px 12px 0 rgba(0,0,0,0.1)',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#66b1ff'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#409EFF'}
        >
          ← 返回全国视图
        </button>
      )}
      <div id="main" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapChart;