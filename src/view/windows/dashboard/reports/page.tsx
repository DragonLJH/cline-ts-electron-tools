import React from 'react';
import { Link } from 'react-router-dom';

const Reports: React.FC = () => {
    return (
        <div className="reports-content">
            <h3>📋 报告</h3>
            <p>窗口管理系统的生成报告</p>

            <div className="reports-list">
                <div className="report-item">
                    <h4>📊 使用报告</h4>
                    <p>包含了所有的窗口操作详细记录和统计信息。</p>
                    <div className="report-meta">
                        <span>📅 生成时间: {new Date().toLocaleDateString()}</span>
                        <span>📈 数据条数: 27 条</span>
                    </div>
                </div>

                <div className="report-item">
                    <h4>🖼️ 窗口性能报告</h4>
                    <p>窗口创建和关闭的时间统计，以及性能分析。</p>
                    <div className="report-meta">
                        <span>📅 生成时间: {new Date().toLocaleDateString()}</span>
                        <span>⚡ 平均响应时间: 150ms</span>
                    </div>
                </div>

                <div className="report-item">
                    <h4>📋 系统健康报告</h4>
                    <p>应用程序的内存使用和系统资源消耗情况。</p>
                    <div className="report-meta">
                        <span>📅 生成时间: {new Date().toLocaleDateString()}</span>
                        <span>💾 内存使用: 42MB</span>
                    </div>
                </div>

                <div className="report-item">
                    <h4>🔍 错误日志报告</h4>
                    <p>系统运行期间的所有错误和警告信息。</p>
                    <div className="report-meta">
                        <span>📅 生成时间: {new Date().toLocaleDateString()}</span>
                        <span>⚠️ 错误数量: 0 条</span>
                    </div>
                </div>
            </div>

            <div className="report-actions">
                <button className="export-btn">📤 导出报告</button>
                <button className="download-btn">⬇️ 下载报告</button>
            </div>

            <div className="navigation">
                <Link to=".." className="btn btn-secondary">← 返回仪表盘</Link>
                <Link to="../analytics" className="btn btn-primary">查看数据分析 📈</Link>
            </div>
        </div>
    );
};

export default Reports;
