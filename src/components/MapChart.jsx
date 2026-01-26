import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import axios from 'axios';

// 1. 映射字典
const PROVINCE_MAP = {
  '河北省': 'hebei', '山西省': 'shanxi', '辽宁省': 'liaoning', '吉林省': 'jilin', '黑龙江省': 'heilongjiang',
  '江苏省': 'jiangsu', '浙江省': 'zhejiang', '安徽省': 'anhui', '福建省': 'fujian', '江西省': 'jiangxi',
  '山东省': 'shandong', '河南省': 'henan', '湖北省': 'hubei', '湖南省': 'hunan', '广东省': 'guangdong',
  '海南省': 'hainan', '四川省': 'sichuan', '贵州省': 'guizhou', '云南省': 'yunnan', '陕西省': 'shaanxi',
  '甘肃省': 'gansu', '青海省': 'qinghai', '台湾省': 'taiwan', '北京市': 'beijing', '天津市': 'tianjin',
  '上海市': 'shanghai', '重庆市': 'chongqing', '内蒙古自治区': 'neimenggu', '广西壮族自治区': 'guangxi',
  '西藏自治区': 'xizang', '宁夏回族自治区': 'ningxia', '新疆维吾尔自治区': 'xinjiang',
  '香港特别行政区': 'xianggang', '澳门特别行政区': 'aomen'
};

// 2. 坐标字典
const PROVINCE_CENTER = {
  '河北省': [114.502461, 38.045474], '山西省': [112.549248, 37.857014], '辽宁省': [123.429096, 41.796767],
  '吉林省': [125.3245, 43.886841], '黑龙江省': [126.642464, 45.756967], '江苏省': [118.767413, 32.041544],
  '浙江省': [120.153576, 30.287459], '安徽省': [117.283042, 31.86119], '福建省': [119.306239, 26.075302],
  '江西省': [115.892151, 28.676493], '山东省': [117.000923, 36.675807], '河南省': [113.665412, 34.757975],
  '湖北省': [114.298572, 30.584355], '湖南省': [112.982279, 28.19409], '广东省': [113.280637, 23.125178],
  '海南省': [110.33119, 20.031971], '四川省': [104.065735, 30.659462], '贵州省': [106.713478, 26.578343],
  '云南省': [102.712251, 25.040609], '陕西省': [108.948024, 34.263161], '甘肃省': [103.823557, 36.058039],
  '青海省': [101.778916, 36.623178], '台湾省': [121.509062, 25.044332], '北京市': [116.405285, 39.904989],
  '天津市': [117.190182, 39.125596], '上海市': [121.472644, 31.231706], '重庆市': [106.504962, 29.533155],
  '内蒙古自治区': [111.670801, 40.818311], '广西壮族自治区': [108.320004, 22.82402],
  '西藏自治区': [91.132212, 29.660361], '宁夏回族自治区': [106.278179, 38.46637],
  '新疆维吾尔自治区': [87.617733, 43.792818], '香港特别行政区': [114.173355, 22.320048],
  '澳门特别行政区': [113.54909, 22.198951]
};

const MapChart = () => {
  const chartRef = useRef(null);
  const myChartRef = useRef(null);
  const [currentProvince, setCurrentProvince] = useState(null);

  useEffect(() => {
    if (myChartRef.current) myChartRef.current.dispose();
    myChartRef.current = echarts.init(chartRef.current);
    
    let isUnmounted = false;

    // 加载中国地图
    const initChinaMap = async () => {
      myChartRef.current.showLoading();
      try {
        const { data } = await axios.get('/maps/china.json');
        if (isUnmounted) return;
        
        echarts.registerMap('china', data);
        myChartRef.current.hideLoading();
        
        myChartRef.current.setOption({
          title: { text: 'EchoMap - 山河志', left: 'center', top: 20, textStyle: { color: '#fff' } },
          backgroundColor: '#1a1a1a',
          tooltip: { trigger: 'item', formatter: '{b}' },
          geo: {
            map: 'china',
            roam: true,
            label: { show: true, color: 'rgba(255,255,255,0.5)', fontSize: 10 },
            itemStyle: { areaColor: '#323c48', borderColor: '#111' },
            emphasis: { itemStyle: { areaColor: '#2a333d' }, label: { show: false } },
            zoom: 1.2,
            center: null
          },
          series: []
        });
        
        setupEvents();
      } catch (error) {
        console.error('加载中国地图失败', error);
        if (!isUnmounted) myChartRef.current.hideLoading();
      }
    };

    const setupEvents = () => {
      myChartRef.current.on('click', async (params) => {
        // 【关键修改】不再检查 componentType，只要名字对，就跳转！
        const provinceName = params.name;
        
        // 1. 检查点击的是不是一个有效的省份
        if (provinceName && PROVINCE_MAP[provinceName]) {
          console.log(`检测到点击：${provinceName}，准备跳转...`);
          
          const pinyin = PROVINCE_MAP[provinceName];
          const center = PROVINCE_CENTER[provinceName];

          if (pinyin && center) {
            // 2. 立即清除旧的高亮 (Provide instant feedback)
            myChartRef.current.setOption({ series: [] }, { replaceMerge: ['series'] });

            // 3. 移动镜头 (Fly to center)
            myChartRef.current.setOption({
              geo: {
                center: center, // 使用硬编码坐标
                zoom: 5,
                animationDurationUpdate: 1000,
                animationEasingUpdate: 'cubicInOut'
              }
            });

            // 4. 加载新数据
            try {
              if (!echarts.getMap(pinyin)) {
                const { data } = await axios.get(`/maps/${pinyin}.json`);
                if (isUnmounted) return;
                echarts.registerMap(pinyin, data);
              }
              
              if (isUnmounted) return;
              setCurrentProvince(pinyin);

              // 5. 贴上新地图
              myChartRef.current.setOption({
                series: [{
                  type: 'map',
                  map: pinyin,
                  geoIndex: 0,
                  itemStyle: {
                    areaColor: '#c23531',
                    borderColor: '#fff',
                    borderWidth: 1
                  },
                  label: { show: true, color: '#fff', fontSize: 12 },
                  emphasis: { itemStyle: { areaColor: '#ff5722' } },
                  data: []
                }]
              }, { replaceMerge: ['series'] });

            } catch (error) {
              console.error(`无法加载 ${pinyin}`, error);
            }
          }
        } else {
          console.log('点击无效区域或未配置省份');
        }
      });
    };

    const handleResize = () => myChartRef.current?.resize();
    window.addEventListener('resize', handleResize);

    initChinaMap();

    return () => {
      isUnmounted = true;
      window.removeEventListener('resize', handleResize);
      if (myChartRef.current) {
        myChartRef.current.dispose();
        myChartRef.current = null;
      }
    };
  }, []);

  const handleBack = () => {
    setCurrentProvince(null);
    if (myChartRef.current) {
      myChartRef.current.setOption({
        geo: {
          center: null, // 恢复默认中心
          zoom: 1.2,    // 恢复默认缩放
          animationDurationUpdate: 1000
        },
        series: []
      }, { replaceMerge: ['series'] });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {currentProvince && (
        <button 
          onClick={handleBack}
          style={{
            position: 'absolute', top: '20px', left: '20px', zIndex: 10,
            padding: '8px 16px', background: '#fff', color: '#333', 
            border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
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