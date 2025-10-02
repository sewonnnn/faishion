import React from 'react';
import {
    LineChart, Line,
    BarChart, Bar,
    AreaChart, Area,
    PieChart, Pie,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ScatterChart, Scatter,
    Treemap,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend,
    ResponsiveContainer,
} from 'recharts';

// 대시보드에 사용할 종합 더미 데이터
const salesData = [
    { name: 'Jan', sales: 4000, revenue: 2400, uv: 2400 },
    { name: 'Feb', sales: 3000, revenue: 1398, uv: 2210 },
    { name: 'Mar', sales: 2000, revenue: 9800, uv: 2290 },
    { name: 'Apr', sales: 2780, revenue: 3908, uv: 2000 },
    { name: 'May', sales: 1890, revenue: 4800, uv: 2181 },
    { name: 'Jun', sales: 2390, revenue: 3800, uv: 2500 },
];

const trafficData = [
    { name: 'Search', value: 400 },
    { name: 'Direct', value: 300 },
    { name: 'Social', value: 300 },
    { name: 'Referral', value: 200 },
];

const teamData = [
    { subject: 'Marketing', A: 120, B: 110, fullMark: 150 },
    { subject: 'Sales', A: 98, B: 130, fullMark: 150 },
    { subject: 'Dev', A: 86, B: 130, fullMark: 150 },
    { subject: 'Support', A: 99, B: 100, fullMark: 150 },
    { subject: 'Finance', A: 85, B: 90, fullMark: 150 },
    { subject: 'HR', A: 65, B: 85, fullMark: 150 },
];

const scatterData = [
    { x: 100, y: 200, z: 200 },
    { x: 120, y: 100, z: 260 },
    { x: 170, y: 300, z: 400 },
    { x: 140, y: 250, z: 280 },
    { x: 150, y: 400, z: 500 },
    { x: 110, y: 280, z: 200 },
];

const treemapData = [
    {
        name: 'Products',
        children: [
            { name: 'Product A', size: 100 },
            { name: 'Product B', size: 80 },
            { name: 'Product C', size: 150 },
        ],
    },
    {
        name: 'Services',
        children: [
            { name: 'Service X', size: 90 },
            { name: 'Service Y', size: 120 },
        ],
    },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1977'];

// 스타일 정의
const style = {
    dashboard: {
        padding: '25px',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', // 320px 단위로 반응형 배치
        gap: '20px',
        marginTop: '20px',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
        padding: '20px',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
    },
    chartContainer: {
        flexGrow: 1,
        minHeight: '300px', // 차트의 최소 높이
    },
    chartTitle: {
        marginBottom: '15px',
        fontSize: '18px',
        fontWeight: '700',
        color: '#333',
        borderBottom: '2px solid #eee',
        paddingBottom: '10px',
    }
};

const SellerPage = () => {
    // Treemap 렌더링을 위한 커스텀 함수
    const CustomizedTreemapContent = (props) => {
        const { root, depth, x, y, width, height, index, name } = props;
        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                        fill: depth < 2 ? COLORS[index % COLORS.length] : '#fff',
                        stroke: '#fff',
                        strokeWidth: 2 / (depth + 1),
                        fillOpacity: depth === 1 ? 0.7 : 0,
                    }}
                />
                {
                    depth === 1 ?
                    <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={14} fontWeight="bold">
                        {name}
                    </text>
                    : null
                }
            </g>
        );
    };

    return (
            <div style={style.grid}>
                {/* 1. LineChart (선형 차트) - 시간 경과에 따른 변화 추이 */}
                <div style={style.card}>
                    <h2 style={style.chartTitle}>1. Sales & UV Trend (Line Chart)</h2>
                    <div style={style.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
                                <Legend />
                                <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} name="총 판매량" />
                                <Line type="monotone" dataKey="uv" stroke="#82ca9d" strokeWidth={2} name="순 방문자 (UV)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. BarChart (막대 차트) - 항목별 비교 (Stacked Bar) */}
                <div style={style.card}>
                    <h2 style={style.chartTitle}>2. Revenue Analysis (Stacked Bar Chart)</h2>
                    <div style={style.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenue" stackId="a" fill="#0088FE" name="Web 수익" />
                                <Bar dataKey="sales" stackId="a" fill="#00C49F" name="App 수익" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. AreaChart (면적 차트) - 누적량 및 변화 범위 */}
                <div style={style.card}>
                    <h2 style={style.chartTitle}>3. Cumulative Performance (Area Chart)</h2>
                    <div style={style.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="sales" stackId="1" stroke="#ffc658" fill="#ffc658" name="Total Sales" />
                                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#ff7300" fill="#ff7300" name="Total Revenue" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. PieChart (원형 차트) - 비중 분포 */}
                <div style={style.card}>
                    <h2 style={style.chartTitle}>4. Traffic Source Distribution (Pie Chart)</h2>
                    <div style={style.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={trafficData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {trafficData.map((entry, index) => (
                                        <Pie key={`cell-${index}`} dataKey="value" fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 5. RadarChart (레이더 차트) - 다차원 데이터 비교 */}
                <div style={style.card}>
                    <h2 style={style.chartTitle}>5. Team Performance (Radar Chart)</h2>
                    <div style={style.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius={90} width={730} height={250} data={teamData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} />
                                <Radar name="Team A" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                <Radar name="Team B" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                                <Legend />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 6. ScatterChart (산점도 차트) - 두 변수 간의 관계 */}
                <div style={style.card}>
                    <h2 style={style.chartTitle}>6. Customer Segmentation (Scatter Chart)</h2>
                    <div style={style.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid />
                                <XAxis type="number" dataKey="x" name="Frequency" unit="h" />
                                <YAxis type="number" dataKey="y" name="Monetary" unit="$" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Legend />
                                <Scatter name="RFM Data" data={scatterData} fill="#ff7300" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 7. Treemap (트리맵) - 계층적 데이터의 비중 */}
                <div style={{ ...style.card, minHeight: '300px' }}>
                    <h2 style={style.chartTitle}>7. Product Category Hierarchy (Treemap)</h2>
                    <div style={style.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <Treemap
                                data={treemapData}
                                dataKey="size"
                                stroke="#fff"
                                aspectRatio={4 / 3}
                                content={<CustomizedTreemapContent />}
                            />
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 8. Combined Chart (복합 차트) - 라인과 바 차트 결합 */}
                <div style={style.card}>
                    <h2 style={style.chartTitle}>8. Sales Volume & Price (Combined Chart)</h2>
                    <div style={style.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" name="수익" />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" name="판매량" />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="평균 수익" />
                                <Line yAxisId="right" type="monotone" dataKey="sales" stroke="#82ca9d" name="월별 판매량" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
    );
}

export default SellerPage;