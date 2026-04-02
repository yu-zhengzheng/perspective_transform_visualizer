/**
 * UI 控制器 - 8参数透视变换
 */

class UIController {
    constructor(renderer) {
        this.renderer = renderer;
        // 8个参数: tx, ty, rotate, sx, sy, shx, shy, p1, p2
        this.params = { tx: 0, ty: 0, rotate: 0, sx: 1, sy: 1, shx: 0, shy: 0, p1: 0, p2: 0 };
        this.currentMatrix = Matrix3.identity();
        this.init();
    }

    init() {
        // 绑定所有滑块
        ['tx', 'ty', 'rotate', 'sx', 'sy', 'shx', 'shy', 'p1', 'p2'].forEach(id => {
            this.bindSlider(id, 'val-' + id, id === 'rotate' ? '°' : '');
        });

        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('animateBtn').addEventListener('click', () => this.animate());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportMatrix());

        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderer.currentShape = e.target.dataset.shape;
                this.update();
            });
        });

        this.renderer.canvas.addEventListener('mousemove', (e) => {
            const rect = this.renderer.canvas.getBoundingClientRect();
            const world = this.renderer.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
            document.getElementById('mouseCoords').textContent = `鼠标: (${world.x.toFixed(2)}, ${world.y.toFixed(2)})`;
        });

        this.update();
    }

    bindSlider(id, valueId, suffix = '') {
        const slider = document.getElementById(id);
        const valueSpan = document.getElementById(valueId);
        if (!slider) return;
        slider.addEventListener('input', (e) => {
            this.params[id] = parseFloat(e.target.value);
            if (valueSpan) valueSpan.textContent = this.params[id] + suffix;
            this.update();
        });
    }

    update() {
        let matrix = Matrix3.identity();
        
        // 1. 平移
        matrix = matrix.multiply(Matrix3.translation(this.params.tx / this.renderer.scale, this.params.ty / this.renderer.scale));
        
        // 2. 旋转
        if (this.params.rotate !== 0) matrix = matrix.multiply(Matrix3.rotation(this.params.rotate));
        
        // 3. 缩放
        if (this.params.sx !== 1 || this.params.sy !== 1) matrix = matrix.multiply(Matrix3.scaling(this.params.sx, this.params.sy));
        
        // 4. 剪切
        if (this.params.shx !== 0) matrix = matrix.multiply(Matrix3.shearX(this.params.shx));
        if (this.params.shy !== 0) matrix = matrix.multiply(Matrix3.shearY(this.params.shy));
        
        // 5. 透视变换 (关键！)
        if (this.params.p1 !== 0 || this.params.p2 !== 0) {
            matrix = matrix.multiply(Matrix3.perspective(this.params.p1, this.params.p2));
        }

        this.currentMatrix = matrix;
        this.renderer.currentMatrix = matrix;
        this.updateMatrixDisplay();
        this.renderer.render(matrix);
    }

    updateMatrixDisplay() {
        const container = document.getElementById('matrix-display');
        const m = this.currentMatrix;
        container.innerHTML = `
            <div class="matrix-row"><span>${m.get(0,0).toFixed(3)}</span><span>${m.get(0,1).toFixed(3)}</span><span>${m.get(0,2).toFixed(3)}</span></div>
            <div class="matrix-row"><span>${m.get(1,0).toFixed(3)}</span><span>${m.get(1,1).toFixed(3)}</span><span>${m.get(1,2).toFixed(3)}</span></div>
            <div class="matrix-row"><span class="persp">${m.get(2,0).toFixed(3)}</span><span class="persp">${m.get(2,1).toFixed(3)}</span><span>${m.get(2,2).toFixed(3)}</span></div>
        `;
    }

    reset() {
        this.params = { tx: 0, ty: 0, rotate: 0, sx: 1, sy: 1, shx: 0, shy: 0, p1: 0, p2: 0 };
        ['tx', 'ty', 'shx', 'shy', 'p1', 'p2'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = 0;
        });
        ['sx', 'sy'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = 1;
        });
        document.getElementById('rotate').value = 0;
        
        ['tx', 'ty', 'rotate', 'shx', 'shy', 'p1', 'p2'].forEach(id => {
            const el = document.getElementById('val-' + id);
            if (el) el.textContent = (id === 'rotate' ? '0°' : '0');
        });
        ['sx', 'sy'].forEach(id => {
            const el = document.getElementById('val-' + id);
            if (el) el.textContent = '1';
        });
        
        this.update();
    }

    animate() {
        let start = null;
        const duration = 2000;
        const initialParams = {...this.params};
        
        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            
            this.params.rotate = initialParams.rotate + 360 * ease;
            const el = document.getElementById('rotate');
            if (el) el.value = this.params.rotate % 360;
            const vel = document.getElementById('val-rotate');
            if (vel) vel.textContent = Math.round(this.params.rotate % 360) + '°';
            
            this.update();
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    exportMatrix() {
        const m = this.currentMatrix;
        const code = `// 8参数透视变换矩阵\nconst transform = new Matrix3([\n    ${m.get(0,0).toFixed(6)}, ${m.get(0,1).toFixed(6)}, ${m.get(0,2).toFixed(6)},\n    ${m.get(1,0).toFixed(6)}, ${m.get(1,1).toFixed(6)}, ${m.get(1,2).toFixed(6)},\n    ${m.get(2,0).toFixed(6)}, ${m.get(2,1).toFixed(6)}, ${m.get(2,2).toFixed(6)}\n]);`;
        navigator.clipboard.writeText(code).then(() => alert('矩阵代码已复制到剪贴板！'));
    }
}
