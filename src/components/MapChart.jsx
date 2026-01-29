import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import axios from 'axios';

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

const MapChart = () => {
  const chartRef = useRef(null);
  const currProvinceRef = useRef(null);
  const [isDrilledDown, setIsDrilledDown] = useState(false);

  useEffect(() => {
    const chartDom = document.getElementById('main');
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);
    chartRef.current = myChart;

    // 初始化全国地图
    const initChinaMap = async () => {
      const res = await axios.get('/maps/china.json');
      echarts.registerMap('china', res.data);

      myChart.setOption({
        backgroundColor: '#f7f7f7',
        title: {
          text: 'EchoMap 足迹地图',
          subtext: '点击省份查看详情',
          left: 'center',
          top: 20
        },
        tooltip: { trigger: 'item' },
        geo: {
          map: 'china',
          roam: true,
          center: null,      // ✅ 初始化就重置
          zoom: 1.2,
          label: { show: true },
          itemStyle: {
            areaColor: '#eee',
            borderColor: '#999'
          },
          emphasis: {
            itemStyle: { areaColor: '#ccc' }
          }
        },
        series: []
      });
    };

    // 点击下钻
    myChart.on('click', async (params) => {
      const clickName = params.name;
      const fileName = PROVINCE_MAP[clickName];

      if (!fileName) return;
      if (currProvinceRef.current === clickName) return;

      const mapRes = await axios.get(`/maps/${fileName}.json`);
      echarts.registerMap(fileName, mapRes.data);

      currProvinceRef.current = clickName;
      setIsDrilledDown(true);

      myChart.setOption({
        geo: {
          map: fileName,
          roam: true,
          center: null,   // ✅ 关键：清空 roam 偏移
          zoom: 1,        // ✅ 关键：清空缩放继承
          label: {
            show: true,
            color: '#333',
            fontSize: 12
          },
          itemStyle: {
            areaColor: '#fff',
            borderColor: '#409EFF',
            borderWidth: 1.5
          },
          emphasis: {
            itemStyle: { areaColor: '#66b1ff' },
            label: { color: '#fff' }
          }
        },
        series: []
      });
    });

    const resize = () => myChart.resize();
    window.addEventListener('resize', resize);

    initChinaMap();

    return () => {
      window.removeEventListener('resize', resize);
      myChart.dispose();
    };
  }, []);

  // 返回全国
  const handleBack = () => {
    const myChart = chartRef.current;
    if (!myChart) return;

    currProvinceRef.current = null;
    setIsDrilledDown(false);

    myChart.setOption({
      geo: {
        map: 'china',
        roam: true,
        center: null,   // ✅ 重置
        zoom: 1.2,
        label: { show: true },
        itemStyle: { areaColor: '#eee' }
      },
      series: []
    });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {isDrilledDown && (
        <button
          onClick={handleBack}
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 1000,
            padding: '8px 16px',
            background: '#409EFF',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          ← 返回全国
        </button>
      )}
      <div id="main" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapChart;