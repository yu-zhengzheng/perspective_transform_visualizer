/**
 * Canvas 渲染器 - 负责绘制坐标系、网格和变换后的图形
 */

class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // 配置
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.scale = 50; // 像素/单位长度
        
        // 网格配置
        this.gridSize = 50;
        this.gridColor = 'rgba(42, 64, 96, 0.5)';
        this.axisColor = 'rgba(74, 144, 217, 0.8)';
        
        // 当前变换矩阵
        this.currentMatrix = Matrix3.identity();
        
        // 当前形状
        this.currentShape = 'square';
    }

    /**
     * 清空画布
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * 世界坐标转屏幕坐标
     * @param {number} x - 世界X坐标
     * @param {number} y - 世界Y坐标
     * @returns {Object} 屏幕坐标
     */
    worldToScreen(x, y) {
        return {
            x: this.centerX + x * this.scale,
            y: this.centerY - y * this.scale // Y轴向上为正
        };
    }

    /**
     * 屏幕坐标转世界坐标
     * @param {number} screenX - 屏幕X坐标
     * @param {number} screenY - 屏幕Y坐标
     * @returns {Object} 世界坐标
     */
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.centerX) / this.scale,
            y: -(screenY - this.centerY) / this.scale
        };
    }

    /**
     * 绘制网格
     */
    drawGrid() {
        const ctx = this.ctx;
        
        ctx.strokeStyle = this.gridColor;
        ctx.lineWidth = 1;
        
        // 垂直线
        for (let x = this.centerX % this.gridSize; x < this.width; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        
        // 水平线
        for (let y = this.centerY % this.gridSize; y < this.height; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
        
        // 坐标轴
        ctx.strokeStyle = this.axisColor;
        ctx.lineWidth = 2;
        
        // X轴
        ctx.beginPath();
        ctx.moveTo(0, this.centerY);
        ctx.lineTo(this.width, this.centerY);
        ctx.stroke();
        
        // Y轴
        ctx.beginPath();
        ctx.moveTo(this.centerX, 0);
        ctx.lineTo(this.centerX, this.height);
        ctx.stroke();
        
        // 轴标签
        ctx.fillStyle = this.axisColor;
        ctx.font = '14px "Segoe UI", sans-serif';
        ctx.fillText('X', this.width - 20, this.centerY - 10);
        ctx.fillText('Y', this.centerX + 10, 20);
        
        // 刻度
        ctx.fillStyle = 'rgba(74, 144, 217, 0.5)';
        ctx.font = '11px "Segoe UI", sans-serif';
        
        for (let i = -5; i <= 5; i++) {
            if (i === 0) continue;
            
            const x = this.centerX + i * this.scale;
            const y = this.centerY - i * this.scale;
            
            // X轴刻度
            ctx.fillText(i.toString(), x - 4, this.centerY + 20);
            
            // Y轴刻度
            ctx.fillText(i.toString(), this.centerX - 20, y + 4);
        }
    }

    /**
     * 应用变换矩阵到点 (正确处理透视除法)
     * @param {Object} point - {x, y}
     * @param {Matrix3} matrix - 变换矩阵
     * @returns {Object} 变换后的点 {x, y}
     */
    transformPoint(point, matrix) {
        const x = point.x;
        const y = point.y;

        // 齐次坐标变换
        const X = matrix.get(0, 0) * x + matrix.get(0, 1) * y + matrix.get(0, 2);
        const Y = matrix.get(1, 0) * x + matrix.get(1, 1) * y + matrix.get(1, 2);
        const W = matrix.get(2, 0) * x + matrix.get(2, 1) * y + matrix.get(2, 2);

        // 透视除法: 将齐次坐标转回笛卡尔坐标
        // 当 W ≠ 1 时，产生透视效果
        if (Math.abs(W) > 0.0001) {
            return { x: X / W, y: Y / W };
        } else {
            // 避免除以0
            return { x: X, y: Y };
        }
    }

    /**
     * 获取预设形状的顶点
     * @param {string} shape - 形状名称
     * @returns {Array} 顶点数组 [{x, y}, ...]
     */
    getShapeVertices(shape) {
        const shapes = {
            square: [
                {x: -1, y: -1},
                {x: 1, y: -1},
                {x: 1, y: 1},
                {x: -1, y: 1}
            ],
            triangle: [
                {x: 0, y: 1.2},
                {x: -1, y: -0.8},
                {x: 1, y: -0.8}
            ],
            star: this.generateStarVertices(5, 1, 0.4),
            house: [
                {x: -1, y: -1},
                {x: 1, y: -1},
                {x: 1, y: 0},
                {x: 0, y: 1},
                {x: -1, y: 0}
            ]
        };

        return shapes[shape] || shapes.square;
    }

    /**
     * 生成五角星顶点
     */
    generateStarVertices(points, outerRadius, innerRadius) {
        const vertices = [];
        const angleStep = Math.PI / points;

        for (let i = 0; i < 2 * points; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = i * angleStep - Math.PI / 2;
            vertices.push({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle)
            });
        }

        return vertices;
    }

    /**
     * 绘制形状
     * @param {Array} vertices - 顶点数组
     * @param {Matrix3} transform - 变换矩阵
     * @param {Object} options - 绘制选项
     */
    drawShape(vertices, transform, options = {}) {
        const ctx = this.ctx;
        const defaultOptions = {
            fillColor: 'rgba(74, 144, 217, 0.3)',
            strokeColor: '#4a90d9',
            lineWidth: 2,
            showOriginal: true,
            originalColor: 'rgba(100, 100, 100, 0.3)'
        };

        const opts = {...defaultOptions, ...options};

        // 变换所有顶点
        const transformedVertices = vertices.map(v => 
            this.transformPoint(v, transform)
        );

        // 绘制原始形状 (半透明)
        if (opts.showOriginal) {
            ctx.beginPath();
            const firstOriginal = this.worldToScreen(vertices[0].x, vertices[0].y);
            ctx.moveTo(firstOriginal.x, firstOriginal.y);
            
            for (let i = 1; i < vertices.length; i++) {
                const p = this.worldToScreen(vertices[i].x, vertices[i].y);
                ctx.lineTo(p.x, p.y);
            }
            ctx.closePath();
            ctx.fillStyle = opts.originalColor;
            ctx.fill();
        }

        // 绘制变换后的形状
        ctx.beginPath();
        const first = this.worldToScreen(transformedVertices[0].x, transformedVertices[0].y);
        ctx.moveTo(first.x, first.y);
        
        for (let i = 1; i < transformedVertices.length; i++) {
            const p = this.worldToScreen(transformedVertices[i].x, transformedVertices[i].y);
            ctx.lineTo(p.x, p.y);
        }
        
        ctx.closePath();
        ctx.fillStyle = opts.fillColor;
        ctx.fill();
        ctx.strokeStyle = opts.strokeColor;
        ctx.lineWidth = opts.lineWidth;
        ctx.stroke();

        // 绘制顶点
        ctx.fillStyle = opts.strokeColor;
        transformedVertices.forEach(v => {
            const p = this.worldToScreen(v.x, v.y);
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    /**
     * 绘制变换矩阵的可视化表示
     * @param {Matrix3} matrix - 变换矩阵
     * @param {number} x - 绘制位置X
     * @param {number} y - 绘制位置Y
     */
    drawMatrixVisual(matrix, x, y) {
        const ctx = this.ctx;
        const size = 40;
        const gap = 5;
        
        // 基向量颜色
        const colors = ['#ff6b6b', '#4ecdc4'];
        
        for (let i = 0; i < 2; i++) {
            const vx = matrix.get(0, i);
            const vy = matrix.get(1, i);
            
            const startX = x + i * (size + gap);
            const startY = y + size / 2;
            const endX = startX + vx * size * 0.4;
            const endY = startY - vy * size * 0.4;
            
            // 绘制基向量
            ctx.strokeStyle = colors[i];
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            // 箭头
            const angle = Math.atan2(startY - endY, endX - startX);
            const arrowLength = 8;
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(
                endX - arrowLength * Math.cos(angle - Math.PI / 6),
                endY + arrowLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(endX, endY);
            ctx.lineTo(
                endX - arrowLength * Math.cos(angle + Math.PI / 6),
                endY + arrowLength * Math.sin(angle + Math.PI / 6)
            );
            ctx.stroke();
        }
    }

    /**
     * 主渲染函数
     * @param {Matrix3} transform - 当前变换矩阵
     */
    render(transform) {
        this.clear();
        this.drawGrid();
        
        // 获取当前形状
        const vertices = this.getShapeVertices(this.currentShape);
        
        // 绘制变换后的形状
        this.drawShape(vertices, transform, {
            fillColor: 'rgba(74, 144, 217, 0.3)',
            strokeColor: '#4a90d9',
            lineWidth: 2,
            showOriginal: true,
            originalColor: 'rgba(100, 100, 100, 0.2)'
        });
    }
}
