import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import axios from 'axios';

const MapChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // 定义一个变量来持有当前创建的实例
    let myChart;

    const initMap = async () => {
      // 初始化，并将实例赋值给 myChart
      myChart = echarts.init(chartRef.current);
      myChart.showLoading();

      try {
        const { data } = await axios.get('/maps/china.json');
        echarts.registerMap('china', data);
        myChart.hideLoading();

        const option = {
          title: { 
            text: 'EchoMap - 山河志', 
            left: 'center', 
            top: 20,
            textStyle: { color: '#fff' } 
          },
          backgroundColor: '#1a1a1a',
          tooltip: { trigger: 'item', formatter: '{b}' },
          geo: {
            map: 'china',
            roam: true,
            label: { show: true, color: 'rgba(255,255,255,0.7)', fontSize: 10 },
            itemStyle: { areaColor: '#323c48', borderColor: '#111' },
            emphasis: { itemStyle: { areaColor: '#c23531' } }
          }
        };

        myChart.setOption(option);
      } catch (error) {
        console.error('地图加载失败:', error);
        myChart.hideLoading();
      }
    };

    initMap();

    const resizeChart = () => {
      myChart?.resize();
    }
    window.addEventListener('resize', resizeChart);

    // 【最终修正】组件销毁时的清理逻辑
    return () => {
      window.removeEventListener('resize', resizeChart);
      // 销毁当前作用域内的实例
      myChart?.dispose();
    };
  }, []); // 空依赖数组，确保只在初始渲染时运行

  return <div ref={chartRef} style={{ width: '100%', height: '100vh' }} />;
};

export default MapChart;