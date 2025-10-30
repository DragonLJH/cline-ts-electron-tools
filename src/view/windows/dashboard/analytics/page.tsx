import React from 'react';
import { Link } from 'react-router-dom';

const Analytics: React.FC = () => {
    return (
        <div className="analytics-content">
            <h3>📈 数据分析</h3>
            <p>这里显示窗口管理的详细分析数据</p>

            <div className="analytics-cards">
                <div className="analytics-card">
                    <h4>窗口创建趋势</h4>
                    <div className="chart-placeholder">
                        <p>📊 这里会显示图表</p>
                        <p>📈 数据分析功能</p>
                    </div>
                </div>

                <div className="analytics-card">
                    <h4>使用统计</h4>
                    <div className="stats">
                        <div className="stat-item">
                            <span className="stat-value">27</span>
                            <span className="stat-label">总操作数</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">3</span>
                            <span className="stat-label">当前窗口</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">85%</span>
                            <span className="stat-label">成功率</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="navigation">
                <Link to=".." className="btn btn-secondary">← 返回仪表盘</Link>
                <Link to="../reports" className="btn btn-primary">查看报告 📋</Link>
            </div>
        </div>
    );
};

export default Analytics;
